import { useState, useEffect, useCallback } from 'react'
import { supabase, SimulationRun, PeerData, MetricData, isSupabaseConfigured } from '../lib/supabase'
import { SimulationConfig } from '../types'
import { ANATESimulation } from '../utils/simulation'

export function useSimulation() {
  const [currentRun, setCurrentRun] = useState<SimulationRun | null>(null)
  const [peers, setPeers] = useState<PeerData[]>([])
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localSimulation, setLocalSimulation] = useState<ANATESimulation | null>(null)

  const startSimulation = useCallback(async (config: SimulationConfig, userId: string) => {
    setLoading(true)
    try {
      if (isSupabaseConfigured()) {
        // Get the user's session token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Use Supabase backend with USER'S JWT token, not anon key
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulation-engine/start`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`, // Use user's JWT token
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ config }) // Remove userId - it comes from JWT
          })
    
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to start simulation')
          }
    
          const result = await response.json()
          setCurrentRun({ ...result, config })
          setIsRunning(true)
          subscribeToUpdates(result.runId)
        } else {
          // No session available, fall back to local simulation
          const simulation = new ANATESimulation(config)
          setLocalSimulation(simulation)
          setCurrentRun({
            id: 'local-run',
            simulation_id: 'local-sim',
            run_number: 1,
            config,
            start_time: new Date().toISOString(),
            status: 'running' as const,
            results: {},
            created_at: new Date().toISOString()
          })
          setIsRunning(true)
          simulation.startSimulation()
          
          // Convert local peers to database format
          const localPeers = simulation.getPeers().map(peer => ({
            id: peer.id,
            simulation_run_id: 'local-run',
            peer_id: peer.id,
            ip_address: peer.ip,
            port: peer.port,
            region: peer.region,
            is_seeder: peer.isSeeder,
            upload_speed: peer.uploadSpeed,
            download_speed: peer.downloadSpeed,
            bandwidth: peer.bandwidth,
            stability_score: peer.stability,
            churn_rate: peer.churnRate,
            download_progress: peer.downloadProgress,
            connection_time: new Date(peer.connectionTime).toISOString(),
            last_seen: new Date().toISOString(),
            metadata: {},
            created_at: new Date().toISOString()
          }))
          setPeers(localPeers)
          
          // Start local simulation loop
          startLocalSimulationLoop(simulation)
        }
      } else {
        // Use local simulation
        const simulation = new ANATESimulation(config)
        setLocalSimulation(simulation)
        setCurrentRun({
          id: 'local-run',
          simulation_id: 'local-sim',
          run_number: 1,
          config,
          start_time: new Date().toISOString(),
          status: 'running' as const,
          results: {},
          created_at: new Date().toISOString()
        })
        setIsRunning(true)
        simulation.startSimulation()
        
        // Convert local peers to database format
        const localPeers = simulation.getPeers().map(peer => ({
          id: peer.id,
          simulation_run_id: 'local-run',
          peer_id: peer.id,
          ip_address: peer.ip,
          port: peer.port,
          region: peer.region,
          is_seeder: peer.isSeeder,
          upload_speed: peer.uploadSpeed,
          download_speed: peer.downloadSpeed,
          bandwidth: peer.bandwidth,
          stability_score: peer.stability,
          churn_rate: peer.churnRate,
          download_progress: peer.downloadProgress,
          connection_time: new Date(peer.connectionTime).toISOString(),
          last_seen: new Date().toISOString(),
          metadata: {},
          created_at: new Date().toISOString()
        }))
        setPeers(localPeers)
        
        // Start local simulation loop
        startLocalSimulationLoop(simulation)
      }
    } catch (error) {
      console.error('Error starting simulation:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const startLocalSimulationLoop = useCallback((simulation: ANATESimulation) => {
    const interval = setInterval(() => {
      if (!isRunning) {
        clearInterval(interval)
        return
      }
      
      simulation.updateSimulation()
      
      // Update peers
      const updatedPeers = simulation.getPeers().map(peer => ({
        id: peer.id,
        simulation_run_id: 'local-run',
        peer_id: peer.id,
        ip_address: peer.ip,
        port: peer.port,
        region: peer.region,
        is_seeder: peer.isSeeder,
        upload_speed: peer.uploadSpeed,
        download_speed: peer.downloadSpeed,
        bandwidth: peer.bandwidth,
        stability_score: peer.stability,
        churn_rate: peer.churnRate,
        download_progress: peer.downloadProgress,
        connection_time: new Date(peer.connectionTime).toISOString(),
        last_seen: new Date().toISOString(),
        metadata: {},
        created_at: new Date().toISOString()
      }))
      setPeers(updatedPeers)
      
      // Update metrics
      const simMetrics = simulation.getMetrics()
      const metricsData = [
        { metric_type: 'total_peers', value: simMetrics.totalPeers },
        { metric_type: 'seeders', value: simMetrics.seeders },
        { metric_type: 'leechers', value: simMetrics.leechers },
        { metric_type: 'avg_download_speed', value: simMetrics.averageDownloadSpeed },
        { metric_type: 'avg_upload_speed', value: simMetrics.averageUploadSpeed },
        { metric_type: 'swarm_stability', value: simMetrics.swarmStability },
        { metric_type: 'redundant_transfers', value: simMetrics.redundantTransfers },
        { metric_type: 'completion_rate', value: simMetrics.completionRate }
      ]
      setMetrics(metricsData)
    }, 2000)
    
    // Stop after 60 seconds
    setTimeout(() => {
      clearInterval(interval)
      setIsRunning(false)
      simulation.stopSimulation()
    }, 60000)
  }, [isRunning])

  const stopSimulation = useCallback(async () => {
    if (!currentRun) return
  
    if (isSupabaseConfigured()) {
      try {
        // Get the user's session token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          throw new Error('Not authenticated')
        }
  
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulation-engine/stop`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`, // Use user's JWT token
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ runId: currentRun.id })
        })
  
        if (response.ok) {
          setIsRunning(false)
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to stop simulation')
        }
      } catch (error) {
        console.error('Error stopping simulation:', error)
      }
    } else {
      // Stop local simulation
      if (localSimulation) {
        localSimulation.stopSimulation()
      }
      setIsRunning(false)
    }
  }, [currentRun, localSimulation])

  const subscribeToUpdates = useCallback((runId: string) => {
    if (!isSupabaseConfigured()) return
    
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
    setLocalSimulation(null)
  }, [])

  // Get latest metrics aggregated by type
  const getLatestMetrics = useCallback(() => {
    if (Array.isArray(metrics)) {
      // Handle array format (from local simulation)
      const latestMetrics: { [key: string]: number } = {}
      metrics.forEach((metric: any) => {
        latestMetrics[metric.metric_type] = metric.value
      })
      return latestMetrics
    } else {
      // Handle object format (from Supabase)
      const latestMetrics: { [key: string]: number } = {}
      
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          latestMetrics[key] = value
        }
      })

      return latestMetrics
    }
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