const { ethers } = require("hardhat");

async function main() {
  const Avalol = await ethers.deployContract("contracts/Lock.sol:MEMANIA");
  const avalol = await Avalol.waitForDeployment();
  console.log("Deploying Contract...")
  console.log("Contract deployed to address:",  await avalol.getAddress());
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });