import React, { useState, useEffect } from 'react'
import { Clock, Play, CheckCircle, XCircle, Users, Zap } from 'lucide-react'
import { supabase, Simulation } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const SimulationHistory: React.FC = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile) {
      fetchSimulations()
    }
  }, [profile])

  const fetchSimulations = async () => {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select(`
          *,
          simulation_runs(
            *,
            metrics(*)
          )
        `)
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSimulations(data || [])
    } catch (error) {
      console.error('Error fetching simulations:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Simulation History</h3>
      
      {simulations.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No simulations yet. Start your first simulation to see results here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {simulations.map((simulation) => (
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
                <span>
                  Runs: {(simulation as any).simulation_runs?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimulationHistory