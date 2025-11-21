import { useState, useEffect } from 'react';
import { useAuth, useAuthState } from '@campnetwork/origin/react';

export function useBackendAuth() {
    const auth = useAuth();
    // useAuthState only returns { authenticated, loading }
    const { authenticated } = useAuthState();
    const [token, setToken] = useState<string | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const storedToken = localStorage.getItem('fusion_auth_token');
            const storedAddress = localStorage.getItem('fusion_wallet_address');

            if (storedToken) {
                setToken(storedToken);
            } else {
                setToken(null);
            }

            if (storedAddress) {
                try {
                    // Simple obfuscation to prevent accidental malforming
                    const decoded = atob(storedAddress);
                    setWalletAddress(decoded);
                } catch (e) {
                    console.error("Failed to decode wallet address", e);
                    setWalletAddress(null);
                }
            } else {
                setWalletAddress(null);
            }
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        window.addEventListener('fusion-auth-update', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('fusion-auth-update', checkAuth);
        };
    }, []);

    const login = async (address: string) => {
        if (!address) return null;
        setIsAuthenticating(true);

        try {
            // 1. Get Nonce
            const nonceRes = await fetch('http://localhost:3001/auth/nonce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address }),
            });
            const { nonce } = await nonceRes.json();

            // 2. Sign Nonce
            if (!window.ethereum) throw new Error("No wallet found");

            // Find the correct provider for the address
            let provider = window.ethereum as any;
            let targetAccount: string | undefined;

            if (provider.providers) {
                // Check multiple injected providers
                for (const p of provider.providers) {
                    try {
                        const accounts = await p.request({ method: 'eth_accounts' });
                        console.log("Accounts:", accounts);
                        if (accounts.some((a: string) => a.toLowerCase() === address.toLowerCase())) {
                            provider = p;
                            targetAccount = accounts.find((a: string) => a.toLowerCase() === address.toLowerCase());
                            break;
                        }
                    } catch (e) {
                        console.warn("Error checking provider:", e);
                    }
                }
            }

            // Fallback to checking the main provider if not found in sub-providers
            if (!targetAccount) {
                try {
                    const accounts = await provider.request({ method: 'eth_requestAccounts' });
                    targetAccount = accounts.find((acc: string) => acc.toLowerCase() === address.toLowerCase());
                } catch (e) {
                    console.warn("Error requesting accounts from main provider:", e);
                }
            }

            if (!targetAccount) {
                console.warn("Could not find provider for address:", address);
                throw new Error(`Please ensure wallet ${address} is active and connected.`);
            }

            const message = `Sign this message to login to Fusion. Nonce: ${nonce}`;
            const hexMessage = "0x" + Array.from(message).map(c => c.charCodeAt(0).toString(16)).join('');
            console.log("Signing message:", message, "Hex:", hexMessage, "Address:", address, "Provider:", provider);

            const signature = await provider.request({
                method: 'personal_sign',
                params: [hexMessage, address],
            });

            // 3. Verify & Login
            const verifyRes = await fetch('http://localhost:3001/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: address,
                    signature,
                    nonce,
                }),
            });

            const data = await verifyRes.json();
            if (data.token) {
                localStorage.setItem('fusion_auth_token', data.token);
                // Store address with simple obfuscation
                localStorage.setItem('fusion_wallet_address', btoa(address));

                setToken(data.token);
                setWalletAddress(address);

                // Dispatch custom event for same-window updates
                window.dispatchEvent(new Event('fusion-auth-update'));
                return data.token;
            }
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsAuthenticating(false);
        }
        return null;
    };

    const logout = () => {
        localStorage.removeItem('fusion_auth_token');
        localStorage.removeItem('fusion_wallet_address');
        setToken(null);
        setWalletAddress(null);
        window.dispatchEvent(new Event('fusion-auth-update'));
    };

    return { token, walletAddress, login, logout, isAuthenticated: !!token, isAuthenticating };
}
