import React, { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import "./header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../config";

function Header({ setNotes }) {
    const Navigate = useNavigate();
    const { state } = useAuth();
    const { isAuthenticated, user } = state;
    const { dispatch } = useAuth();
    const [showProfile, setShowProfile] = useState(false);
    const [imageUrl, setImageUrl] = useState(localStorage.getItem("imageUrl") || null);

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
                setNotes([]);
                // Clear all user data from local storage or do any necessary cleanup
                Object.keys(localStorage).forEach(key => localStorage.removeItem(key));

                dispatch({ type: "LOGOUT" });
                Navigate("/");
            } else {
                console.error("Logout failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error during logout:", error.message);
        }
    };

    const changeProfilePicture = async () => {
        try {
            // Open file input dialog to allow the user to select an image
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                // Upload the selected image file to the S3 bucket
                const formData = new FormData();
                formData.append('image', file);
                formData.append('userId', localStorage.getItem("userId"));

                const sessionId = localStorage.getItem("sessionId");
                const response = await axios.post(`${BASE_URL}/uploadProfilePicture`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'sessionId': sessionId,
                    }
                });

                // Update the user's profile picture URL in the frontend
                if (response.status === 200) {
                    const imageUrl = response.data.imageUrl;
                    setImageUrl(imageUrl);
                    // Update the profile picture URL in the frontend (localStorage or state)
                    localStorage.setItem('imageUrl', imageUrl);
                    // You may also update the imageUrl state if using React state
                } else {
                    console.error('Failed to upload profile picture');
                    // Handle error or show error message to the user
                }
            };

            // Trigger file input dialog
            fileInput.click();
        } catch (error) {
            console.error('Error changing profile picture:', error);
            // Handle error or show error message to the user
        }
    };

    // let isRegeneratingUrl = false;


    // const fetchImageUrl = async () => {
    //     if (isAuthenticated) {
    //         try {
    //             const user_id = localStorage.getItem('userId');
    //             const sessionId = localStorage.getItem("sessionId");
    //             console.log("user_id:", user_id);
    //             console.log("sessionId:", sessionId);
    //             const response = await axios.get(`${BASE_URL}/userImageUrl/${user_id}`, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'sessionId': sessionId
    //                 }
    //             });
    //             if (response.status === 200 && response.data.preSignedUrl.user_id === user_id) {
    //                 const newimageUrl = response.data.preSignedUrl.imageUrl;
    //                 console.log('Fetched image URL:', newimageUrl);
    //                 setImageUrl(newimageUrl);
    //                 localStorage.setItem('imageUrl', newimageUrl);
    //             } else {
    //                 console.error('Failed to fetch image URL');
    //             }
    //         } catch (error) {
    //             console.error('Error fetching image URL:', error);
    //         }
    //     }
    // };
    // // Check if the stored URL is expired and regenerate if needed
    // const storedImageUrl = localStorage.getItem('imageUrl');
    // if (storedImageUrl && !isRegeneratingUrl) {
    //     const img = new Image();
    //     img.src = storedImageUrl;

    //     img.onload = () => {
    //         console.log('Image loaded successfully');
    //     };

    //     img.onerror = async () => {
    //         isRegeneratingUrl = true;
    //         console.log('Regenerating image URL...');
    //         await fetchImageUrl();
    //         isRegeneratingUrl = false;
    //         console.log('Image URL regenerated successfully');
    //         console.log('Fetched image URL:', imageUrl);
    //     };
    // }




    return (
        <header className="header">
            <Link className="logo" to="/">
                <h3>Meroni<span className="logo_span">pad</span></h3>
            </Link>
            {
                isAuthenticated ? (
                    <>
                        <div className="profile-picture">
                            <img src={imageUrl} alt="Profile" onClick={toggleProfile} />
                        </div>
                        {showProfile && (
                            <div className="profile-popup">
                                <strong>User ID:</strong><span>{user.id}</span>
                                <strong>Email:</strong><span>{user.email}</span>
                                <strong>First Name:</strong><span>{user.firstName}</span>
                                <strong>Middle Name:</strong><span>{user.middleName}</span>
                                <strong>Last Name:</strong><span>{user.lastName}</span>
                                <strong>Username:</strong><span>{user.username}</span>
                                <div className="change-profile">
                                    <span onClick={changeProfilePicture}>change profile picture</span>
                                </div>
                                <button onClick={logoutHandler}>Log out</button>
                            </div>
                        )}
                    </>
                ) : (
                    <Link to="/sign_up">
                        <div className="login">
                            <FaUserAlt className="login-icon" />
                        </div>
                    </Link>
                )
            }
        </header >
    );
}

export default Header;
