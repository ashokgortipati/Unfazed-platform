import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  UserCheck,
  Settings,
  Bell,
  FolderOpen,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = () => {
  const { role } = useAuth();

  const therapistNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Session Notes', path: '/notes', icon: FileText },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Practice Settings', path: '/settings', icon: Settings },
  ];

  const clientNavItems = [
    { label: 'Client Portal', path: '/portal', icon: ShieldCheck },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Shared Notes', path: '/notes', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const navItems = role === 'therapist' ? therapistNavItems : clientNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {role === 'therapist' ? 'Clinical Workspace' : 'Personal Care Portal'}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sage-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Security badge at bottom of sidebar */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sage-50 to-teal-50 border border-sage-100/80 text-xs">
        <div className="flex items-center gap-2 text-sage-800 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-sage-600" />
          <span>Secure Clinical Mode</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Session-authenticated environment. Client notes & records strictly partitioned.
        </p>
      </div>
    </aside>
  );
};
