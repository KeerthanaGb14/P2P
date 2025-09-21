import React from 'react';
import { Network, Zap, BarChart3 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Network className="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                ANATE
              </h1>
              <p className="text-blue-200 text-sm">Adaptive Network-Aware Torrent Ecosystem</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {children}
            {!isSupabaseConfigured() && (
              <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-yellow-400/30">
                <span className="text-sm font-medium text-yellow-200">Demo Mode</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium">69% Less Redundancy</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-5 h-5 text-green-300" />
              <span className="text-sm font-medium">57% Faster Downloads</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-blue-100 text-lg leading-relaxed max-w-4xl">
            Revolutionary hybrid P2P architecture that combines decentralized resilience with intelligent 
            central coordination, delivering unprecedented efficiency in torrent-based file sharing.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;