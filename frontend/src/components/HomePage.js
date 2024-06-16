import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import euroLogo from '../assets/euro-2024-logo.png';
import copaLogo from '../assets/Copa_America_2024_Logo.png';
import './HomePage.css';
import Navbar from './Navbar.js';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  const handleEuroButtonClick = () => {
    navigate('/euro2024', { state: { page: 'euro24', user } });
  };

  const handleCopaButtonClick = () => {
    navigate('/copaamerica2024', { state: { page: 'copaamerica', user } });
  };

  return (
    <div className="home-container">
      <Navbar user={user} /> {/* Pass the user information to the Navbar component */}
      <div className="logo-button-container">
        <div className="home-logo-container">
          <img src={euroLogo} alt="Euro 2024 Logo" className="home-logo" />
          <button onClick={handleEuroButtonClick}>Euro 2024</button>
        </div>
        <div className="home-logo-container">
          <img src={copaLogo} alt="Copa America 2024 Logo" className="home-logo" />
          <button onClick={handleCopaButtonClick}>Copa America 2024</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
