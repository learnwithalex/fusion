import { Router } from "express";
import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import { createPublicClient, http } from "viem";
import crypto from "crypto";
import { campnetwork } from "../lib/campnetwork";

const router = Router();

// Public client for signature verification (using mainnet as default, adjust as needed)
const publicClient = createPublicClient({
    chain: campnetwork,
    transport: http(),
});

// Generate Nonce
router.post("/nonce", async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    const nonce = crypto.randomBytes(16).toString("hex");

    // Check if user exists, if not create one with just the wallet address
    // Or just update the nonce if they exist
    const existingUser = await db.select().from(users).where(eq(users.walletAddress, walletAddress));

    if (existingUser.length > 0) {
        await db.update(users).set({ nonce }).where(eq(users.walletAddress, walletAddress));
    } else {
        await db.insert(users).values({ walletAddress, nonce });
    }

    res.json({ nonce });
});

// Verify Signature & Login
router.post("/verify", async (req, res) => {
    const { walletAddress, signature, nonce } = req.body;

    if (!walletAddress || !signature || !nonce) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const userResult = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
        const user = userResult[0];

        if (!user || user.nonce !== nonce) {
            return res.status(401).json({ error: "Invalid nonce or user not found" });
        }

        // Verify signature using viem
        const message = `Sign this message to login to Fusion. Nonce: ${nonce}`;
        const valid = await publicClient.verifyMessage({
            address: walletAddress as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
        });

        if (!valid) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Create Session
        const token = crypto.randomBytes(32).toString("hex");
        await db.insert(sessions).values({
            userId: user.id,
            token,
            isValid: true,
        });

        // Clear nonce to prevent replay
        await db.update(users).set({ nonce: null }).where(eq(users.id, user.id));

        res.json({ token, user });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
