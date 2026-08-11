import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink =
    user?.role === 'student' ? '/student/dashboard'
    : user?.role === 'consultant' ? '/consultant/dashboard'
    : user?.role === 'admin' ? '/admin/dashboard'
    : '/';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          AdmitBridge
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to={dashboardLink} className="nav-link">{user.role === 'student' ? 'Dashboard' : user.role === 'consultant' ? 'My Students' : 'Admin Panel'}</Link>
              {user.role === 'student' && <Link to="/student/profile" className="nav-link">My Profile</Link>}
              {user.role === 'student' && <Link to="/student/applications" className="nav-link">My Applications</Link>}
              <Link to="/universities" className="nav-link"><GraduationCap size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />Universities</Link>
              <span style={{ color: 'var(--text-muted)' }}>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={16} style={{ marginRight: '0.5rem' }} /> Logout
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
