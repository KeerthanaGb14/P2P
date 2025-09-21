import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface SimulationConfig {
  peerCount: number
  fileSize: number
  networkCondition: 'optimal' | 'moderate' | 'poor'
  useANATE: boolean
  simulationSpeed: number
}

interface PeerData {
  id: string
  ip: string
  port: number
  region: string
  isSeeder: boolean
  uploadSpeed: number
  downloadSpeed: number
  bandwidth: number
  stability: number
  churnRate: number
  downloadProgress: number
  connectionTime: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { method } = req
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (method) {
      case 'POST':
        if (path === 'start') {
          return await startSimulation(req, supabaseClient)
        } else if (path === 'update') {
          return await updateSimulation(req, supabaseClient)
        }
        break
      case 'GET':
        if (path === 'status') {
          return await getSimulationStatus(req, supabaseClient)
        }
        break
      case 'DELETE':
        if (path === 'stop') {
          return await stopSimulation(req, supabaseClient)
        }
        break
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function startSimulation(req: Request, supabase: any) {
  const { config, userId }: { config: SimulationConfig, userId: string } = await req.json()

  // Create simulation record
  const { data: simulation, error: simError } = await supabase
    .from('simulations')
    .insert({
      user_id: userId,
      name: `ANATE Simulation ${new Date().toISOString()}`,
      description: `${config.useANATE ? 'ANATE' : 'Traditional'} simulation with ${config.peerCount} peers`,
      config,
      status: 'running'
    })
    .select()
    .single()

  if (simError) throw simError

  // Create simulation run
  const { data: run, error: runError } = await supabase
    .from('simulation_runs')
    .insert({
      simulation_id: simulation.id,
      config,
      status: 'running'
    })
    .select()
    .single()

  if (runError) throw runError

  // Generate initial peers
  const peers = generatePeers(config, run.id)
  
  const { error: peersError } = await supabase
    .from('peers')
    .insert(peers)

  if (peersError) throw peersError

  // Start background simulation process
  EdgeRuntime.waitUntil(runSimulationLoop(supabase, run.id, config))

  return new Response(JSON.stringify({ 
    simulationId: simulation.id,
    runId: run.id,
    status: 'started'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updateSimulation(req: Request, supabase: any) {
  const { runId, metrics } = await req.json()

  // Insert metrics
  const metricsData = Object.entries(metrics).map(([type, value]) => ({
    simulation_run_id: runId,
    metric_type: type,
    value: value as number,
    timestamp: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('metrics')
    .insert(metricsData)

  if (error) throw error

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getSimulationStatus(req: Request, supabase: any) {
  const url = new URL(req.url)
  const runId = url.searchParams.get('runId')

  if (!runId) {
    return new Response(JSON.stringify({ error: 'runId required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Get simulation run with latest metrics
  const { data: run, error: runError } = await supabase
    .from('simulation_runs')
    .select(`
      *,
      simulation:simulations(*),
      peers(*),
      metrics(*)
    `)
    .eq('id', runId)
    .single()

  if (runError) throw runError

  return new Response(JSON.stringify(run), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function stopSimulation(req: Request, supabase: any) {
  const { runId } = await req.json()

  const { error } = await supabase
    .from('simulation_runs')
    .update({ 
      status: 'completed',
      end_time: new Date().toISOString()
    })
    .eq('id', runId)

  if (error) throw error

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function generatePeers(config: SimulationConfig, runId: string): any[] {
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa']
  const peers = []

  for (let i = 0; i < config.peerCount; i++) {
    const isSeeder = Math.random() < 0.3
    const baseSpeed = getBaseSpeedByCondition(config.networkCondition)
    
    peers.push({
      simulation_run_id: runId,
      peer_id: `peer-${i}`,
      ip_address: generateIP(),
      port: 6881 + Math.floor(Math.random() * 100),
      region: regions[Math.floor(Math.random() * regions.length)],
      is_seeder: isSeeder,
      upload_speed: baseSpeed * (0.5 + Math.random() * 0.5),
      download_speed: baseSpeed * (0.8 + Math.random() * 0.4),
      bandwidth: baseSpeed * (1 + Math.random()),
      stability_score: Math.random() * 100,
      churn_rate: Math.random() * 0.1,
      download_progress: isSeeder ? 100 : Math.random() * 80,
      connection_time: new Date().toISOString(),
      last_seen: new Date().toISOString()
    })
  }

  return peers
}

function getBaseSpeedByCondition(condition: string): number {
  switch (condition) {
    case 'optimal': return 1000
    case 'moderate': return 500
    case 'poor': return 100
    default: return 500
  }
}

function generateIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

async function runSimulationLoop(supabase: any, runId: string, config: SimulationConfig) {
  const duration = 60000 // Run for 1 minute
  const interval = 2000 // Update every 2 seconds
  const startTime = Date.now()

  while (Date.now() - startTime < duration) {
    try {
      // Get current peers
      const { data: peers, error } = await supabase
        .from('peers')
        .select('*')
        .eq('simulation_run_id', runId)

      if (error) {
        console.error('Error fetching peers:', error)
        break
      }

      // Update peer progress
      const updatedPeers = peers.map((peer: any) => {
        if (!peer.is_seeder && peer.download_progress < 100) {
          const progressIncrease = config.useANATE 
            ? (peer.download_speed / 1000) * 2
            : (peer.download_speed / 1000) * 1

          const newProgress = Math.min(100, peer.download_progress + progressIncrease)
          
          return {
            ...peer,
            download_progress: newProgress,
            is_seeder: newProgress >= 100,
            last_seen: new Date().toISOString()
          }
        }
        return { ...peer, last_seen: new Date().toISOString() }
      })

      // Update peers in database
      for (const peer of updatedPeers) {
        await supabase
          .from('peers')
          .update({
            download_progress: peer.download_progress,
            is_seeder: peer.is_seeder,
            last_seen: peer.last_seen
          })
          .eq('id', peer.id)
      }

      // Calculate and store metrics
      const seeders = updatedPeers.filter((p: any) => p.is_seeder).length
      const leechers = updatedPeers.filter((p: any) => !p.is_seeder).length
      const avgDownloadSpeed = updatedPeers
        .filter((p: any) => !p.is_seeder)
        .reduce((sum: number, p: any) => sum + p.download_speed, 0) / Math.max(leechers, 1)

      const metrics = [
        { metric_type: 'total_peers', value: updatedPeers.length },
        { metric_type: 'seeders', value: seeders },
        { metric_type: 'leechers', value: leechers },
        { metric_type: 'avg_download_speed', value: avgDownloadSpeed },
        { metric_type: 'completion_rate', value: (seeders / updatedPeers.length) * 100 }
      ].map(m => ({
        ...m,
        simulation_run_id: runId,
        timestamp: new Date().toISOString()
      }))

      await supabase.from('metrics').insert(metrics)

      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      console.error('Simulation loop error:', error)
      break
    }
  }

  // Mark simulation as completed
  await supabase
    .from('simulation_runs')
    .update({ 
      status: 'completed',
      end_time: new Date().toISOString()
    })
    .eq('id', runId)
}