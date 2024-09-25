import { useEffect, useState, useRef } from "react";
import { Navbar, Nav, Container, Button, Image } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../images/NNlogo.png";
import "../styles/navbar.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  useLogoutMutation,
  useGetUserInfoQuery,
} from "./../slices/userApiSlice";
import { UPLOADS_URL } from "../slices/urlConstrains";
import { useDispatch } from "react-redux"; // To clear the user state on logout

const NavbarComponent = () => {
  const { data: userInfo } = useGetUserInfoQuery();

  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation(); // To detect route change
  const dispatch = useDispatch();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showElements, setShowElements] = useState(false);
  const [expanded, setExpanded] = useState(false); // State for navbar expanded

  const navbarRef = useRef(null); // Ref for detecting click outside

  const checkLoginStatus = () => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loginStatus === "true");
  };

  useEffect(() => {
    if (userInfo?.data?.user?.username) {
      setUsername(userInfo.data.user.username);
    }
  }, [userInfo]);

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page on route change
  }, [location.pathname]);

  useEffect(() => {
    checkLoginStatus();

    if (localStorage.getItem("isLoggedIn") === "true") {
      const timer = setTimeout(() => {
        setShowElements(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowElements(false);
    }

    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [isLoggedIn]);

  // Detect click outside to collapse the navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false); // Collapse the navbar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavLinkClick = () => {
    setExpanded(false); // Collapse the navbar when a NavLink is clicked
  };

  const handleSubmit = async () => {
    try {
      await logout().unwrap();
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      setShowElements(false);

      dispatch({ type: "user/clearUserInfo" });

      navigate("/");

      alert("Logged out.");
      console.log("You have been logged out!");
    } catch (err) {
      console.error("Failed to Logout:", err);
      alert("Failed to Logout.");
    }
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className="navbar-transparent"
      expanded={expanded} // Controls whether the navbar is expanded or collapsed
      ref={navbarRef} // Attach the ref to the navbar
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="text-white">
          <img
            src={logo}
            alt="Logo"
            width="30"
            height="30"
            className="d-inline-block align-top color"
          />
          &nbsp; NextNest
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="navbar-nav"
          className="bg-white"
          id="hamburger"
          onClick={() => setExpanded(!expanded)} // Toggle expanded state
        />
        <Navbar.Collapse id="navbar-nav" className="justify-content-center">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={handleNavLinkClick}>
              Home
            </Nav.Link>
          </Nav>

          <Nav>
            {!isLoggedIn && (
              <Nav.Link as={Link} to="/login" onClick={handleNavLinkClick}>
                Login/Register
              </Nav.Link>
            )}
          </Nav>

          {isLoggedIn && showElements && (
            <>
              <div
                className="d-flex align-items-center"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                <h5
                  className="text-white mb-0 me-2"
                  style={{
                    fontFamily: '"Montserrat",sans-serif',
                    textTransform: "capitalize",
                  }}
                >
                  Hi, {username}
                </h5>
                <Nav className="me-2">
                  <Nav.Link
                    as={Link}
                    to="/profile"
                    onClick={handleNavLinkClick}
                  >
                    <Image
                      src={`${UPLOADS_URL}/${userInfo?.data.user.image}`}
                      roundedCircle
                      alt={userInfo?.data.user.username}
                      className="navbar-image"
                    />
                  </Nav.Link>
                </Nav>
                <Button
                  onClick={handleSubmit}
                  variant="danger"
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    padding: 0,
                  }}
                >
                  <i
                    className="bi bi-box-arrow-right"
                    style={{
                      fontSize: "1.1rem",
                      size: "1rem",
                      color: "white",
                    }}
                  ></i>
                </Button>
              </div>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
