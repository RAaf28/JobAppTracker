'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/auth';
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  Building,
  FileText,
  Calendar,
  User,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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
    <header className="sticky top-0 z-40 border-b border-[#24262f] bg-[#16181d] px-6 py-4 md:hidden flex items-center justify-between">
      {/* Mobile Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-md">
          A
        </div>
        <span className="text-md font-bold text-white tracking-wide">
          AppTracker
        </span>
      </div>

      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="absolute top-[65px] left-0 right-0 border-b border-[#24262f] bg-[#16181d] px-6 py-4 shadow-2xl flex flex-col gap-6 md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600/10 text-blue-500'
                      : 'text-slate-400 hover:bg-[#1f222a] hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 border-t border-[#24262f] pt-4">
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
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
