'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0d0e12] text-slate-100 flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
          {/* Mobile Top Header */}
          <Header />

          {/* Page Body */}
          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
