function SubmitWork({ projectId, setProjectId, onSubmit }) {
    return (
        <section>
            <h2>Submit Work</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <button onClick={onSubmit}>
                Submit Work
            </button>
        </section>
    );
}

export default SubmitWork;