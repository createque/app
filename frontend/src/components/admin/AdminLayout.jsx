import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Clock,
  LayoutDashboard,
  FileText,
  Newspaper,
  Puzzle,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  User
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from '../../components/ui/sheet';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Strony', href: '/admin/pages', icon: FileText },
    { label: 'Posty', href: '/admin/posts', icon: Newspaper },
    { label: 'Widgety', href: '/admin/widgets', icon: Puzzle },
    { label: 'Ustawienia', href: '/admin/settings', icon: Settings },
    { label: 'Logi audytu', href: '/admin/audit-logs', icon: ScrollText },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (href) => location.pathname === href;

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">TimeLov</span>
            <span className="block text-xs text-gray-500">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-[#0066FF] text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50">
          <div className="w-10 h-10 rounded-full bg-[#0066FF]/20 flex items-center justify-center">
            <User className="w-5 h-5 text-[#0066FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.username || 'Admin'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full mt-3 text-gray-400 hover:text-white hover:bg-gray-800 justify-start gap-3"
        >
          <LogOut className="w-5 h-5" />
          Wyloguj się
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0F0F10]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#1A1A1C] border-r border-gray-800 hidden lg:flex flex-col">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A1C] border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#0066FF] flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">TimeLov</span>
        </Link>
        
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[#1A1A1C] border-gray-800">
            <SheetTitle className="sr-only">Menu nawigacji</SheetTitle>
            <div className="flex flex-col h-full">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
