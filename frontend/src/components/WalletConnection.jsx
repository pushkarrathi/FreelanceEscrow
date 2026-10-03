function WalletConnection({ account, balance, onConnect }) {
    return (
        <section>
            <h2>Connect MetaMask</h2>
            <button onClick={onConnect}>Connect Wallet</button>
            {account && <p>Account: {account}</p>}
            {balance && <p>Balance: {balance} ETH</p>}
        </section>
    );
}

export default WalletConnection;