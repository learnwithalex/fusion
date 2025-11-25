const hre = require("hardhat");

async function main() {
    console.log("Deploying FusionMarketplace...");

    // Get signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Origin Protocol IpNFT contract address on Basecamp
    const ORIGIN_IPNFT_ADDRESS = "0xB53F5723Dd4E46da32e1769Bd36A5aD880e707A5";

    const FusionMarketplace = await hre.ethers.getContractFactory("FusionMarketplace", deployer);
    const marketplace = await FusionMarketplace.deploy(ORIGIN_IPNFT_ADDRESS);

    await marketplace.waitForDeployment();

    const address = await marketplace.getAddress();
    console.log("FusionMarketplace deployed to:", address);

    console.log("\n=== Deployment Summary ===");
    console.log("Contract Address:", address);
    console.log("Origin IpNFT Address:", ORIGIN_IPNFT_ADDRESS);
    console.log("Network:", hre.network.name);
    console.log("Deployer:", deployer.address);

    console.log("\n=== Next Steps ===");
    console.log("1. Save the contract address");
    console.log("2. Export the ABI from artifacts/contracts/FusionMarketplace.sol/FusionMarketplace.json");
    console.log("3. Update backend with contract address and ABI");
    console.log("4. Transfer ownership to protocol address if needed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
