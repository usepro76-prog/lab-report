import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus2, 
  FileText, 
  Settings, 
  LogOut, 
  Activity,
  X
} from 'lucide-react';
import { dbManager } from '../db/dbManager';

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ onLogout, isOpen, onClose }: SidebarProps) {
  const activeClass = "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl bg-blue-50 text-blue-600 transition-all";
  const inactiveClass = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all";

  // Helper to handle navigation link click on mobile
  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden no-print"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col justify-between h-screen no-print
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col gap-8">
          {/* Lab Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 tracking-tight leading-none text-[15px]">LabSuite</h1>
                <span className="text-[11px] text-gray-400 font-medium">LIMS Report v1.0</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5">
            <NavLink 
              to="/" 
              onClick={handleLinkClick}
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
              Dashboard
            </NavLink>
            
            <NavLink 
              to="/new-report" 
              onClick={handleLinkClick}
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              <FilePlus2 className="h-[18px] w-[18px]" />
              New Report
            </NavLink>

            <NavLink 
              to="/reports" 
              onClick={handleLinkClick}
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              <FileText className="h-[18px] w-[18px]" />
              Reports List
            </NavLink>

            <NavLink 
              to="/settings" 
              onClick={handleLinkClick}
              className={({ isActive }) => isActive ? activeClass : inactiveClass}
            >
              <Settings className="h-[18px] w-[18px]" />
              Lab Settings
            </NavLink>
          </nav>
        </div>

        {/* User Status and Logout */}
        <div className="p-6 border-t border-gray-50 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 uppercase border border-gray-200">
              {dbManager.getCurrentUser().charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-gray-800 truncate leading-none mb-1">
                {dbManager.getCurrentUser()}
              </p>
              <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">
                {dbManager.isSupabase() ? 'Connected SB' : 'Local Fallback'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors w-full cursor-pointer"
          >
            <LogOut className="h-[14px] w-[14px]" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
