import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
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
  const [freelancer, setFreelancer] = useState("");
  const [amount, setAmount] = useState("");
  const [projectId, setProjectId] = useState("");
  const [acceptProjectId, setAcceptProjectId] = useState("");
  const [fundProjectId, setFundProjectId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [submitProjectId, setSubmitProjectId] = useState("");
  const [approveProjectId, setApproveProjectId] = useState("");
  const [viewProjectId, setViewProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
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
  }
  async function createProject() {
    if (!account) {
      alert("Connect MetaMask first");
      return;
    }
    if (!freelancer || !amount) {
      alert("Enter freelancer address and amount");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.createProject(
          freelancer,
          ethers.parseEther(amount)
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
    if (!acceptProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.acceptProject(acceptProjectId);
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
    if (!fundProjectId || !fundAmount) {
      alert("Enter project ID and amount");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.fundEscrow(fundProjectId, {
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
    if (!submitProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.submitWork(submitProjectId);
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
    if (!approveProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.approveWork(approveProjectId);
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
    if (!viewProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
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
      setProjectDetails({
        client: project[0],
        freelancer: project[1],
        amount: ethers.formatEther(project[2]),
        status: statuses[Number(project[3])]
      });
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error));
    }
  }
  async function raiseDispute() {
    if (!disputeProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const contract = await getContract();
      setTransactionStatus("Waiting for MetaMask approval...");
      const tx = await contract.raiseDispute(disputeProjectId);
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
    if (!resolveProjectId || !resolution) {
      alert("Enter project ID and resolution");
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
                    projectId={projectId}
                    onCreate={createProject}
                />
              </div>

              <div className="card">
                <AcceptProject
                    projectId={acceptProjectId}
                    setProjectId={setAcceptProjectId}
                    onAccept={acceptProject}
                />
              </div>

              <div className="card">
                <FundEscrow
                    projectId={fundProjectId}
                    setProjectId={setFundProjectId}
                    amount={fundAmount}
                    setAmount={setFundAmount}
                    onFund={fundEscrow}
                />
              </div>

              <div className="card">
                <SubmitWork
                    projectId={submitProjectId}
                    setProjectId={setSubmitProjectId}
                    onSubmit={submitWork}
                />
              </div>

              <div className="card">
                <ApproveWork
                    projectId={approveProjectId}
                    setProjectId={setApproveProjectId}
                    onApprove={approveWork}
                />
              </div>

              <div className="card">
                <ProjectDetails
                    projectId={viewProjectId}
                    setProjectId={setViewProjectId}
                    projectDetails={projectDetails}
                    onView={getProjectDetails}
                />
              </div>

              <div className="card">
                <RaiseDispute
                    projectId={disputeProjectId}
                    setProjectId={setDisputeProjectId}
                    onRaise={raiseDispute}
                />
              </div>

              <div className="card">
                <ResolveDispute
                    projectId={resolveProjectId}
                    setProjectId={setResolveProjectId}
                    resolution={resolution}
                    setResolution={setResolution}
                    onResolve={resolveDispute}
                />
              </div>

            </div>
        )}
      </div>
  );
}

export default App;