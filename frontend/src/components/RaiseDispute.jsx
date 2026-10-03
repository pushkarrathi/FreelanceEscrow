function RaiseDispute({ projectId, setProjectId, onRaise }) {
    return (
        <section>
            <h2>Raise Dispute</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <button onClick={onRaise}>
                Raise Dispute
            </button>
        </section>
    );
}

export default RaiseDispute;