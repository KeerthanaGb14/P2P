import React from 'react';
import { SwarmMetrics, NetworkStats } from '../types';
import { Users, Download, Upload, Shield, Zap, TrendingUp } from 'lucide-react';

interface MetricsPanelProps {
  metrics: SwarmMetrics;
  networkStats: NetworkStats;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, networkStats }) => {
  const formatSpeed = (speed: number): string => {
    if (speed > 1000) return `${(speed / 1000).toFixed(1)} MB/s`;
    return `${speed.toFixed(0)} KB/s`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes > 1000000) return `${(bytes / 1000000).toFixed(1)} GB`;
    if (bytes > 1000) return `${(bytes / 1000).toFixed(1)} MB`;
    return `${bytes.toFixed(0)} KB`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Swarm Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Swarm Overview</h3>
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Peers</span>
            <span className="font-semibold text-gray-800">{metrics.totalPeers}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Seeders</span>
            <span className="font-semibold text-green-600">{metrics.seeders}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Leechers</span>
            <span className="font-semibold text-orange-600">{metrics.leechers}</span>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-semibold text-blue-600">{metrics.completionRate.toFixed(1)}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
          <TrendingUp className="w-6 h-6 text-green-600" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Avg Download</span>
            </div>
            <span className="font-semibold text-blue-600">
              {formatSpeed(metrics.averageDownloadSpeed)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Avg Upload</span>
            </div>
            <span className="font-semibold text-green-600">
              {formatSpeed(metrics.averageUploadSpeed)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">Swarm Stability</span>
            </div>
            <span className="font-semibold text-purple-600">
              {metrics.swarmStability.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-600">Redundant Transfers</span>
            </div>
            <span className="font-semibold text-yellow-600">
              {metrics.redundantTransfers.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* ANATE Improvements */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">ANATE Benefits</h3>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Redundancy Reduction</span>
              <span className="font-bold text-green-600">-{networkStats.redundancyReduction}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${networkStats.redundancyReduction}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Download Time Improvement</span>
              <span className="font-bold text-blue-600">-{networkStats.downloadTimeImprovement}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${networkStats.downloadTimeImprovement}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Packet Transfer Efficiency</span>
              <span className="font-bold text-purple-600">{networkStats.packetTransferEfficiency}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${networkStats.packetTransferEfficiency}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;