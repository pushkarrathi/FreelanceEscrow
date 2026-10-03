import hre from "hardhat";

const { ethers } = await hre.network.getOrCreate();

async function main() {
    const Escrow = await ethers.getContractFactory("FreelanceEscrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
    console.log("FreelanceEscrow deployed to:", await escrow.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});