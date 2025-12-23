import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { label: 'Dashboard affilié', path: '/affiliate', icon: 'chart' },
    { label: 'Mes liens', path: '/links', icon: 'link' },
    { label: 'Conversions', path: '/conversions', icon: 'conversion' },
    { label: 'Produits', path: '/products', icon: 'cube' },
    { label: 'Marketplace', path: '/marketplace', icon: 'store' },
    { label: 'ClickBank', path: '/clickbank', icon: 'clickbank' },
    { label: 'JVZoo', path: '/jvzoo', icon: 'jvzoo' },
    { label: 'Top affiliés', path: '/top-affiliates', icon: 'trophy' },
    { label: 'Approbations', path: '/approvals', icon: 'check' },
    { label: 'Paiements', path: '/payouts', icon: 'wallet' },
    { label: 'Test vente', path: '/test-sale', icon: 'sparkles' },
    { label: 'Test Pixel', path: '/test-sale-pixel', icon: 'pixel' },
    { label: 'Admin reports', path: '/admin-reports', icon: 'shield' },
  ];

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <aside className="sidebar flex flex-col gap-4">
      <div className="sidebar-header">
        <div className="h-10 w-10 rounded-xl bg-white/70 text-blue-700 font-extrabold flex items-center justify-center shadow-inner">
          RH
        </div>
        <div>
          <p className="text-sm font-semibold">Rhonat Affiliations</p>
          <span className="text-xs text-gray-600">Vue synthétique</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
              <SidebarIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button type="button" onClick={handleLogout} className="btn-ghost mt-auto justify-center text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v4" />
          <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Se déconnecter
      </button>
    </aside>
  );
}

function SidebarIcon({ name }: { name: string }) {
  switch (name) {
    case 'chart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3-3 3 4 4-6" />
        </svg>
      );
    case 'link':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 1 7.07 0l1.42 1.42a5 5 0 0 1-7.07 7.07l-1.42-1.42" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 1-7.07 0L5.5 9.57a5 5 0 0 1 7.07-7.07L14 3.93" />
        </svg>
      );
    case 'cube':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 4-8 4-8-4 8-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v6l8 4 8-4V7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m4 13 8 4 8-4" />
        </svg>
      );
    case 'store':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16l-1 11H5L4 7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 11h6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15h6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l1 4H8l1-4z" />
        </svg>
      );
    case 'clickbank':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h5a2 2 0 0 1 0 4H9V7h6" />
        </svg>
      );
    case 'jvzoo':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="3" ry="3" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M8 8h5M8 16h4" />
        </svg>
      );
    case 'trophy':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 17V7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14v2a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V5z" />
        </svg>
      );
    case 'check':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'wallet':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v12H3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11h4v4h-4a2 2 0 1 1 0-4z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19h2M6 18v2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 19h2M18 18v2" />
        </svg>
      );
    case 'pixel':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 12h10M7 17h6" />
        </svg>
      );
    case 'shield':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 6v6c0 4.7 3.1 8.7 8 9 4.9-.3 8-4.3 8-9V6l-8-3z" />
        </svg>
      );
    case 'conversion':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9l-5 5-3-3-4 4" />
          <circle cx="18" cy="9" r="2" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
