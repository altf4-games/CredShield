const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying AcademicVerifier contract...');

  const AcademicVerifier = await ethers.getContractFactory('AcademicVerifier');
  const verifier = await AcademicVerifier.deploy();
  
  await verifier.waitForDeployment();
  
  const address = await verifier.getAddress();

  console.log(`AcademicVerifier deployed to: ${address}`);
  console.log('Deployment successful!');

  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
