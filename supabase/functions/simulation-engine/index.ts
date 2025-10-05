// @ts-ignore - Deno URL import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }
  
    try {
      // Get the JWT token from the Authorization header
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'No authorization header' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
  
      const token = authHeader.replace('Bearer ', '')
      
      // Create Supabase client
      const supabaseClient = createClient(
        Deno.env.get('URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
      )
  
      // Get the user from the token
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
  
      const { method } = req
      const url = new URL(req.url)
      const path = url.pathname.split('/').pop()
  
      switch (method) {
        case 'POST':
          if (path === 'start') {
            return await startSimulation(req, supabaseClient, user.id) // Pass user ID
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
      console.error('Function error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
})

async function startSimulation(req: Request, supabase: any, userId: string) {
    try {
        const { config } = await req.json()
    
        console.log(`Starting simulation for auth user: ${userId}`)
    
        // First, get the local user profile that matches the auth user
        const { data: userProfile, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', userId)
            .single()
    
        if (userError || !userProfile) {
            throw new Error('User profile not found. Please complete your profile first.')
        }
    
        const localUserId = userProfile.id
        console.log(`Found local user: ${localUserId}`)
    
        // Create simulation record - use the LOCAL user ID
        const { data: simulation, error: simError } = await supabase
            .from('simulations')
            .insert({
                user_id: localUserId,
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

        console.log(`Simulation ${run.id} started for user ${userId}`)

        return new Response(JSON.stringify({ 
            success: true,
            simulationId: simulation.id,
            runId: run.id,
            status: 'started'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('Start simulation error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  }

async function updateSimulation(req: Request, supabase: any) {
  try {
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
  } catch (error) {
    console.error('Update simulation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getSimulationStatus(req: Request, supabase: any) {
  try {
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
  } catch (error) {
    console.error('Get simulation status error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function stopSimulation(req: Request, supabase: any) {
    try {
      const { runId } = await req.json()
  
      // Add validation for runId
      if (!runId || runId === 'undefined') {
        return new Response(JSON.stringify({ error: 'runId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
  
      console.log(`Stopping simulation run: ${runId}`)
  
      const { error } = await supabase
        .from('simulation_runs')
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', runId)
  
      if (error) {
        console.error('Database error stopping simulation:', error)
        throw error
      }
  
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Stop simulation error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
}

function generatePeers(config: SimulationConfig, runId: string): any[] {
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa']
  const peers: any [] = []

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