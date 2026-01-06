import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Search, Menu, LogOut, User as UserIcon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, notifications } = useApp();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.hash = '#'}>
                <div className="h-8 w-8 bg-[#4A90E2] rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="font-bold text-xl tracking-tight hidden md:block">The Deal Room</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <>
                  <div className="relative">
                     <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                     {/* Notification Indicator specifically for David in the user story */}
                     {currentUser.role === 'stakeholder' && (
                         <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500" />
                     )}
                  </div>
                  
                  <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                    <div className="text-sm text-right hidden sm:block">
                        <p className="font-medium text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{currentUser.role === 'owner' ? 'Account Exec' : 'External Stakeholder'}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="Avatar" /> : <UserIcon className="h-5 w-5 text-gray-500" />}
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-gray-600 ml-2" title="Sign Out">
                        <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
