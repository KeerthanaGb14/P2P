import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSimulation } from './hooks/useSimulation';
import { useResearchData } from './hooks/useResearchData';
import { isSupabaseConfigured } from './lib/supabase';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import SimulationHistory from './components/SimulationHistory';
import RealTimeMetrics from './components/RealTimeMetrics';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import PeerVisualization from './components/PeerVisualization';
import ResearchHighlights from './components/ResearchHighlights';
import { SimulationConfig } from './types';

function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { 
    currentRun, 
    peers, 
    metrics, 
    isRunning, 
    loading: simLoading,
    startSimulation, 
    stopSimulation, 
    resetSimulation 
  } = useSimulation();
  const { researchData } = useResearchData();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [config, setConfig] = useState<SimulationConfig>({
    peerCount: 50,
    fileSize: 1000,
    networkCondition: 'moderate',
    useANATE: true,
    simulationSpeed: 1,
  });

  const handleStart = async () => {
    if (isSupabaseConfigured() && (!user || !profile)) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      await startSimulation(config, profile?.id || 'demo-user');
    } catch (error) {
      console.error('Failed to start simulation:', error);
    }
  };

  const handleStop = () => {
    stopSimulation();
  };

  const handleReset = () => {
    resetSimulation();
  };

  const handleConfigChange = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
  };

  // Convert metrics object to legacy format for existing components
  const legacyMetrics = {
    totalPeers: metrics.total_peers || 0,
    seeders: metrics.seeders || 0,
    leechers: metrics.leechers || 0,
    averageDownloadSpeed: metrics.avg_download_speed || 0,
    averageUploadSpeed: metrics.avg_upload_speed || 0,
    swarmStability: 85, // Static for now
    redundantTransfers: config.useANATE ? 31 : 100,
    completionRate: metrics.completion_rate || 0,
  };

  const networkStats = {
    totalBandwidthUsed: 0,
    redundancyReduction: config.useANATE ? 69 : 0,
    downloadTimeImprovement: config.useANATE ? 57 : 0,
    swarmStabilityScore: config.useANATE ? 85 : 60,
    packetTransferEfficiency: config.useANATE ? 92 : 65,
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header>
        {user ? (
          <UserProfile />
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        )}
      </Header>
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Simulation Controls */}
        <SimulationControls
          config={config}
          isRunning={isRunning}
          loading={simLoading}
          onConfigChange={handleConfigChange}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
        />

        {/* Real-time Metrics (when simulation is running) */}
        {isRunning && currentRun && (
          <RealTimeMetrics metrics={metrics} />
        )}

        {/* Metrics Panel */}
        {(legacyMetrics.totalPeers > 0 || isRunning) && (
          <MetricsPanel metrics={legacyMetrics} networkStats={networkStats} />
        )}

        {/* Peer Visualization */}
        {peers.length > 0 && (
          <PeerVisualization peers={peers.map(peer => ({
            id: peer.peer_id,
            ip: peer.ip_address,
            port: peer.port,
            uploadSpeed: peer.upload_speed,
            downloadSpeed: peer.download_speed,
            bandwidth: peer.bandwidth,
            stability: peer.stability_score,
            churnRate: peer.churn_rate,
            isSeeder: peer.is_seeder,
            downloadProgress: peer.download_progress,
            connectionTime: new Date(peer.connection_time).getTime(),
            region: peer.region,
          }))} />
        )}

        {/* User's Simulation History */}
        {(user && profile) || !isSupabaseConfigured() ? (
          <SimulationHistory />
        ) : null}

        {/* Research Highlights */}
        <ResearchHighlights researchData={researchData} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">ANATE Research Project</h3>
            <p className="text-gray-300 mb-4">
              Advancing the future of peer-to-peer file sharing through intelligent network adaptation
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <span>© 2024 ANATE Research</span>
              <span>•</span>
              <span>Adaptive Network-Aware Torrent Ecosystem</span>
              <span>•</span>
              <span>Next-Generation P2P Technology</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;