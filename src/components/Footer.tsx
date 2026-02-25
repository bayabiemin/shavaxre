export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <span className="logo-sha">Sha</span>
                    <span className="logo-vax">(vax)</span>
                    <span className="logo-re">re</span>
                    <p className="footer-tagline">
                        Decentralized education funding on Avalanche.
                        <br />
                        Transparent. Trustless. Direct.
                    </p>
                </div>

                <div className="footer-links-group">
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <a href="/campaigns">Browse Campaigns</a>
                        <a href="/create">Create Campaign</a>
                    </div>
                    <div className="footer-col">
                        <h4>Resources</h4>
                        <a href="https://docs.avax.network/" target="_blank" rel="noopener noreferrer">
                            Avalanche Docs
                        </a>
                        <a href="https://testnet.snowtrace.io/" target="_blank" rel="noopener noreferrer">
                            Snowtrace Explorer
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    Built with ❤️ for{" "}
                    <a href="https://build.avax.network" target="_blank" rel="noopener noreferrer">
                        Avalanche Build Games 2026
                    </a>
                </p>
                <p className="footer-chain">Powered by Avalanche C-Chain</p>
            </div>
        </footer>
    );
}
