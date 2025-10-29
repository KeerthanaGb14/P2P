import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { useResearchData } from './hooks/useResearchData';
import Header from './components/Header';
import SimulationHistory from './components/SimulationHistory';
import RealTimeMetrics from './components/RealTimeMetrics';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import PeerVisualization from './components/PeerVisualization';
import ResearchHighlights from './components/ResearchHighlights';
import { SimulationConfig } from './types';

function App() {
  const { 
    currentRun, 
    peers, 
    metrics, 
    isRunning, 
    loading: simLoading,
    startSimulation, 
    stopSimulation, 
    resetSimulation,
    exportSimulationDataToCsv
  } = useSimulation();
  const { researchData } = useResearchData();
  
  const [config, setConfig] = useState<SimulationConfig>({
    peerCount: 50,
    fileSize: 1000,
    networkCondition: 'moderate',
    useANATE: true,
    simulationSpeed: 1,
  });

  const handleStart = async () => {
    try {
      await startSimulation(config, 'demo-user');
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

  const handleExportCsv = () => {
    try {
      const csvData = exportSimulationDataToCsv();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `anate-simulation-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export simulation data. Please ensure a simulation is running.');
    }
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
    swarmStability: metrics.swarm_stability || 0,
    redundantTransfers: metrics.redundant_transfers || 0,
    completionRate: metrics.completion_rate || 0,
  };

  const networkStats = {
    totalBandwidthUsed: 0,
    redundancyReduction: config.useANATE ? 69 : 0,
    downloadTimeImprovement: config.useANATE ? 57 : 0,
    swarmStabilityScore: config.useANATE ? 85 : 60,
    packetTransferEfficiency: config.useANATE ? 92 : 65,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
          onExportCsv={handleExportCsv}
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

        {/* Simulation History */}
        <SimulationHistory />

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
    </div>
  );
}

export default App;