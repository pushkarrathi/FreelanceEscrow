function ApproveWork({ projectId, setProjectId, onApprove }) {
    return (
        <section>
            <h2>Approve Work</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <button onClick={onApprove}>
                Approve Work
            </button>
        </section>
    );
}

export default ApproveWork;