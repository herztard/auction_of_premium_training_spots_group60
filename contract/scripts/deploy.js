const hre = require("hardhat");

async function main() {
  console.log("Deploying TrainingSpotNFT contract...");

  const TrainingSpotNFT = await hre.ethers.getContractFactory("TrainingSpotNFT");
  const trainingSpotNFT = await TrainingSpotNFT.deploy();

  await trainingSpotNFT.waitForDeployment();
  
  const address = await trainingSpotNFT.getAddress();
  console.log(`TrainingSpotNFT deployed to: ${address}`);

  console.log("Wait for 5 block confirmations...");
  await trainingSpotNFT.deploymentTransaction().wait(5);
  
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 