import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar2.css';

function Navbar2({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.state?.page; // Access the page from location state


  const handleSquadsClick = () => {
    navigate('/squadspage', { state: { page: currentPage, user } });
  };

  const handleBetsClick = () => {
    if (user) {
      navigate('/betspage', { state: { user } });
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <div>
          <button onClick={handleSquadsClick}>Squads</button>
          <button onClick={handleBetsClick}>Bets</button>
        </div>
        <div>{user ? user.email : 'Guest'}</div>
      </div>
    </div>
  );
}

export default Navbar2;
