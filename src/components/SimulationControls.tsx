import React from 'react';
import { Play, Pause, RotateCcw, Settings, Users, Wifi } from 'lucide-react';
import { SimulationConfig } from '../types';

interface SimulationControlsProps {
  config: SimulationConfig;
  isRunning: boolean;
  loading?: boolean;
  onConfigChange: (config: SimulationConfig) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  config,
  isRunning,
  loading = false,
  onConfigChange,
  onStart,
  onStop,
  onReset,
}) => {
  const handleConfigChange = (key: keyof SimulationConfig, value: any) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Simulation Controls</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={isRunning ? onStop : onStart}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Starting...</span>
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start</span>
              </>
            )}
          </button>
          
          <button
            onClick={onReset}
            disabled={loading || isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Users className="w-4 h-4" />
            <span>Peer Count</span>
          </label>
          <input
            type="range"
            min="10"
            max="200"
            value={config.peerCount}
            onChange={(e) => handleConfigChange('peerCount', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-center text-sm text-gray-600 font-medium">
            {config.peerCount} peers
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Wifi className="w-4 h-4" />
            <span>Network Condition</span>
          </label>
          <select
            value={config.networkCondition}
            onChange={(e) => handleConfigChange('networkCondition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="optimal">Optimal</option>
            <option value="moderate">Moderate</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">File Size (MB)</label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            value={config.fileSize}
            onChange={(e) => handleConfigChange('fileSize', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="text-center text-sm text-gray-600 font-medium">
            {config.fileSize} MB
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">ANATE Protocol</label>
          <div className="flex items-center justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.useANATE}
                onChange={(e) => handleConfigChange('useANATE', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {config.useANATE ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;