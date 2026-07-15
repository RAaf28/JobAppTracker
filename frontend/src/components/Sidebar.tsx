'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/auth';
import {
  LayoutDashboard,
  Briefcase,
  Building,
  FileText,
  Calendar,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Companies', href: '/companies', icon: Building },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Interviews', href: '/interviews', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="fixed bottom-0 left-0 top-0 hidden w-64 border-r border-[#24262f] bg-[#16181d] px-4 py-6 md:flex md:flex-col justify-between">
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
            A
          </div>
          <span className="text-lg font-bold text-white tracking-wide">
            AppTracker
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600/10 text-blue-500'
                    : 'text-slate-400 hover:bg-[#1f222a] hover:text-white'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-blue-500' : 'text-slate-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Profile / Logout */}
      <div className="flex flex-col gap-4 border-t border-[#24262f] pt-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="truncate text-sm font-medium text-white">{user?.name}</span>
            <span className="truncate text-xs text-slate-500">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
