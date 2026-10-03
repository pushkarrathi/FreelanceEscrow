function ProjectDetails({ projectId, setProjectId, projectDetails, onView }) {
    return (
        <section>
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
                <div>
                    <p>Client: {projectDetails.client}</p>
                    <p>Freelancer: {projectDetails.freelancer}</p>
                    <p>Amount: {projectDetails.amount} ETH</p>
                    <p>Status: {projectDetails.status}</p>
                </div>
            )}
        </section>
    );
}

export default ProjectDetails;