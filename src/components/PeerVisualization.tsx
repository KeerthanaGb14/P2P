import React from 'react';
import { Peer } from '../types';
import { Wifi, WifiOff, Download, Upload, Globe } from 'lucide-react';

interface PeerVisualizationProps {
  peers: Peer[];
}

const PeerVisualization: React.FC<PeerVisualizationProps> = ({ peers }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Peer Network Visualization</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Seeders</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Active Leechers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">New Leechers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Graph Visualization */}
        <div className="relative">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Network Topology</h4>
          <div className="relative h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Central tracker */}
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Wifi className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-purple-600">
                  ANATE Tracker
                </div>
                
                {/* Peer nodes arranged in circles */}
                {peers.slice(0, 12).map((peer, index) => {
                  const angle = (index * 30) * (Math.PI / 180);
                  const radius = 120;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={peer.id}
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center shadow-md transform -translate-x-1/2 -translate-y-1/2 ${getStatusColor(peer)}`}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      
                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line
                          x1="50%"
                          y1="50%"
                          x2={`calc(50% - ${x}px)`}
                          y2={`calc(50% - ${y}px)`}
                          stroke={peer.isSeeder ? '#10b981' : '#3b82f6'}
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Peer List */}
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-4">Active Peers</h4>
          <div className="h-80 overflow-y-auto space-y-2 pr-2">
            {peers.slice(0, 20).map((peer) => (
              <div
                key={peer.id}
                className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(peer)}`}></div>
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
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Globe className="w-3 h-3" />
                    <span>{peer.region}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3 text-blue-500" />
                    <span className="text-gray-600">{formatSpeed(peer.downloadSpeed)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Upload className="w-3 h-3 text-green-500" />
                    <span className="text-gray-600">{formatSpeed(peer.uploadSpeed)}</span>
                  </div>
                </div>
                
                {!peer.isSeeder && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{peer.downloadProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${peer.downloadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerVisualization;