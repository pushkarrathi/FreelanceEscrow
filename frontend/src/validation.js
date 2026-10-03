import { ethers } from "ethers";

export function isValidAddress(address) {
    return ethers.isAddress(address);
}

export function isValidAmount(amount) {
    if (!amount || amount.trim() === "") {
        return false;
    }
    try {
        return ethers.parseEther(amount) > 0n;
    } catch {
        return false;
    }
}

export function isValidProjectId(projectId) {
    if (!projectId || projectId.trim() === "") {
        return false;
    }
    return /^\d+$/.test(projectId);
}