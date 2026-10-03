function CreateProject({ freelancer, setFreelancer, amount, setAmount, description, setDescription, projectId, onCreate }) {
    return (
        <>
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
            <input
                type="text"
                placeholder="Project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={onCreate}>
                Create Project
            </button>
            {projectId && (
                <p className="project-id">
                    Created Project ID: {projectId}
                </p>
            )}
        </>
    );
}

export default CreateProject;