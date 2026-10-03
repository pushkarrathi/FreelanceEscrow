function ProjectDetails({ projectId, setProjectId, projectDetails, activityHistory, onView }) {
    return (
        <>
            <h2>Project Details</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <button onClick={onView}>
                View Project
            </button>

            {projectDetails && (
                <div className="project-details">
                    <div className="detail-row">
                        <span>Client</span>
                        <span>{projectDetails.client}</span>
                    </div>

                    <div className="detail-row">
                        <span>Freelancer</span>
                        <span>{projectDetails.freelancer}</span>
                    </div>

                    <div className="detail-row">
                        <span>Amount</span>
                        <span>{projectDetails.amount} ETH</span>
                    </div>

                    <div className="detail-row">
                        <span>Description</span>
                        <span>{projectDetails.description}</span>
                    </div>

                    <div className="detail-row">
                        <span>Status</span>
                        <span className="status-badge">
                            {projectDetails.status}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span>Your Role</span>
                        <span className="status-badge">{projectDetails.role}</span>
                    </div>

                    {projectDetails && activityHistory.length > 0 && (
                        <div className="project-details">
                            <h3>Activity History</h3>
                            {activityHistory.map((activity, index) => (
                                <div className="detail-row" key={index}>
                                    <span>{activity.name}</span>
                                    <span>
        Block {activity.blockNumber} — {new Date(Number(activity.timestamp) * 1000).toLocaleString()}
    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default ProjectDetails;