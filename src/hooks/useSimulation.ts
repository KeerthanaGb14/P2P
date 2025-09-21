import { useState, useEffect, useCallback } from 'react'
import { supabase, SimulationRun, PeerData, MetricData } from '../lib/supabase'
import { SimulationConfig } from '../types'

export function useSimulation() {
  const [currentRun, setCurrentRun] = useState<SimulationRun | null>(null)
  const [peers, setPeers] = useState<PeerData[]>([])
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(false)

  const startSimulation = useCallback(async (config: SimulationConfig, userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulation-engine/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, userId })
      })

      const result = await response.json()
      if (response.ok) {
        setCurrentRun({ ...result, config })
        setIsRunning(true)
        
        // Start real-time subscriptions
        subscribeToUpdates(result.runId)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const stopSimulation = useCallback(async () => {
    if (!currentRun) return

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulation-engine/stop`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ runId: currentRun.id })
      })

      if (response.ok) {
        setIsRunning(false)
      }
    } catch (error) {
      console.error('Error stopping simulation:', error)
    }
  }, [currentRun])

  const subscribeToUpdates = useCallback((runId: string) => {
    // Subscribe to peer updates
    const peerSubscription = supabase
      .channel(`peers:${runId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'peers',
          filter: `simulation_run_id=eq.${runId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPeers(prev => [...prev, payload.new as PeerData])
          } else if (payload.eventType === 'UPDATE') {
            setPeers(prev => prev.map(peer => 
              peer.id === payload.new.id ? payload.new as PeerData : peer
            ))
          } else if (payload.eventType === 'DELETE') {
            setPeers(prev => prev.filter(peer => peer.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to metrics updates
    const metricsSubscription = supabase
      .channel(`metrics:${runId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'metrics',
          filter: `simulation_run_id=eq.${runId}`
        },
        (payload) => {
          setMetrics(prev => [...prev, payload.new as MetricData])
        }
      )
      .subscribe()

    return () => {
      peerSubscription.unsubscribe()
      metricsSubscription.unsubscribe()
    }
  }, [])

  const resetSimulation = useCallback(() => {
    setCurrentRun(null)
    setPeers([])
    setMetrics([])
    setIsRunning(false)
  }, [])

  // Get latest metrics aggregated by type
  const getLatestMetrics = useCallback(() => {
    const latestMetrics: { [key: string]: number } = {}
    
    metrics.forEach(metric => {
      if (!latestMetrics[metric.metric_type] || 
          new Date(metric.timestamp) > new Date(latestMetrics[metric.metric_type + '_timestamp'] || 0)) {
        latestMetrics[metric.metric_type] = metric.value
        latestMetrics[metric.metric_type + '_timestamp'] = metric.timestamp
      }
    })

    // Clean up timestamp keys
    Object.keys(latestMetrics).forEach(key => {
      if (key.endsWith('_timestamp')) {
        delete latestMetrics[key]
      }
    })

    return latestMetrics
  }, [metrics])

  return {
    currentRun,
    peers,
    metrics: getLatestMetrics(),
    isRunning,
    loading,
    startSimulation,
    stopSimulation,
    resetSimulation
  }
}