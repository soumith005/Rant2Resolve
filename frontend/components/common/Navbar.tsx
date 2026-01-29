
import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 bg-white border-b border-blue-200 flex items-center justify-between px-6 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-blue-50 rounded transition-colors text-slate-600"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white font-bold">R</div>
          <span className="font-semibold text-blue-900 hidden sm:block italic tracking-tight">Rant2Resolve</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-blue-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{user?.name}</p>
            <p className="text-xs text-blue-600 uppercase tracking-wider font-semibold">{user?.role}</p>
          </div>
          <img 
            src={user?.avatar} 
            alt="Profile" 
            className="w-10 h-10 rounded border-2 border-blue-200"
          />
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
