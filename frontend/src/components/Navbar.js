import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@500&display=swap');

  :root {
    --rn-blood:      #8B0000;
    --rn-crimson:    #C0392B;
    --rn-scarlet:    #E74C3C;
    --rn-cream:      #FFFBF5;
    --rn-charcoal:   #1C1C1E;
    --rn-slate:      #4A4A4A;
    --rn-gold:       #C9A84C;
    --rn-muted:      #9B9B9B;
    --rn-font-d:     'Playfair Display', Georgia, serif;
    --rn-font-b:     'DM Sans', system-ui, sans-serif;
  }

  .rn-bar {
    position: sticky; top: 0; z-index: 1000;
    background: rgba(255,251,245,0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(139,0,0,0.08);
    font-family: var(--rn-font-b);
    transition: box-shadow 0.3s, background 0.3s;
  }
  .rn-bar.rn-scrolled {
    box-shadow: 0 4px 24px rgba(139,0,0,0.1);
    background: rgba(255,251,245,0.99);
  }

  .rn-inner {
    max-width: 1280px; margin: 0 auto;
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 48px; height: 68px;
  }

  .rn-logo {
    display: flex; align-items: center; gap: 9px;
    text-decoration: none; flex-shrink: 0;
  }
  .rn-logo-drop {
    width: 9px; height: 13px;
    background: var(--rn-crimson);
    border-radius: 50% 50% 50% 0 / 60% 60% 40% 0;
    transform: rotate(-30deg);
    animation: rn-drip 3s ease-in-out infinite;
  }
  @keyframes rn-drip {
    0%,100% { transform: rotate(-30deg) translateY(0); }
    50%      { transform: rotate(-30deg) translateY(3px); }
  }
  .rn-logo-word {
    font-family: var(--rn-font-d);
    font-size: 1.55rem; font-weight: 900;
    color: var(--rn-charcoal); letter-spacing: -0.02em; line-height: 1;
  }
  .rn-logo-word span { color: var(--rn-gold); }

  .rn-links {
    display: flex; align-items: center; gap: 2px;
    list-style: none; margin: 0; padding: 0;
  }
  .rn-links a {
    display: block; font-size: 0.9rem; font-weight: 500;
    color: var(--rn-slate); text-decoration: none;
    padding: 6px 13px; border-radius: 100px;
    position: relative; letter-spacing: 0.01em;
    transition: color 0.2s, background 0.2s;
  }
  .rn-links a:hover { color: var(--rn-blood); background: rgba(139,0,0,0.06); }
  .rn-links a.rn-active { color: var(--rn-blood); background: rgba(139,0,0,0.07); }
  .rn-links a.rn-active::after {
    content: '';
    position: absolute; bottom: 3px;
    left: 50%; transform: translateX(-50%);
    width: 14px; height: 2px;
    background: var(--rn-crimson); border-radius: 2px;
  }

  .rn-actions {
    display: flex; align-items: center; gap: 8px;
  }

  .rn-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 100px;
    font-family: var(--rn-font-b); font-size: 0.87rem; font-weight: 600;
    cursor: pointer; border: none; text-decoration: none; line-height: 1;
    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    white-space: nowrap;
  }
  .rn-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

  .rn-btn-login {
    background: transparent; color: var(--rn-blood);
    border: 1.5px solid rgba(139,0,0,0.25);
  }
  .rn-btn-login:hover {
    background: rgba(139,0,0,0.06); border-color: var(--rn-crimson);
    transform: translateY(-1px);
  }

  .rn-btn-donate {
    background: var(--rn-blood); color: white;
    box-shadow: 0 4px 14px rgba(139,0,0,0.22);
  }
  .rn-btn-donate:hover {
    background: var(--rn-crimson); transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139,0,0,0.32);
  }

  .rn-btn-admin {
    background: transparent; color: var(--rn-muted);
    border: 1.5px solid rgba(0,0,0,0.1);
    font-size: 0.82rem; padding: 8px 13px;
  }
  .rn-btn-admin:hover {
    color: var(--rn-charcoal); border-color: rgba(0,0,0,0.22);
    transform: translateY(-1px);
  }

  .rn-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 12px 4px 4px;
    background: rgba(139,0,0,0.05);
    border: 1.5px solid rgba(139,0,0,0.12);
    border-radius: 100px; cursor: pointer;
    transition: all 0.22s; position: relative;
  }
  .rn-chip:hover { background: rgba(139,0,0,0.1); border-color: rgba(139,0,0,0.25); }

  .rn-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, var(--rn-blood), var(--rn-scarlet));
    color: white; font-size: 0.78rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .rn-chip-name {
    font-size: 0.87rem; font-weight: 600; color: var(--rn-blood);
  }
  .rn-chevron {
    width: 13px; height: 13px; color: var(--rn-muted);
    transition: transform 0.2s; flex-shrink: 0;
  }
  .rn-chevron.rn-open { transform: rotate(180deg); }

  .rn-dd-wrap { position: relative; }
  .rn-dd {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: white; border: 1px solid rgba(0,0,0,0.08);
    border-radius: 16px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.13);
    padding: 8px; min-width: 210px; z-index: 20;
    animation: rn-pop 0.18s ease;
  }
  @keyframes rn-pop {
    from { opacity:0; transform: translateY(-8px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  .rn-dd::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--rn-blood), var(--rn-scarlet));
    border-radius: 16px 16px 0 0;
  }
  .rn-dd-head {
    padding: 11px 13px 9px;
    border-bottom: 1px solid rgba(0,0,0,0.06); margin-bottom: 5px;
  }
  .rn-dd-head strong { display:block; font-size:0.9rem; color:var(--rn-charcoal); font-weight:600; }
  .rn-dd-head span   { font-size:0.75rem; color:var(--rn-muted); }

  .rn-dd-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 9px 13px; border-radius: 9px;
    font-family: var(--rn-font-b); font-size: 0.87rem; font-weight: 500;
    color: var(--rn-slate); background: transparent;
    border: none; cursor: pointer; text-decoration: none;
    transition: all 0.16s; text-align: left;
  }
  .rn-dd-item svg { width:15px; height:15px; flex-shrink:0; }
  .rn-dd-item:hover { background: rgba(139,0,0,0.05); color: var(--rn-blood); }
  .rn-dd-item.rn-danger { color: var(--rn-crimson); }
  .rn-dd-item.rn-danger:hover { background: rgba(192,57,43,0.06); }
  .rn-dd-sep { height:1px; background:rgba(0,0,0,0.06); margin:5px 0; }

  .rn-burger {
    display: none; flex-direction: column; gap: 5px;
    cursor: pointer; padding: 6px; background: transparent; border: none;
  }
  .rn-burger span {
    display: block; width: 22px; height: 2px;
    background: var(--rn-charcoal); border-radius: 2px;
    transition: all 0.25s;
  }
  .rn-burger.rn-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .rn-burger.rn-open span:nth-child(2) { opacity:0; transform:scaleX(0); }
  .rn-burger.rn-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .rn-drawer {
    display: none; flex-direction: column;
    padding: 14px 20px 20px;
    border-top: 1px solid rgba(139,0,0,0.07);
    background: rgba(255,251,245,0.99);
    animation: rn-slide 0.22s ease;
  }
  @keyframes rn-slide {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .rn-drawer.rn-open { display: flex; }

  .rn-m-links {
    list-style: none; margin: 0 0 14px; padding: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .rn-m-links a {
    display: block; padding: 10px 13px; border-radius: 10px;
    font-size: 0.93rem; font-weight: 500;
    color: var(--rn-slate); text-decoration: none; transition: all 0.16s;
  }
  .rn-m-links a:hover, .rn-m-links a.rn-active {
    color: var(--rn-blood); background: rgba(139,0,0,0.06);
  }

  .rn-m-user {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 13px; border-radius: 12px;
    background: rgba(139,0,0,0.05);
    border: 1px solid rgba(139,0,0,0.1); margin-bottom: 10px;
  }
  .rn-m-user .rn-avatar { width:36px; height:36px; font-size:0.88rem; }
  .rn-m-user-info strong { display:block; font-size:0.9rem; color:var(--rn-charcoal); font-weight:600; }
  .rn-m-user-info span   { font-size:0.75rem; color:var(--rn-muted); }

  .rn-m-actions {
    display: flex; flex-direction: column; gap: 7px;
    padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06);
  }
  .rn-m-actions .rn-btn { justify-content: center; width: 100%; }

  @media (max-width: 960px) {
    .rn-links, .rn-actions { display: none !important; }
    .rn-burger { display: flex; }
    .rn-inner { padding: 0 20px; }
  }
`;

const IUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IAdmin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ILogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IHeart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
  </svg>
);
const IChevron = ({ open }) => (
  <svg className={`rn-chevron${open ? ' rn-open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const NAV = [
  { name: 'Donate',    path: '/donate'  },
  { name: 'Hospitals', path: '/centers' },
  { name: 'Request',   path: '/request' },
  { name: 'About',     path: '/about'   },
  { name: 'Contact',   path: '/contact' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [ddOpen,   setDdOpen]   = useState(false);
  const [mobOpen,  setMobOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (!ddOpen) return;
    const fn = (e) => { if (!e.target.closest('.rn-dd-wrap')) setDdOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ddOpen]);

  useEffect(() => { setMobOpen(false); setDdOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); setDdOpen(false); setMobOpen(false); navigate('/'); };
  const active = (p) => location.pathname === p ? 'rn-active' : '';

  const firstName = user?.name?.split(' ')[0] ?? '';
  const initials  = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header className={`rn-bar${scrolled ? ' rn-scrolled' : ''}`}>
        <div className="rn-inner">

          {/* LOGO */}
          <Link to="/" className="rn-logo">
            <div className="rn-logo-drop" />
            <span className="rn-logo-word">Rakt<span>.</span></span>
          </Link>

          {/* DESKTOP NAV */}
          <nav aria-label="Main navigation">
            <ul className="rn-links">
              {NAV.map(item => (
                <li key={item.path}>
                  <Link to={item.path} className={active(item.path)}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* DESKTOP RIGHT */}
          <div className="rn-actions">
            {user ? (
              <div className="rn-dd-wrap">
                <button className="rn-chip" onClick={() => setDdOpen(o => !o)}>
                  <div className="rn-avatar">{initials}</div>
                  <span className="rn-chip-name">{firstName}</span>
                  <IChevron open={ddOpen} />
                </button>

                {ddOpen && (
                  <div className="rn-dd">
                    <div className="rn-dd-head">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button className="rn-dd-item" onClick={() => { navigate('/profile'); setDdOpen(false); }}>
                      <IUser /> My Profile
                    </button>
                    <div className="rn-dd-sep" />
                    <button className="rn-dd-item rn-danger" onClick={handleLogout}>
                      <ILogout /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/donate" className="rn-btn rn-btn-donate"><IHeart /> Donate Blood</Link>
                <Link to="/admin"  className="rn-btn rn-btn-admin"><IAdmin /> Admin</Link>
              </>
            )}
          </div>

          {/* BURGER */}
          <button
            className={`rn-burger${mobOpen ? ' rn-open' : ''}`}
            onClick={() => setMobOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>
        </div>

        {/* MOBILE DRAWER */}
        <div className={`rn-drawer${mobOpen ? ' rn-open' : ''}`}>

          {user && (
            <div className="rn-m-user">
              <div className="rn-avatar" style={{ width:36, height:36, fontSize:'0.88rem' }}>{initials}</div>
              <div className="rn-m-user-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>
          )}

          <ul className="rn-m-links">
            {NAV.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={active(item.path)}>{item.name}</Link>
              </li>
            ))}
          </ul>

          <div className="rn-m-actions">
            {user ? (
              <>
                <button className="rn-btn rn-btn-login" onClick={() => { navigate('/profile'); setMobOpen(false); }}>
                  <IUser /> My Profile
                </button>
                <button className="rn-btn rn-btn-donate" style={{ background:'var(--rn-crimson)' }} onClick={handleLogout}>
                  <ILogout /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/donate" className="rn-btn rn-btn-donate"><IHeart /> Donate Blood</Link>
                <Link to="/admin"  className="rn-btn rn-btn-admin"><IAdmin /> Admin Login</Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;