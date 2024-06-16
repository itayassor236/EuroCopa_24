import React, { useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './LandingPage.css';
import SignUpModal from './SignUpModal';
import LoginModal from './LoginModal';

const CLIENT_ID = '13699159643-h7dpvipsjvlm3ebr68iuge8k1agbr4m1.apps.googleusercontent.com';

function LandingPage({ setUser }) {
  const navigate = useNavigate();
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleGoogleSuccess = async (response) => {
    const profile = response.profileObj;
    console.log('[Login Success] currentUser:', profile);
  
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${backendUrl}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.tokenId }),
      });
  
      const data = await res.json();
      console.log('Server response:', data);
  
      setUser(profile); // Update user state
      navigate('/HomePage', { state: { user: profile } });
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };
  

  const handleGoogleFailure = (response) => {
    console.log('[Login Failed] response:', response);
  };

  const handleLoginAsGuest = () => {
    const guestUser = { email: `Guest${Math.floor(Math.random() * 1000)}` };
    setUser(guestUser); // Update user state
    navigate('/HomePage', { state: { user: guestUser } });
  };

  const handleSignUpClick = () => {
    setIsSignUpModalOpen(true);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseSignUpModal = () => {
    setIsSignUpModalOpen(false);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className="landing-container">
      <div className="landing-logo-container">
        <img src={logo} alt="Logo" className="landing-logo" />
      </div>
      <div className="landing-button-container">
        <button onClick={handleLoginClick}>Login</button>
        <button onClick={handleLoginAsGuest}>Login as Guest</button>
        <GoogleLogin
          clientId={CLIENT_ID}
          buttonText="Login with Google"
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
          cookiePolicy={'single_host_origin'}
          className="custom-button google-button"
        />
        <button onClick={handleSignUpClick}>Sign Up</button>
      </div>
      {isSignUpModalOpen && <SignUpModal onClose={handleCloseSignUpModal} />}
      {isLoginModalOpen && <LoginModal onClose={handleCloseLoginModal} />}
    </div>
  );
}

export default LandingPage;
