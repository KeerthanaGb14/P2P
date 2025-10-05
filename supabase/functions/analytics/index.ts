import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (path) {
      case 'research-summary':
        return await getResearchSummary(supabaseClient)
      case 'performance-comparison':
        return await getPerformanceComparison(supabaseClient)
      case 'simulation-history':
        return await getSimulationHistory(req, supabaseClient)
      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Analytics function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getResearchSummary(supabase: any) {
  try {
    const { data: researchData, error } = await supabase
      .from('research_data')
      .select('*')
      .order('category', { ascending: true })

    if (error) throw error

    // If no data, return empty structure
    if (!researchData || researchData.length === 0) {
      return new Response(JSON.stringify({
        summary: {},
        overallImprovement: 0,
        totalMetrics: 0,
        categories: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Aggregate data by category
    const summary = researchData.reduce((acc: any, item: any) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {})

    // Calculate overall improvements
    const overallImprovement = researchData.reduce((sum: number, item: any) => 
      sum + (item.improvement_percentage || 0), 0) / researchData.length

    return new Response(JSON.stringify({
      summary,
      overallImprovement,
      totalMetrics: researchData.length,
      categories: Object.keys(summary)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Research summary error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getPerformanceComparison(supabase: any) {
  try {
    // Get recent simulation data for comparison
    const { data: recentRuns, error: runsError } = await supabase
      .from('simulation_runs')
      .select(`
        *,
        simulation:simulations(*),
        metrics(*)
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20)

    if (runsError) throw runsError

    // If no data, return empty structure
    if (!recentRuns || recentRuns.length === 0) {
      return new Response(JSON.stringify({
        anate: { runs: 0, averages: {} },
        traditional: { runs: 0, averages: {} },
        comparison: {}
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Separate ANATE vs Traditional results
    const anateRuns = recentRuns.filter((run: any) => run.config?.useANATE)
    const traditionalRuns = recentRuns.filter((run: any) => !run.config?.useANATE)

    // Calculate average metrics for each type
    const calculateAverages = (runs: any[]) => {
      if (runs.length === 0) return {}
      
      const totals = runs.reduce((acc: any, run: any) => {
        run.metrics?.forEach((metric: any) => {
          if (!acc[metric.metric_type]) acc[metric.metric_type] = []
          acc[metric.metric_type].push(metric.value)
        })
        return acc
      }, {})

      return Object.entries(totals).reduce((acc: any, [key, values]: [string, any]) => {
        acc[key] = values.reduce((sum: number, val: number) => sum + val, 0) / values.length
        return acc
      }, {})
    }

    const anateAverages = calculateAverages(anateRuns)
    const traditionalAverages = calculateAverages(traditionalRuns)

    return new Response(JSON.stringify({
      anate: {
        runs: anateRuns.length,
        averages: anateAverages
      },
      traditional: {
        runs: traditionalRuns.length,
        averages: traditionalAverages
      },
      comparison: Object.keys(anateAverages).reduce((acc: any, key: string) => {
        if (traditionalAverages[key]) {
          const improvement = ((anateAverages[key] - traditionalAverages[key]) / traditionalAverages[key]) * 100
          acc[key] = {
            anate: anateAverages[key],
            traditional: traditionalAverages[key],
            improvement: improvement
          }
        }
        return acc
      }, {})
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Performance comparison error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

async function getSimulationHistory(req: Request, supabase: any) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let query = supabase
      .from('simulations')
      .select(`
        *,
        simulation_runs(
          *,
          metrics(*)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: simulations, error } = await query

    if (error) throw error

    return new Response(JSON.stringify(simulations || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Simulation history error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}