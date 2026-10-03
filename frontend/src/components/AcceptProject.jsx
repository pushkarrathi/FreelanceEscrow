function AcceptProject({ projectId, setProjectId, onAccept }) {
    return (
        <section>
            <h2>Accept Project</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <button onClick={onAccept}>
                Accept Project
            </button>
        </section>
    );
}

export default AcceptProject;