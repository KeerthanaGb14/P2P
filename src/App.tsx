import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import PeerVisualization from './components/PeerVisualization';
import ResearchHighlights from './components/ResearchHighlights';
import { ANATESimulation } from './utils/simulation';
import { SimulationConfig } from './types';

function App() {
  const [config, setConfig] = useState<SimulationConfig>({
    peerCount: 50,
    fileSize: 1000,
    networkCondition: 'moderate',
    useANATE: true,
    simulationSpeed: 1,
  });

  const [isRunning, setIsRunning] = useState(false);
  const simulationRef = useRef<ANATESimulation | null>(null);
  const [metrics, setMetrics] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);
  const [peers, setPeers] = useState([]);

  useEffect(() => {
    initializeSimulation();
  }, [config]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && simulationRef.current) {
      interval = setInterval(() => {
        simulationRef.current?.updateSimulation();
        updateDisplayData();
      }, 1000 / config.simulationSpeed);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, config.simulationSpeed]);

  const initializeSimulation = () => {
    simulationRef.current = new ANATESimulation(config);
    updateDisplayData();
  };

  const updateDisplayData = () => {
    if (simulationRef.current) {
      setMetrics(simulationRef.current.getMetrics());
      setNetworkStats(simulationRef.current.getNetworkStats());
      setPeers(simulationRef.current.getPeers());
    }
  };

  const handleStart = () => {
    if (simulationRef.current) {
      simulationRef.current.startSimulation();
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    if (simulationRef.current) {
      simulationRef.current.stopSimulation();
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    initializeSimulation();
  };

  const handleConfigChange = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
    if (isRunning) {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Simulation Controls */}
        <SimulationControls
          config={config}
          isRunning={isRunning}
          onConfigChange={handleConfigChange}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
        />

        {/* Metrics Panel */}
        {metrics && networkStats && (
          <MetricsPanel metrics={metrics} networkStats={networkStats} />
        )}

        {/* Peer Visualization */}
        {peers.length > 0 && (
          <PeerVisualization peers={peers} />
        )}

        {/* Research Highlights */}
        <ResearchHighlights />
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