function ResolveDispute({ projectId, setProjectId, resolution, setResolution, onResolve }) {
    return (
        <section>
            <h2>Resolve Dispute</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
            >
                <option value="">Select resolution</option>
                <option value="freelancer">Freelancer wins</option>
                <option value="client">Client wins</option>
            </select>
            <button onClick={onResolve}>
                Resolve Dispute
            </button>
        </section>
    );
}

export default ResolveDispute;