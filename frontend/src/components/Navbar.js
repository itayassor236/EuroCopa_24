import React from 'react';
import './Navbar.css';

function Navbar({ user }) {
  return (
    <div className="navbar">
      <div className="navbar-content">
        <div>{user ? user.email : `Guest`}</div>
        <div></div>
      </div>
    </div>
  );
}

export default Navbar;
