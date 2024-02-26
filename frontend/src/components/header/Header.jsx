import React, { useState } from "react";
import { BiSolidLogIn } from "react-icons/bi";
import { FaUserAlt } from "react-icons/fa";
import "./header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../config";

function Header() {
    const Navigate = useNavigate();
    const { state } = useAuth();
    const { isAuthenticated, user } = state;
    const { dispatch } = useAuth();
    const [showProfile, setShowProfile] = useState(false);

    const toggleProfile = () => {
        setShowProfile(!showProfile);
    };

    const logoutHandler = async () => {
        try {
            const sessionId = localStorage.getItem("sessionId");
            // Add your backend logout endpoint URL
            const response = await axios.post(`${BASE_URL}/logout`, {},
                {
                    headers: {
                        "Content-Type": "application/json",
                        "sessionId": sessionId,
                    },
                });

            if (response.data.success) {
                alert(response.data.message);
                // Clear user data from local storage or do any necessary cleanup
                localStorage.removeItem("sessionId");
                localStorage.removeItem("isAuthenticated");
                localStorage.removeItem("userId");
                localStorage.removeItem("firstName");
                localStorage.removeItem("middleName");
                localStorage.removeItem("lastName");
                localStorage.removeItem("username");
                localStorage.removeItem("email");

                // Dispatch the LOGOUT action to update the context
                dispatch({ type: "LOGOUT" });
                Navigate("/");
            } else {
                console.error("Logout failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error during logout:", error.message);
        }
    };



    return (
        <header className="header">
            <Link className="logo" to="/">
                <h3>Meroni<span className="logo_span">pad</span></h3>
            </Link>
            {
                isAuthenticated ? (
                    <>
                        <FaUserAlt onClick={toggleProfile} />
                        {showProfile && (
                            <div className="profile-popup">
                                <strong>User ID:</strong><span>{user.id}</span>
                                <strong>Email:</strong><span>{user.email}</span>
                                <strong>First Name:</strong><span>{user.firstName}</span>
                                <strong>Middle Name:</strong><span>{user.middleName}</span>
                                <strong>Last Name:</strong><span>{user.lastName}</span>
                                <strong>Username:</strong><span>{user.username}</span>
                                <button onClick={logoutHandler}>Log out</button>
                            </div>
                        )}
                    </>
                ) : (
                    <Link to="/sign_up">
                        <div className="login">
                            <span>sign in</span>
                            <BiSolidLogIn className="login-icon" />
                        </div>
                    </Link>
                )
            }
        </header >
    );
}

export default Header;
