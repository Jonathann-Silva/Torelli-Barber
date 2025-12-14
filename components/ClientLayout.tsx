import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ClientLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-background-light dark:bg-background-dark-blue text-slate-900 dark:text-white font-jakarta overflow-x-hidden min-h-screen pb-24 selection:bg-primary-blue selection:text-white">
      {children}
      
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#101922]/95 backdrop-blur-lg border-t border-gray-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 pb-1">
          <button onClick={() => navigate('/client/dashboard')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive('/client/dashboard') ? 'text-primary-blue' : 'text-gray-500 hover:text-gray-300'}`}>
            <span className={`material-symbols-outlined text-[24px] ${isActive('/client/dashboard') ? 'filled' : ''}`}>home</span>
            <span className="text-[10px] font-bold">Início</span>
          </button>
          <button onClick={() => navigate('/client/booking')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive('/client/booking') ? 'text-primary-blue' : 'text-gray-500 hover:text-gray-300'}`}>
            <span className={`material-symbols-outlined text-[24px] ${isActive('/client/booking') ? 'filled' : ''}`}>calendar_month</span>
            <span className="text-[10px] font-medium">Agenda</span>
          </button>
          
          <div className="-mt-8">
            <button onClick={() => navigate('/client/booking')} className="flex items-center justify-center size-14 rounded-full bg-gradient-to-r from-primary-gold to-[#A08328] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] border-4 border-background-dark-blue transform active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-[28px] font-bold">content_cut</span>
            </button>
          </div>

          <button onClick={() => navigate('/client/gallery')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive('/client/gallery') ? 'text-primary-blue' : 'text-gray-500 hover:text-gray-300'}`}>
            <span className={`material-symbols-outlined text-[24px] ${isActive('/client/gallery') ? 'filled' : ''}`}>photo_library</span>
            <span className="text-[10px] font-medium">Galeria</span>
          </button>
          <button onClick={() => navigate('/client/profile')} className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive('/client/profile') ? 'text-primary-blue' : 'text-gray-500 hover:text-gray-300'}`}>
            <span className={`material-symbols-outlined text-[24px] ${isActive('/client/profile') ? 'filled' : ''}`}>person</span>
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ClientLayout;