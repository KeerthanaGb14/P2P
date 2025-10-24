import React, { useState, useEffect } from 'react'
import { Clock, Play, CheckCircle, XCircle, Users, Zap } from 'lucide-react'

const SimulationHistory: React.FC = () => {
  // Mock simulation history for local mode
  const mockSimulations = [
    {
      id: '1',
      name: 'ANATE Performance Test',
      description: 'Testing ANATE with 100 peers under moderate network conditions',
      status: 'completed',
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      config: { useANATE: true, peerCount: 100 }
    },
    {
      id: '2', 
      name: 'Traditional BitTorrent Baseline',
      description: 'Baseline test with traditional BitTorrent protocol',
      status: 'completed',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      config: { useANATE: false, peerCount: 100 }
    },
    {
      id: '3',
      name: 'Large Scale ANATE Test',
      description: 'Testing ANATE scalability with 200 peers',
      status: 'completed', 
      created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      config: { useANATE: true, peerCount: 200 }
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'running':
        return <Play className="w-5 h-5 text-blue-500" />
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Simulation History</h3>
      
      <div className="space-y-4">
        {mockSimulations.map((simulation) => (
          <div
            key={simulation.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(simulation.status)}
                <div>
                  <h4 className="font-medium text-gray-800">{simulation.name}</h4>
                  <p className="text-sm text-gray-500">{formatDate(simulation.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                {simulation.config?.useANATE ? (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Zap className="w-4 h-4" />
                    <span>ANATE</span>
                  </div>
                ) : (
                  <span className="text-gray-600">Traditional</span>
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
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Status: <span className="capitalize">{simulation.status}</span></span>
              <span>Runs: 1</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimulationHistory