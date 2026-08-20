import "../styles/Footer.css";

function Footer() {

    return (

        <footer className="footer">

            <div className="footer-content">

                <h2>🧵 Textile Waste Intelligence Platform</h2>

                <p>
                    AI-Powered Textile Waste Management System
                </p>

                <div className="footer-tech">

                    <span>⚛ React</span>
                    <span>⚡ FastAPI</span>
                    <span>🐘 PostgreSQL</span>
                    <span>🤖 MobileNetV2</span>

                </div>

                <p className="copyright">

                    © 2026 Textile Waste Intelligence Platform

                    <br />

                    Developed for Internship Project

                </p>

            </div>

        </footer>

    );

}

export default Footer;