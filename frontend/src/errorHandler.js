export function getErrorMessage(error) {
    if (error?.code === "ACTION_REJECTED") {
        return "Transaction was rejected in MetaMask";
    }
    if (error?.reason) {
        return error.reason;
    }
    if (error?.shortMessage) {
        return error.shortMessage;
    }
    if (error?.message?.includes("Only client")) {
        return "Only the client can perform this action";
    }
    if (error?.message?.includes("Only freelancer")) {
        return "Only the freelancer can perform this action";
    }
    if (error?.message?.includes("Only arbitrator")) {
        return "Only the arbitrator can perform this action";
    }
    if (error?.message?.includes("Project is not funded")) {
        return "The project must be funded first";
    }
    if (error?.message?.includes("Project is not ready")) {
        return "The project is not in the required state";
    }
    return "Transaction failed";
}