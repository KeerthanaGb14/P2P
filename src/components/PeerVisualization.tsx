import React, { useState, useEffect } from 'react';
import { Peer } from '../types';
import { Wifi, WifiOff, Download, Upload, Globe, Activity, Zap } from 'lucide-react';

interface PeerVisualizationProps {
  peers: Peer[];
}

const PeerVisualization: React.FC<PeerVisualizationProps> = ({ peers }) => {
  const [animationFrame, setAnimationFrame] = useState(0);
  const [activeTransfers, setActiveTransfers] = useState<Set<string>>(new Set());

  // Animation loop for continuous movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
      
      // Randomly activate transfers for visual effect
      const newActiveTransfers = new Set<string>();
      peers.forEach(peer => {
        if (Math.random() < 0.3) { // 30% chance of being active
          newActiveTransfers.add(peer.id);
        }
      });
      setActiveTransfers(newActiveTransfers);
    }, 500);

    return () => clearInterval(interval);
  }, [peers]);

  const formatSpeed = (speed: number): string => {
    if (speed > 1000) return `${(speed / 1000).toFixed(1)} MB/s`;
    return `${speed.toFixed(0)} KB/s`;
  };

  const getStatusColor = (peer: Peer): string => {
    if (peer.isSeeder) return 'bg-green-500';
    if (peer.downloadProgress > 50) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  const getStatusText = (peer: Peer): string => {
    if (peer.isSeeder) return 'Seeder';
    return 'Leecher';
  };

  const getPulseAnimation = (peer: Peer): string => {
    const isActive = activeTransfers.has(peer.id);
    if (isActive && peer.isSeeder) return 'animate-pulse ring-2 ring-green-300';
    if (isActive && !peer.isSeeder) return 'animate-pulse ring-2 ring-blue-300';
    return '';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-800">Live Peer Network</h3>
          <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 text-sm font-medium">Active</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Seeders ({peers.filter(p => p.isSeeder).length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Active Leechers ({peers.filter(p => !p.isSeeder && p.downloadProgress > 50).length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">New Leechers ({peers.filter(p => !p.isSeeder && p.downloadProgress <= 50).length})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Network Graph Visualization */}
        <div className="relative">
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-600" />
            <span>Network Topology</span>
          </h4>
          <div className="relative h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 overflow-hidden border-2 border-blue-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Central tracker with enhanced animation */}
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Wifi className="w-10 h-10 text-white" />
                  <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping opacity-30"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-bold text-purple-700 bg-white px-2 py-1 rounded-full shadow-md">
                  ANATE Hub
                </div>
                
                {/* Peer nodes with enhanced animations */}
                {peers.slice(0, 16).map((peer, index) => {
                  const angle = (index * 22.5) * (Math.PI / 180);
                  const radius = 120 + Math.sin(animationFrame * 0.1 + index) * 10; // Floating effect
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isActive = activeTransfers.has(peer.id);
                  
                  return (
                    <div key={peer.id}>
                      {/* Connection lines with data flow animation */}
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ zIndex: 1 }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${peer.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={peer.isSeeder ? '#10b981' : '#3b82f6'} stopOpacity="0.8" />
                            <stop offset="50%" stopColor={peer.isSeeder ? '#10b981' : '#3b82f6'} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={peer.isSeeder ? '#10b981' : '#3b82f6'} stopOpacity="0.1" />
                          </linearGradient>
                        </defs>
                        <line
                          x1="50%"
                          y1="50%"
                          x2={`calc(50% + ${x}px)`}
                          y2={`calc(50% + ${y}px)`}
                          stroke={`url(#gradient-${peer.id})`}
                          strokeWidth={isActive ? "3" : "1"}
                          className={isActive ? "animate-pulse" : ""}
                        />
                        
                        {/* Data flow particles */}
                        {isActive && (
                          <circle
                            r="2"
                            fill={peer.isSeeder ? '#10b981' : '#3b82f6'}
                            className="animate-pulse"
                          >
                            <animateMotion
                              dur="2s"
                              repeatCount="indefinite"
                              path={`M 50% 50% L ${50 + (x/4)}% ${50 + (y/4)}%`}
                            />
                          </circle>
                        )}
                      </svg>
                      
                      {/* Peer node */}
                      <div
                        className={`absolute w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${getStatusColor(peer)} ${getPulseAnimation(peer)}`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          zIndex: 2,
                        }}
                      >
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        
                        {/* Activity indicator */}
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                        
                        {/* Speed indicator */}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-white px-1 rounded shadow-sm">
                          {peer.isSeeder ? formatSpeed(peer.uploadSpeed) : formatSpeed(peer.downloadSpeed)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Network stats overlay */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
              <div className="text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Active Transfers: {activeTransfers.size}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Total Peers: {peers.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Peer List with Activity Indicators */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Live Peer Activity</span>
          </h4>
          <div className="h-80 overflow-y-auto space-y-2 pr-2">
            {peers.slice(0, 20).map((peer) => {
              const isActive = activeTransfers.has(peer.id);
              return (
                <div
                  key={peer.id}
                  className={`bg-gray-50 rounded-lg p-3 transition-all duration-300 ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-500 shadow-md' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(peer)} ${isActive ? 'animate-pulse ring-2 ring-blue-300' : ''}`}></div>
                      <span className="font-medium text-gray-800 text-sm">
                        {peer.ip}:{peer.port}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        peer.isSeeder 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getStatusText(peer)}
                      </span>
                      {isActive && (
                        <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <Zap className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs text-yellow-700 font-medium">Active</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Globe className="w-3 h-3" />
                      <span>{peer.region}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className={`flex items-center space-x-1 ${isActive && !peer.isSeeder ? 'text-blue-600 font-medium' : ''}`}>
                      <Download className={`w-3 h-3 ${isActive && !peer.isSeeder ? 'text-blue-600 animate-bounce' : 'text-blue-500'}`} />
                      <span className="text-gray-600">{formatSpeed(peer.downloadSpeed)}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${isActive && peer.isSeeder ? 'text-green-600 font-medium' : ''}`}>
                      <Upload className={`w-3 h-3 ${isActive && peer.isSeeder ? 'text-green-600 animate-bounce' : 'text-green-500'}`} />
                      <span className="text-gray-600">{formatSpeed(peer.uploadSpeed)}</span>
                    </div>
                  </div>
                  
                  {!peer.isSeeder && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{peer.downloadProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isActive ? 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse' : 'bg-blue-500'
                          }`}
                          style={{ width: `${peer.downloadProgress}%` }}
                        >
                          {isActive && (
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerVisualization;