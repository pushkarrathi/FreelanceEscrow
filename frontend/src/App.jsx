import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import {
  isValidAddress,
  isValidAmount,
  isValidProjectId
} from "./validation";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import WalletConnection from "./components/WalletConnection";
import AcceptProject from "./components/AcceptProject";
import FundEscrow from "./components/FundEscrow";
import SubmitWork from "./components/SubmitWork";
import ApproveWork from "./components/ApproveWork";
import ProjectDetails from "./components/ProjectDetails";
import RaiseDispute from "./components/RaiseDispute";
import ResolveDispute from "./components/ResolveDispute";
import { getContract } from "./contractService";
import CreateProject from "./components/CreateProject";
import { getErrorMessage } from "./errorHandler";

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [role, setRole] = useState("");
  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [acceptProjectId, setAcceptProjectId] = useState("");
  const [fundProjectId, setFundProjectId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [submitProjectId, setSubmitProjectId] = useState("");
  const [approveProjectId, setApproveProjectId] = useState("");
  const [viewProjectId, setViewProjectId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  const [disputeProjectId, setDisputeProjectId] = useState("");
  const [resolveProjectId, setResolveProjectId] = useState("");
  const [resolution, setResolution] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0];
    setAccount(address);
    const balanceWei = await provider.getBalance(address);
    setBalance(ethers.formatEther(balanceWei));
    const contract = await getContract();
    const arbitrator = await contract.arbitrator();

    if (address.toLowerCase() === arbitrator.toLowerCase()) {
      setRole("arbitrator");
    } else {
      setRole("user");
    }
  }
  async function createProject() {
    if (!account) {
      alert("Connect MetaMask first");
      return;
    }
    if (!freelancer || !amount || !description) {
      alert("Enter freelancer address, amount and description");
      return;
    }
    if (!isValidAddress(freelancer)) {
      alert("Enter a valid Ethereum wallet address");
      return;
    }

    if (!isValidAmount(amount)) {
      alert("Enter a valid ETH amount greater than zero");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.createProject(
          freelancer,
          ethers.parseEther(amount),
          description
      );
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      const receipt = await tx.wait();
      setTransactionStatus("Transaction successful");
      const event = receipt.logs
          .map((log) => {
            try {
              return contract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((event) => event && event.name === "ProjectCreated");
      if (event) {
        setProjectId(event.args.projectId.toString());
      }
      alert("Project created successfully");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }
  async function acceptProject() {
    if (!isValidProjectId(selectedProjectId)) {
      alert("Enter a valid project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.acceptProject(selectedProjectId);
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTransactionStatus("Transaction successful");
      alert("Project accepted successfully");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }
  async function fundEscrow() {
    if (!isValidProjectId(selectedProjectId)) {
      alert("Enter a valid project ID");
      return;
    }
    if (!isValidAmount(fundAmount)) {
      alert("Enter a valid ETH amount greater than zero");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.fundEscrow(selectedProjectId, {
        value: ethers.parseEther(fundAmount)
      });
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTransactionStatus("Transaction successful");
      alert("Escrow funded successfully");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }
  async function submitWork() {
    if (!isValidProjectId(selectedProjectId)) {
      alert("Enter a valid project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.submitWork(selectedProjectId);
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTransactionStatus("Transaction successful");
      alert("Work submitted successfully");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }
  async function approveWork() {
    if (!isValidProjectId(selectedProjectId)) {
      alert("Enter a valid project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.approveWork(selectedProjectId);
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTransactionStatus("Transaction successful");
      alert("Work approved and payment released");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }
  async function getProjectDetails() {
    if (!isValidProjectId(viewProjectId)) {
      alert("Enter a valid project ID");
      return;
    }
    try {
      setSelectedProjectId(viewProjectId);
      await getActivityHistory(viewProjectId);
      const contract = await getContract();
      const project = await contract.getProject(viewProjectId);
      const statuses = [
        "Created",
        "Accepted",
        "Funded",
        "Work Submitted",
        "Completed",
        "Refunded",
        "Disputed",
        "Dispute Resolved"
      ];
      const arbitrator = await contract.arbitrator();

      const projectRole =
          account.toLowerCase() === arbitrator.toLowerCase()
              ? "arbitrator"
              : account.toLowerCase() === project[0].toLowerCase()
                  ? "client"
                  : account.toLowerCase() === project[1].toLowerCase()
                      ? "freelancer"
                      : "other";
      setProjectDetails({
        client: project[0],
        freelancer: project[1],
        amount: ethers.formatEther(project[2]),
        description: project[3],
        status: statuses[Number(project[4])],
        role: projectRole
      });
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error));
    }
  }
  async function getActivityHistory(projectId) {
    try {
      const contract = await getContract();
      const events = [];

      events.push(...await contract.queryFilter(contract.filters.ProjectCreated()));
      events.push(...await contract.queryFilter(contract.filters.ProjectAccepted()));
      events.push(...await contract.queryFilter(contract.filters.EscrowFunded()));
      events.push(...await contract.queryFilter(contract.filters.WorkSubmitted()));
      events.push(...await contract.queryFilter(contract.filters.PaymentReleased()));
      events.push(...await contract.queryFilter(contract.filters.RefundIssued()));
      events.push(...await contract.queryFilter(contract.filters.DisputeRaised()));
      events.push(...await contract.queryFilter(contract.filters.DisputeResolved()));      const activities = [];

      for (const event of events) {
        if (!event.args || event.args.projectId === undefined) {
          continue;
        }
        if (event.args.projectId.toString() !== projectId.toString()) {
          continue;
        }
        const eventNames = {
          ProjectCreated: "Project Created",
          ProjectAccepted: "Project Accepted",
          EscrowFunded: "Escrow Funded",
          WorkSubmitted: "Work Submitted",
          PaymentReleased: "Payment Released",
          RefundIssued: "Refund Issued",
          DisputeRaised: "Dispute Raised",
          DisputeResolved: "Dispute Resolved"
        };

        const block = await event.getBlock();

        activities.push({
          name: eventNames[event.fragment?.name] || "Unknown Event",
          blockNumber: event.blockNumber,
          timestamp: block.timestamp
        });
      }

      activities.sort((a, b) => a.blockNumber - b.blockNumber);
      setActivityHistory(activities);
    } catch (error) {
      console.error(error);
      setActivityHistory([]);
    }
  }
  async function raiseDispute() {
    if (!isValidProjectId(selectedProjectId)) {
      alert("Enter a valid project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.raiseDispute(selectedProjectId);
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTransactionStatus("Transaction successful");
      alert("Dispute raised successfully");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }
  async function resolveDispute() {
    if (!isValidProjectId(resolveProjectId) || !resolution) {
      alert("Enter a valid project ID and resolution");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const freelancerWins = resolution === "freelancer";
      const tx = await contract.resolveDispute(
          resolveProjectId,
          freelancerWins
      );
      setTransactionStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setTransactionStatus("Transaction successful");
      alert("Dispute resolved successfully");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Transaction failed");
      alert(getErrorMessage(error));
    }
  }


  return (
      <div className="app">
        <div className="header">
          <h1>Freelance Escrow</h1>
        </div>

        <div className="wallet">
          <WalletConnection
              account={account}
              balance={balance}
              onConnect={connectWallet}
          />
        </div>

        {account && role && (
            <div className="wallet">
              <strong>Role:</strong> {role}
            </div>
        )}

        {transactionStatus && (
            <div className="transaction-status">
              {transactionStatus}
            </div>
        )}

        {account && (
            <div className="dashboard">

              <div className="card">
                <CreateProject
                    freelancer={freelancer}
                    setFreelancer={setFreelancer}
                    amount={amount}
                    setAmount={setAmount}
                    description={description}
                    setDescription={setDescription}
                    projectId={projectId}
                    onCreate={createProject}
                />
              </div>

              {projectDetails?.role === "freelancer" && projectDetails?.status === "Created" && (
                  <div className="card">
                    <AcceptProject
                        projectId={selectedProjectId}
                        setProjectId={setSelectedProjectId}
                        onAccept={acceptProject}
                    />
                  </div>
              )}

              {projectDetails?.role === "client" && projectDetails?.status === "Accepted" && (
                  <div className="card">
                    <FundEscrow
                        projectId={selectedProjectId}
                        setProjectId={setSelectedProjectId}
                        amount={fundAmount}
                        setAmount={setFundAmount}
                        onFund={fundEscrow}
                    />
                  </div>
              )}

              {projectDetails?.role === "freelancer" && projectDetails?.status === "Funded" && (
                  <div className="card">
                    <SubmitWork
                        projectId={selectedProjectId}
                        setProjectId={setSelectedProjectId}
                        onSubmit={submitWork}
                    />
                  </div>
              )}

              {projectDetails?.role === "client" && projectDetails?.status === "Work Submitted" && (
                  <div className="card">
                    <ApproveWork
                        projectId={selectedProjectId}
                        setProjectId={setSelectedProjectId}
                        onApprove={approveWork}
                    />
                  </div>
              )}

              <div className="card">
                <ProjectDetails
                    projectId={viewProjectId}
                    setProjectId={setViewProjectId}
                    projectDetails={projectDetails}
                    activityHistory={activityHistory}
                    onView={getProjectDetails}
                />
              </div>

              {(projectDetails?.role === "client" || projectDetails?.role === "freelancer") &&
                  projectDetails?.status === "Work Submitted" && (
                  <div className="card">
                    <RaiseDispute
                        projectId={selectedProjectId}
                        setProjectId={setDisputeProjectId}
                        onRaise={raiseDispute}
                    />
                  </div>
              )}

              {role === "arbitrator" && (
                  <div className="card">
                    <ResolveDispute
                        projectId={resolveProjectId}
                        setProjectId={setResolveProjectId}
                        resolution={resolution}
                        setResolution={setResolution}
                        onResolve={resolveDispute}
                    />
                  </div>
              )}

            </div>
        )}
      </div>
  );
}

export default App;