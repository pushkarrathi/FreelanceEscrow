function ProjectDetails({ projectId, setProjectId, projectDetails, onView }) {
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
                </div>
            )}
        </>
    );
}

export default ProjectDetails;