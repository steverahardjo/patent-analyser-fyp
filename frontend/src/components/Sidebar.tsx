import { NavLink } from 'react-router-dom';
import { Upload, MessageSquare, Home, BarChart } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/charts', icon: BarChart, label: 'Charts' },
    { to: '/chat', icon: MessageSquare, label: 'Chatbot' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex flex-col h-full">
            <nav className="space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                }
                >
                <Icon className="w-5 h-5 mr-3" />
                {label}
                </NavLink>
            ))}
            </nav>
        </div>
    </div>
  );
};

export default Sidebar;