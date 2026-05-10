'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import { 
  Home, 
  Map as MapIcon, 
  Search, 
  Lightbulb, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Plane,
  Bell,
  Sparkles
} from 'lucide-react';
import { AIAssistant } from '@/components/ai/AIAssistant';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/trips', label: 'My Trips', icon: MapIcon },
  { href: '/explore/cities', label: 'Explore', icon: Search },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, setAIPanelOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-50 overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl relative z-20"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <Plane className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-syne font-bold text-xl whitespace-nowrap"
                >
                  Traveloop
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-300 transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center px-3 py-3 my-1 rounded-lg transition-all group ${
                  isActive ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'
                }`}>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
          
          {isAdmin && (
            <Link href="/admin">
              <div className={`flex items-center px-3 py-3 my-1 rounded-lg transition-all group ${
                pathname.startsWith('/admin') ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'
              }`}>
                <Settings className={`w-5 h-5 flex-shrink-0 ${pathname.startsWith('/admin') ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-medium whitespace-nowrap"
                    >
                      Admin
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-600">
              {user?.avatar ? (
                <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-3 flex-1 overflow-hidden"
                >
                  <p className="text-sm font-medium truncate">{user?.name || 'Traveler'}</p>
                  <button onClick={logout} className="text-xs text-slate-500 hover:text-amber-500 flex items-center mt-1">
                    <LogOut className="w-3 h-3 mr-1" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] relative z-0">
        {/* TOP NAVBAR */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="md:hidden flex items-center space-x-2">
            <Plane className="w-6 h-6 text-amber-500" />
            <span className="font-syne font-bold">Traveloop</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search destinations, trips..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/90 backdrop-blur-xl pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-200">
                {isActive && (
                  <motion.div layoutId="mobileTab" className="absolute -top-px w-8 h-1 bg-amber-500 rounded-b-full" />
                )}
                <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-amber-500' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'text-amber-500 font-medium' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* FLOATING AI BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAIPanelOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 flex items-center justify-center text-white z-40 border border-amber-400/50"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
      
      {/* AI ASSISTANT PANEL */}
      <AIAssistant />
    </div>
  );
}
