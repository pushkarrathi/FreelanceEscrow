import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
      );
      const tx = await contract.createProject(
          freelancer,
          ethers.parseEther(amount)
      );
      const receipt = await tx.wait();
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
      alert("Transaction failed");
    }
  }
  async function acceptProject() {
    if (!acceptProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
      );
      const tx = await contract.acceptProject(acceptProjectId);
      await tx.wait();
      alert("Project accepted successfully");
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    }
  }
  async function fundEscrow() {
    if (!fundProjectId || !fundAmount) {
      alert("Enter project ID and amount");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
      );
      const tx = await contract.fundEscrow(fundProjectId, {
        value: ethers.parseEther(fundAmount)
      });
      await tx.wait();
      alert("Escrow funded successfully");
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    }
  }
  async function submitWork() {
    if (!submitProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
      );
      const tx = await contract.submitWork(submitProjectId);
      await tx.wait();
      alert("Work submitted successfully");
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    }
  }
  async function approveWork() {
    if (!approveProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
      );
      const tx = await contract.approveWork(approveProjectId);
      await tx.wait();
      alert("Work approved and payment released");
    } catch (error) {
      console.error(error);
      alert("Transaction failed");
    }
  }
  async function getProjectDetails() {
    if (!viewProjectId) {
      alert("Enter project ID");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
      );
      const project = await contract.getProject(viewProjectId);
      const statuses = [
        "Created",
        "Accepted",
        "Funded",
        "Work Submitted",
        "Completed",
        "Refunded"
      ];
      setProjectDetails({
        client: project[0],
        freelancer: project[1],
        amount: ethers.formatEther(project[2]),
        status: statuses[Number(project[3])]
      });
    } catch (error) {
      console.error(error);
      alert("Unable to fetch project");
    }
  }


  return (
      <div>
        <h1>Freelance Escrow</h1>
        <button onClick={connectWallet}>
          Connect MetaMask
        </button>

        {account && (
            <div>
              <p>Connected Account:</p>
              <p>{account}</p>
              <p>Balance: {balance} ETH</p>

              <h2>Create Project</h2>

              <input
                  type="text"
                  placeholder="Freelancer wallet address"
                  value={freelancer}
                  onChange={(e) => setFreelancer(e.target.value)}
              />

              <input
                  type="text"
                  placeholder="Amount in ETH"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
              />

              <button onClick={createProject}>
                Create Project
              </button>

              {projectId && (
                  <p>Created Project ID: {projectId}</p>
              )}
              <h2>Accept Project</h2>

              <input
                  type="text"
                  placeholder="Project ID"
                  value={acceptProjectId}
                  onChange={(e) => setAcceptProjectId(e.target.value)}
              />

              <button onClick={acceptProject}>
                Accept Project
              </button>
              <h2>Fund Escrow</h2>

              <input
                  type="text"
                  placeholder="Project ID"
                  value={fundProjectId}
                  onChange={(e) => setFundProjectId(e.target.value)}
              />

              <input
                  type="text"
                  placeholder="Amount in ETH"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
              />

              <button onClick={fundEscrow}>
                Fund Escrow
              </button>
              <h2>Submit Work</h2>

              <input
                  type="text"
                  placeholder="Project ID"
                  value={submitProjectId}
                  onChange={(e) => setSubmitProjectId(e.target.value)}
              />

              <button onClick={submitWork}>
                Submit Work
              </button>
              <h2>Approve Work</h2>

              <input
                  type="text"
                  placeholder="Project ID"
                  value={approveProjectId}
                  onChange={(e) => setApproveProjectId(e.target.value)}
              />

              <button onClick={approveWork}>
                Approve Work
              </button>
              <h2>Project Details</h2>

              <input
                  type="text"
                  placeholder="Project ID"
                  value={viewProjectId}
                  onChange={(e) => setViewProjectId(e.target.value)}
              />

              <button onClick={getProjectDetails}>
                View Project
              </button>

              {projectDetails && (
                  <div>
                    <p>Client: {projectDetails.client}</p>
                    <p>Freelancer: {projectDetails.freelancer}</p>
                    <p>Amount: {projectDetails.amount} ETH</p>
                    <p>Status: {projectDetails.status}</p>
                  </div>
              )}
            </div>
        )}
      </div>
  );
}

export default App;