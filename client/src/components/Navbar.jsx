import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          AdmitBridge
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <span style={{color: 'var(--text-muted)'}}>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{padding: '0.5rem 1rem'}}>
                <LogOut size={16} style={{marginRight: '0.5rem'}} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
