import hre from "hardhat";

const { ethers } = await hre.network.getOrCreate();

async function main() {
    const [client, freelancer, arbitrator] = await ethers.getSigners();

    const Escrow = await ethers.getContractFactory("FreelanceEscrow");

    const escrow = await Escrow.deploy(arbitrator.address);

    await escrow.waitForDeployment();

    console.log("FreelanceEscrow deployed to:", await escrow.getAddress());
    console.log("Arbitrator:", arbitrator.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});