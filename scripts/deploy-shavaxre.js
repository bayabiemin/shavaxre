const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "AVAX");

  const treasury = deployer.address;
  const ShaVaxRe = await hre.ethers.getContractFactory("ShaVaxRe");
  const contract = await ShaVaxRe.deploy(treasury);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ShaVaxRe deployed to:", address);
  console.log("Treasury:", treasury);
  console.log("Sonra src/lib/contract.ts icinde CONTRACT_ADDRESS guncelle");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
