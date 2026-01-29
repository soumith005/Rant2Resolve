
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  MessageSquare, 
  Megaphone, 
  Briefcase, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Users,
  MessagesSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Community Chat', path: '/chat', icon: MessagesSquare },
    ...(!isAdmin ? [
      { name: 'Raise Issue', path: '/raise-issue', icon: PlusCircle },
      { name: 'My Issues', path: '/my-issues', icon: MessageSquare },
      { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
    ] : [
      { name: 'Manage Issues', path: '/manage-issues', icon: MessageSquare },
      { name: 'User Management', path: '/users', icon: Users },
      { name: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
    ]),
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`bg-blue-900 text-blue-50 transition-all duration-300 relative shadow-lg ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between border-b border-blue-800">
        <span className={`font-bold text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          Rant2Resolve
        </span>
        <button onClick={() => setOpen(!isOpen)} className="p-1 hover:bg-blue-800 rounded transition-colors">
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-4 px-4 py-3 mb-2 rounded transition-all ${
                isActive ? 'bg-blue-700 text-white shadow-md' : 'hover:bg-blue-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
