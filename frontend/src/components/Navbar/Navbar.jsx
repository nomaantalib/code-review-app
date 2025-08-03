import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">CodeReviewAI</Link>
      </div>
      <ul className="nav-links">
        {user ? (
          <>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li className="nav-user">
              Welcome, {user.name}!
            </li>
            <li>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
