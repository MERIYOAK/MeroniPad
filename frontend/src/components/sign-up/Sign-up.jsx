import React, { useState } from 'react';
import './sign-up.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { MdCancel } from "react-icons/md";
import { Link } from 'react-router-dom';
import BASE_URL from '../../../config';

function Sign_up(props) {
    const navigate = useNavigate();
    const { dispatch } = useAuth();
    const [showSignUp, setShowSignUp] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [image, setImage] = useState(null);
    const [isLoginButtonDisabled, setLoginButtonDisabled] = useState(false);
    const [isSignUpButtonDisabled, setSignUpButtonDisabled] = useState(false);
    const handleClick = () => {
        setShowSignUp(!showSignUp);
    };

    const handleSignUp = async (e) => {
        try {
            e.preventDefault();
            setSignUpButtonDisabled(true);

            // Capitalize the first letter of each name
            const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            const capitalizedMiddleName = middleName.charAt(0).toUpperCase() + middleName.slice(1);
            const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

            // Validate password length
            if (password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Validate image size
            const imageFile = e.target.querySelector('#image').files[0];
            const imageSizeInMegabytes = imageFile.size / (1024 * 1024);

            if (imageSizeInMegabytes > 1) {
                alert('Image size must be below 1 megabyte.');
                return;
            }

            const data = {
                firstName: capitalizedFirstName,
                middleName: capitalizedMiddleName,
                lastName: capitalizedLastName,
                username: username,
                image: image,
                password: password,
            };

            const response = await axios.post(`${BASE_URL}/sign_up`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseData = response.data;

            if (responseData.error) {
                alert(responseData.message);
                setSignUpButtonDisabled(false);

            } else if (responseData.success) {
                alert(`${responseData.message}\nYour email is ${responseData.email}`);
                setSignUpButtonDisabled(false);

                // Set user as authenticated
                dispatch({
                    type: 'LOGIN',
                    payload: {
                        id: responseData.id,
                        firstName: responseData.firstName,
                        middleName: responseData.middleName,
                        lastName: responseData.lastName,
                        username: responseData.username,
                        email: responseData.email,
                        imageUrl: responseData.imageUrl
                    },
                });

                // Store senstive information in localStorage
                localStorage.setItem('sessionId', responseData.sessionId);
                localStorage.setItem('isAuthenticated', true);
                localStorage.setItem('userId', responseData.id);
                localStorage.setItem('firstName', responseData.firstName);
                localStorage.setItem('middleName', responseData.middleName);
                localStorage.setItem('lastName', responseData.lastName);
                localStorage.setItem('username', responseData.username);
                localStorage.setItem('imageUrl', responseData.imageUrl);
                localStorage.setItem('imageName', responseData.imageName);
                localStorage.setItem('email', responseData.email);

                navigate('/');

            } else {
                alert('An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error during registration:', error.message);
            alert('An error occurred during registration. Please try again.');
        }
    }

    const handleLogin = async (e) => {
        try {
            e.preventDefault();

            setLoginButtonDisabled(true);

            const response = await axios.post(`${BASE_URL}/login`, {
                emailOrUsername,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const responseData = response.data;

            if (responseData.error) {
                alert(responseData.message);

                setLoginButtonDisabled(false);

            } else if (responseData.success) {
                alert(responseData.message);
                setLoginButtonDisabled(false);

                // Store sensitive information in localStorage
                localStorage.setItem('sessionId', responseData.sessionId);
                localStorage.setItem('isAuthenticated', true);
                localStorage.setItem('userId', responseData.id);
                localStorage.setItem('firstName', responseData.firstName);
                localStorage.setItem('middleName', responseData.middleName);
                localStorage.setItem('lastName', responseData.lastName);
                localStorage.setItem('username', responseData.username);
                localStorage.setItem('email', responseData.email);
                localStorage.setItem('imageUrl', responseData.imageUrl);
                localStorage.setItem('imageName', responseData.imageName);


                dispatch({
                    type: 'LOGIN',
                    payload: {
                        id: responseData.id,
                        firstName: responseData.firstName,
                        middleName: responseData.middleName,
                        lastName: responseData.lastName,
                        username: responseData.username,
                        email: responseData.email,
                        imageUrl: responseData.imageUrl
                    },
                });

                props.onLogin(responseData.notes);

                // // Calculate expiration time
                // const expirationTime = new Date(responseData.expirationTime);
                // const remainingTime = Math.floor((expirationTime.getTime() - Date.now()) / 1000);

                // // Log remaining time until expiration
                // console.log('Remaining time until expiration:', remainingTime, 'seconds');

                // // Set up interval to log remaining time
                // const intervalId = setInterval(() => {
                //     const remaining = Math.floor((expirationTime.getTime() - Date.now()) / 1000);
                //     console.log('Remaining time until expiration:', remaining, 'seconds');

                //     if (remaining <= 0) {
                //         clearInterval(intervalId);
                //         console.log('Presigned URL has expired.');
                //     }
                // }, 1000);
                navigate('/');
            } else {
                alert('An error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error during login:', error.message);
            alert('An error occurred during login. Please try again.');
        }
    }
    return (
        <>
            <Link to="/"><MdCancel className="cancel-icon" /></Link>
            {
                !showSignUp ? (
                    <div className="sign-up-container">
                        <div className="sign-up-form-container">
                            <h3 id="welcome-title">Welcome to Meroni Keeper App</h3>
                            <p >Please register to continue </p>

                            <form onSubmit={handleSignUp} className="sign-in-form">
                                <input type="text" id="firstName" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder='First Name : ' />

                                <input type="text" id="middleName" name="middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} required placeholder='Middle Name :' />

                                <input type="text" id="lastName" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder='Last Name :' />

                                <input type="text"
                                    id="username"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder='Username :'
                                    required />

                                <input type="file" id="image" name="image" onChange={(e) => setImage(e.target.files[0])} accept="image/*" required placeholder='Profile Image :' />

                                <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder='Password :' />

                                <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder='Confirm Password :' />
                                <button type="submit" disabled={isSignUpButtonDisabled} style={isSignUpButtonDisabled ? { display: 'none' } : {}}>Sign up</button>
                                <p >Already have an account? <a className="log_in-link" onClick={handleClick}>Login</a></p>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className='login-container'>
                        <div className="login-form-container">
                            <h3 id='welcome-title'>Welcome to Meroni Keeper App</h3>
                            <p>Please login to continue </p>


                            <form onSubmit={handleLogin} className="login-form">
                                <input
                                    type="text"
                                    name="emailOrUsername"
                                    id="emailOrUsername"
                                    value={emailOrUsername}
                                    onChange={(e) => setEmailOrUsername(e.target.value)}
                                    required
                                    placeholder='Email or Username'
                                /><br />

                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder='Password'
                                /><br />
                                <button type="submit" disabled={isLoginButtonDisabled} style={isLoginButtonDisabled ? { display: 'none' } : {}}>Log in</button>
                                <p >I don't have an account? <a className="log_in-link" onClick={handleClick}>Sign up</a></p>

                            </form>
                        </div>
                    </div>
                )
            }
        </>
    );
}

export default Sign_up;

