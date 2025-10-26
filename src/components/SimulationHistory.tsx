import React, { useState, useEffect } from 'react'
import { Clock, Play, CheckCircle, XCircle, Users, Zap, Activity, TrendingUp, Download, Upload, Wifi } from 'lucide-react'

const SimulationHistory: React.FC = () => {
  const [animatingSimulation, setAnimatingSimulation] = useState<string | null>(null)
  const [simulationProgress, setSimulationProgress] = useState<{ [key: string]: number }>({})
  const [activeMetrics, setActiveMetrics] = useState<{ [key: string]: any }>({})

  // Mock simulation history with more detailed data
  const mockSimulations = [
    {
      id: '1',
      name: 'ANATE Performance Test',
      description: 'Testing ANATE with 100 peers under moderate network conditions',
      status: 'completed',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      config: { useANATE: true, peerCount: 100, fileSize: 1000, networkCondition: 'moderate' },
      results: {
        avgDownloadSpeed: 850,
        avgUploadSpeed: 420,
        completionRate: 94,
        redundancyReduction: 69,
        swarmStability: 85
      }
    },
    {
      id: '2', 
      name: 'Traditional BitTorrent Baseline',
      description: 'Baseline test with traditional BitTorrent protocol',
      status: 'completed',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      config: { useANATE: false, peerCount: 100, fileSize: 1000, networkCondition: 'moderate' },
      results: {
        avgDownloadSpeed: 520,
        avgUploadSpeed: 280,
        completionRate: 78,
        redundancyReduction: 0,
        swarmStability: 62
      }
    },
    {
      id: '3',
      name: 'Large Scale ANATE Test',
      description: 'Testing ANATE scalability with 200 peers',
      status: 'running',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      config: { useANATE: true, peerCount: 200, fileSize: 2000, networkCondition: 'optimal' },
      results: {
        avgDownloadSpeed: 1200,
        avgUploadSpeed: 650,
        completionRate: 67,
        redundancyReduction: 72,
        swarmStability: 88
      }
    }
  ]

  // Animation effect for running simulations
  useEffect(() => {
    const interval = setInterval(() => {
      mockSimulations.forEach(sim => {
        if (sim.status === 'running') {
          setSimulationProgress(prev => ({
            ...prev,
            [sim.id]: Math.min(100, (prev[sim.id] || 0) + Math.random() * 5)
          }))
          
          // Update active metrics with some randomness
          setActiveMetrics(prev => ({
            ...prev,
            [sim.id]: {
              peers: sim.config.peerCount + Math.floor(Math.random() * 20 - 10),
              speed: sim.results.avgDownloadSpeed + Math.random() * 200 - 100,
              completion: Math.min(100, (prev[sim.id]?.completion || sim.results.completionRate) + Math.random() * 2)
            }
          }))
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running':
        return <Activity className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSpeed = (speed: number): string => {
    if (speed > 1000) return `${(speed / 1000).toFixed(1)} MB/s`
    return `${speed.toFixed(0)} KB/s`
  }

  const startTestAnimation = (simulationId: string) => {
    setAnimatingSimulation(simulationId)
    setSimulationProgress(prev => ({ ...prev, [simulationId]: 0 }))
    
    // Simulate test progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 8 + 2
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        setTimeout(() => setAnimatingSimulation(null), 1000)
      }
      setSimulationProgress(prev => ({ ...prev, [simulationId]: progress }))
    }, 200)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-800">Simulation History</h3>
          <div className="flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-700 text-sm font-medium">Live Testing</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">ANATE Tests: {mockSimulations.filter(s => s.config.useANATE).length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Traditional: {mockSimulations.filter(s => !s.config.useANATE).length}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {mockSimulations.map((simulation) => {
          const isAnimating = animatingSimulation === simulation.id
          const progress = simulationProgress[simulation.id] || 0
          const metrics = activeMetrics[simulation.id]
          
          return (
            <div
              key={simulation.id}
              className={`border rounded-lg p-4 transition-all duration-300 ${
                simulation.status === 'running' 
                  ? 'border-blue-300 bg-blue-50 shadow-lg animate-pulse' 
                  : isAnimating
                  ? 'border-green-300 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(simulation.status)}
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center space-x-2">
                      <span>{simulation.name}</span>
                      {simulation.status === 'running' && (
                        <div className="flex items-center space-x-1 bg-blue-200 px-2 py-1 rounded-full animate-bounce">
                          <Activity className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">LIVE</span>
                        </div>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">{formatDate(simulation.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  {simulation.config?.useANATE ? (
                    <div className="flex items-center space-x-1 text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      <Zap className="w-4 h-4 animate-pulse" />
                      <span className="font-medium">ANATE</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      <Wifi className="w-4 h-4" />
                      <span>Traditional</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{simulation.config?.peerCount || 0} peers</span>
                  </div>
                </div>
              </div>
              
              {simulation.description && (
                <p className="text-gray-600 text-sm mb-3">{simulation.description}</p>
              )}

              {/* Live Metrics for Running Simulations */}
              {simulation.status === 'running' && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-blue-500 animate-bounce" />
                      <div>
                        <div className="font-medium text-blue-600">
                          {formatSpeed(metrics?.speed || simulation.results.avgDownloadSpeed)}
                        </div>
                        <div className="text-xs text-gray-500">Download Speed</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500 animate-pulse" />
                      <div>
                        <div className="font-medium text-green-600">
                          {metrics?.peers || simulation.config.peerCount}
                        </div>
                        <div className="text-xs text-gray-500">Active Peers</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500 animate-bounce" />
                      <div>
                        <div className="font-medium text-purple-600">
                          {(metrics?.completion || simulation.results.completionRate).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Completion</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                      <div>
                        <div className="font-medium text-yellow-600">
                          {simulation.results.swarmStability}%
                        </div>
                        <div className="text-xs text-gray-500">Stability</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Live Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Test Progress</span>
                      <span>{(metrics?.completion || simulation.results.completionRate).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-500 animate-pulse"
                        style={{ width: `${metrics?.completion || simulation.results.completionRate}%` }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Test Results */}
              {simulation.status === 'completed' && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{formatSpeed(simulation.results.avgDownloadSpeed)}</div>
                      <div className="text-xs text-gray-500">Avg Download</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{formatSpeed(simulation.results.avgUploadSpeed)}</div>
                      <div className="text-xs text-gray-500">Avg Upload</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{simulation.results.completionRate}%</div>
                      <div className="text-xs text-gray-500">Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-yellow-600">{simulation.results.swarmStability}%</div>
                      <div className="text-xs text-gray-500">Stability</div>
                    </div>
                  </div>
                  
                  {simulation.config.useANATE && (
                    <div className="mt-3 p-2 bg-green-100 rounded-lg">
                      <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">ANATE Improvement: {simulation.results.redundancyReduction}% less redundancy</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Test Animation Button */}
              {simulation.status === 'completed' && !isAnimating && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-between text-xs text-gray-500 flex-1">
                    <span>Status: <span className="capitalize font-medium text-green-600">{simulation.status}</span></span>
                    <span>Duration: ~{Math.floor(Math.random() * 45 + 15)}s</span>
                  </div>
                  <button
                    onClick={() => startTestAnimation(simulation.id)}
                    className="ml-4 flex items-center space-x-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full transition-all duration-200 hover:scale-105"
                  >
                    <Play className="w-3 h-3" />
                    <span>Replay Test</span>
                  </button>
                </div>
              )}

              {/* Animation Progress */}
              {isAnimating && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="flex items-center space-x-1">
                      <Activity className="w-3 h-3 animate-spin" />
                      <span>Running Test Animation...</span>
                    </span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Static Status for Non-Animated Completed Tests */}
              {simulation.status === 'completed' && !isAnimating && (
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span>Status: <span className="capitalize font-medium text-green-600">{simulation.status}</span></span>
                  <span>Runs: 1 • Duration: ~{Math.floor(Math.random() * 45 + 15)}s</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SimulationHistory