import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL_USER } from '../API';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/GoogleLogin.css';

const GoogleLoginButton = ({ buttonText, isSubmitting, setIsSubmitting }) => {
    const { fetchUserDetails } = useUser();
    const navigate = useNavigate();

    // Get client ID from environment variables
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    // Check if client ID is configured
    if (!clientId || clientId === 'your_actual_google_client_id_here') {
        console.error('Google Client ID not configured');
        return (
            <div className="alert alert-warning">
                Google login is not configured. Please contact administrator.
            </div>
        );
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await axios.post(`${BASE_URL_USER}/auth/google-login`, {
                tokenId: credentialResponse.credential,
                language: "ENGLISH"
            });

            console.log('Google login response:', response.data); // Debug log

            // FIX: Check for the correct response structure
            if (response.data && response.data.status && response.data.data && response.data.data.access_token) {
                const { access_token, _id, full_name, otp_verified } = response.data.data;

                localStorage.setItem("token", access_token);
                localStorage.setItem("user_id", _id);
                localStorage.setItem("user_name", full_name);

                await fetchUserDetails(access_token);
                
                toast.success("Login successful!", {
                    style: { fontSize: "18px" }
                });
                
                navigate("/");
            } else {
                console.error('Unexpected response structure:', response.data);
                toast.error("Unexpected response from server", {
                    style: { fontSize: "18px" }
                });
            }
        } catch (error) {
            console.error('Google login error:', error);
            const errorMessage = error.response?.data?.error_description || 
                               error.response?.data?.message || 
                               "Google login failed. Please try again.";
            toast.error(errorMessage, {
                style: { fontSize: "18px" }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleFailure = () => {
        toast.error("Google login failed. Please try again.", {
            style: { fontSize: "18px" }
        });
    };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="google-login-btn-wrapper">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleFailure}
                    useOneTap={false}
                    text={buttonText}
                    size="large"
                    width="100%"
                    shape="rectangular"
                />
            </div>
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButton;