import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logoutUser();
    setOpen(false);
    navigate('/');
  }

  const link = 'text-gray-300 hover:text-cyan-400 py-1';
  const close = () => setOpen(false);

  return (
    <header className="p-4 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold" onClick={close}>
          <span className="text-cyan-400">Cyber</span>
          <span className="text-white"> গোয়েন্দা</span>
        </Link>

        {/* hamburger (mobile) */}
        <button
          className="md:hidden text-gray-300 border border-gray-600 rounded px-3 py-1"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className="hidden md:flex items-center gap-5 text-sm">
          <NavLinks
            user={user}
            link={link}
            close={close}
            handleLogout={handleLogout}
          />
        </nav>
      </div>

      {open && (
        <nav className="md:hidden mt-4 flex flex-col gap-2 text-sm">
          <NavLinks
            user={user}
            link={link}
            close={close}
            handleLogout={handleLogout}
          />
        </nav>
      )}
    </header>
  );
}

function NavLinks({ user, link, close, handleLogout }) {
  return (
    <>
      <Link to="/" className={link} onClick={close}>
        Home
      </Link>
      <Link to="/request-expert" className={link} onClick={close}>
        Request Expert
      </Link>

      {user ? (
        <>
          <Link to="/submit-incident" className={link} onClick={close}>
            Submit Incident
          </Link>
          <Link to="/my-incidents" className={link} onClick={close}>
            My Incidents
          </Link>
          <span className="text-cyan-400 py-1">{user.username}</span>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-left py-1">
            Logout
          </button>
        </>
      ) : (
        <Link to="/login" className={link} onClick={close}>
          Login/Register
        </Link>
      )}
    </>
  );
}
