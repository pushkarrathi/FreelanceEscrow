// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FreelanceEscrow {
    enum ProjectStatus {
        Created,
        Accepted,
        Funded,
        WorkSubmitted,
        Completed,
        Refunded,
        Disputed,
        DisputeResolved
    }

    struct Project {
        address client;
        address freelancer;
        uint256 amount;
        ProjectStatus status;
    }

    uint256 private projectCount;
    address public arbitrator;
    mapping(uint256 => Project) public projects;

    event ProjectCreated(
        uint256 indexed projectId,
        address indexed client,
        address indexed freelancer,
        uint256 amount
    );

    event ProjectAccepted(uint256 indexed projectId);

    event EscrowFunded(
        uint256 indexed projectId,
        uint256 amount
    );

    event WorkSubmitted(uint256 indexed projectId);

    event PaymentReleased(
        uint256 indexed projectId,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed projectId,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed projectId,
        address indexed raisedBy
    );

    event DisputeResolved(
        uint256 indexed projectId,
        bool freelancerWins,
        uint256 amount
    );

    modifier onlyClient(uint256 projectId) {
        require(
            msg.sender == projects[projectId].client,
            "Only client can perform this action"
        );
        _;
    }

    modifier onlyFreelancer(uint256 projectId) {
        require(
            msg.sender == projects[projectId].freelancer,
            "Only freelancer can perform this action"
        );
        _;
    }

    modifier onlyArbitrator() {
        require(
            msg.sender == arbitrator,
            "Only arbitrator can perform this action"
        );
        _;
    }

    constructor(address _arbitrator) {
        require(
            _arbitrator != address(0),
            "Invalid arbitrator"
        );

        arbitrator = _arbitrator;
    }

    function createProject(
        address freelancer,
        uint256 amount
    ) external returns (uint256) {
        require(
            freelancer != address(0),
            "Invalid freelancer"
        );

        require(
            freelancer != msg.sender,
            "Client and freelancer cannot be same"
        );

        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        uint256 projectId = projectCount;

        projects[projectId] = Project({
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            status: ProjectStatus.Created
        });

        projectCount++;

        emit ProjectCreated(
            projectId,
            msg.sender,
            freelancer,
            amount
        );

        return projectId;
    }

    function acceptProject(
        uint256 projectId
    ) external onlyFreelancer(projectId) {
        require(
            projects[projectId].status == ProjectStatus.Created,
            "Project cannot be accepted"
        );

        projects[projectId].status = ProjectStatus.Accepted;

        emit ProjectAccepted(projectId);
    }

    function fundEscrow(
        uint256 projectId
    ) external payable onlyClient(projectId) {
        require(
            projects[projectId].status == ProjectStatus.Accepted,
            "Project is not ready for funding"
        );

        require(
            msg.value == projects[projectId].amount,
            "Incorrect ETH amount"
        );

        projects[projectId].status = ProjectStatus.Funded;

        emit EscrowFunded(
            projectId,
            msg.value
        );
    }

    function submitWork(
        uint256 projectId
    ) external onlyFreelancer(projectId) {
        require(
            projects[projectId].status == ProjectStatus.Funded,
            "Project is not funded"
        );

        projects[projectId].status = ProjectStatus.WorkSubmitted;

        emit WorkSubmitted(projectId);
    }

    function approveWork(
        uint256 projectId
    ) external onlyClient(projectId) {
        require(
            projects[projectId].status == ProjectStatus.WorkSubmitted,
            "Work has not been submitted"
        );

        Project storage project = projects[projectId];

        project.status = ProjectStatus.Completed;

        (bool success, ) = payable(project.freelancer).call{
                value: project.amount
            }("");

        require(
            success,
            "Payment failed"
        );

        emit PaymentReleased(
            projectId,
            project.amount
        );
    }

    function refund(
        uint256 projectId
    ) external onlyClient(projectId) {
        require(
            projects[projectId].status == ProjectStatus.Funded,
            "Refund is not available"
        );

        Project storage project = projects[projectId];

        project.status = ProjectStatus.Refunded;

        (bool success, ) = payable(project.client).call{
                value: project.amount
            }("");

        require(
            success,
            "Refund failed"
        );

        emit RefundIssued(
            projectId,
            project.amount
        );
    }

    function raiseDispute(
        uint256 projectId
    ) external {
        require(
            msg.sender == projects[projectId].client ||
            msg.sender == projects[projectId].freelancer,
            "Only project parties can raise dispute"
        );

        require(
            projects[projectId].status == ProjectStatus.WorkSubmitted,
            "Project is not ready for dispute"
        );

        projects[projectId].status = ProjectStatus.Disputed;

        emit DisputeRaised(
            projectId,
            msg.sender
        );
    }

    function resolveDispute(
        uint256 projectId,
        bool freelancerWins
    ) external onlyArbitrator {
        require(
            projects[projectId].status == ProjectStatus.Disputed,
            "Project is not disputed"
        );

        Project storage project = projects[projectId];

        project.status = ProjectStatus.DisputeResolved;

        address recipient;

        if (freelancerWins) {
            recipient = project.freelancer;
        } else {
            recipient = project.client;
        }

        (bool success, ) = payable(recipient).call{
                value: project.amount
            }("");

        require(
            success,
            "Dispute payment failed"
        );

        emit DisputeResolved(
            projectId,
            freelancerWins,
            project.amount
        );
    }

    function getProject(
        uint256 projectId
    ) external view returns (
        address client,
        address freelancer,
        uint256 amount,
        ProjectStatus status
    ) {
        Project memory project = projects[projectId];

        return (
            project.client,
            project.freelancer,
            project.amount,
            project.status
        );
    }
}