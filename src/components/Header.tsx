import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Bell, Activity, Menu } from 'lucide-react';
import { dbManager } from '../db/dbManager';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
}

export default function Header({ title, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dynamic Clock ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 no-print gap-3">
      {/* Left title and hamburger */}
      <div className="flex items-center gap-3">
        {/* Toggle Button for Sidebar */}
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 tracking-tight leading-none">{title}</h2>
          <p className="text-[10px] md:text-xs text-gray-400 font-medium">Diagnostic LIMS Workspace</p>
        </div>
      </div>

      {/* Center Quick Search */}
      <form onSubmit={handleSearchSubmit} className="w-full md:max-w-xs lg:max-w-md md:w-64 lg:w-96 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="search"
          placeholder="Fast search patients, report numbers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </form>

      {/* Right Tools: Date / Clock / Status */}
      <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 border-t md:border-t-0 pt-2.5 md:pt-0 border-gray-50">
        {/* Connection status pills */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/50 rounded-lg border border-blue-100/30">
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">
            System Operational
          </span>
        </div>

        {/* Date / Time */}
        <div className="flex items-center gap-2 text-right">
          <Calendar className="h-3.5 w-3.5 text-blue-500" />
          <div>
            <p className="text-[10px] font-bold text-gray-700 leading-none">{formattedDate}</p>
            <span className="text-[9px] text-gray-400 font-mono font-medium">{formattedTime}</span>
          </div>
        </div>

        {/* Fake Notification bell */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-blue-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
