import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.getOrCreate();

describe("FreelanceEscrow", function () {
    async function deployContract() {
        const [client, freelancer, other] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("FreelanceEscrow");
        const escrow = await Escrow.deploy();
        return { escrow, client, freelancer, other };
    }

    it("should create a project", async function () {
        const { escrow, client, freelancer } = await deployContract();
        const amount = ethers.parseEther("0.1");

        await escrow.createProject(freelancer.address, amount);

        const project = await escrow.getProject(0);

        expect(project[0]).to.equal(client.address);
        expect(project[1]).to.equal(freelancer.address);
        expect(project[2]).to.equal(amount);
        expect(project[3]).to.equal(0);
    });

    it("should allow freelancer to accept the project", async function () {
        const { escrow, freelancer } = await deployContract();
        const amount = ethers.parseEther("0.1");

        await escrow.createProject(freelancer.address, amount);
        await escrow.connect(freelancer).acceptProject(0);

        const project = await escrow.getProject(0);

        expect(project[3]).to.equal(1);
    });

    it("should allow client to fund the escrow", async function () {
        const { escrow, client, freelancer } = await deployContract();
        const amount = ethers.parseEther("0.1");

        await escrow.createProject(freelancer.address, amount);
        await escrow.connect(freelancer).acceptProject(0);
        await escrow.connect(client).fundEscrow(0, {
            value: amount
        });

        const balance = await ethers.provider.getBalance(escrow.target);

        expect(balance).to.equal(amount);
    });

    it("should release payment after work approval", async function () {
        const { escrow, client, freelancer } = await deployContract();
        const amount = ethers.parseEther("0.1");

        await escrow.createProject(freelancer.address, amount);
        await escrow.connect(freelancer).acceptProject(0);
        await escrow.connect(client).fundEscrow(0, {
            value: amount
        });
        await escrow.connect(freelancer).submitWork(0);

        const balanceBefore = await ethers.provider.getBalance(
            freelancer.address
        );

        await escrow.connect(client).approveWork(0);

        const balanceAfter = await ethers.provider.getBalance(
            freelancer.address
        );

        expect(balanceAfter - balanceBefore).to.equal(amount);

        const project = await escrow.getProject(0);

        expect(project[3]).to.equal(4);
    });

    it("should allow the client to receive a refund", async function () {
        const { escrow, client, freelancer } = await deployContract();
        const amount = ethers.parseEther("0.1");

        await escrow.createProject(freelancer.address, amount);
        await escrow.connect(freelancer).acceptProject(0);
        await escrow.connect(client).fundEscrow(0, {
            value: amount
        });

        const balanceBefore = await ethers.provider.getBalance(
            client.address
        );

        const tx = await escrow.connect(client).refund(0);
        const receipt = await tx.wait();

        const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

        const balanceAfter = await ethers.provider.getBalance(
            client.address
        );

        expect(balanceAfter + gasUsed - balanceBefore).to.equal(amount);

        const project = await escrow.getProject(0);

        expect(project[3]).to.equal(5);
    });

    it("should reject incorrect funding amount", async function () {
        const { escrow, client, freelancer } = await deployContract();
        const amount = ethers.parseEther("0.1");
        const wrongAmount = ethers.parseEther("0.05");

        await escrow.createProject(freelancer.address, amount);
        await escrow.connect(freelancer).acceptProject(0);

        await expect(
            escrow.connect(client).fundEscrow(0, {
                value: wrongAmount
            })
        ).to.be.revertedWith("Incorrect ETH amount");
    });

    it("should prevent another user from approving the work", async function () {
        const { escrow, client, freelancer, other } = await deployContract();
        const amount = ethers.parseEther("0.1");

        await escrow.createProject(freelancer.address, amount);
        await escrow.connect(freelancer).acceptProject(0);
        await escrow.connect(client).fundEscrow(0, {
            value: amount
        });
        await escrow.connect(freelancer).submitWork(0);

        await expect(
            escrow.connect(other).approveWork(0)
        ).to.be.revertedWith("Only client can perform this action");
    });
});