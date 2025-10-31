import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <>
      <footer className="site_footer">
        <Container>
          <div className="copyright_sec d-flex">
            <p>© Copyright 2025 Start Sit Em. All Right Reserved</p>
            <div className="d-flex gap-4 ">
              <Link to="/privacy-policy">
                <p className="footer_btns">Privacy Policy</p>
              </Link>
              {/* <Link to="/privacy-policy">
                <p>Terms & Conditions</p>
              </Link> */}
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}

export default Footer;
