function FundEscrow({ projectId, setProjectId, amount, setAmount, onFund }) {
    return (
        <section>
            <h2>Fund Escrow</h2>
            <input
                type="text"
                placeholder="Project ID"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={onFund}>
                Fund Escrow
            </button>
        </section>
    );
}

export default FundEscrow;