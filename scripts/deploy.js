const hre = require("hardhat");

async function main() {
    console.log("📚 Deploying Sha(vax)re to", hre.network.name, "...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("🔑 Deployer:", deployer.address);

    const Shavaxre = await hre.ethers.getContractFactory("ShaVaxRe");
    const contract = await Shavaxre.deploy(deployer.address); // treasury = deployer
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Sha(vax)re deployed to:", address);
    console.log("🔗 Network:", hre.network.name);
    console.log("");
    console.log("Next steps:");
    console.log("  1. Copy the contract address above");
    console.log("  2. Update src/lib/contract.ts with the deployed address");
    console.log("  3. Run `npx hardhat verify --network fuji", address + "`");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
