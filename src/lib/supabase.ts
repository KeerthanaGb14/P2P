import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Create client even with placeholder values to prevent app crashes
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key' &&
         import.meta.env.VITE_SUPABASE_URL &&
         import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Database types
export interface User {
  id: string
  auth_id: string
  username?: string
  full_name?: string
  avatar_url?: string
  role: 'researcher' | 'admin' | 'viewer'
  created_at: string
  updated_at: string
}

export interface Simulation {
  id: string
  user_id: string
  name: string
  description?: string
  config: any
  status: 'draft' | 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface SimulationRun {
  id: string
  simulation_id: string
  run_number: number
  config: any
  start_time: string
  end_time?: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  results: any
  created_at: string
}

export interface PeerData {
  id: string
  simulation_run_id: string
  peer_id: string
  ip_address: string
  port: number
  region: string
  is_seeder: boolean
  upload_speed: number
  download_speed: number
  bandwidth: number
  stability_score: number
  churn_rate: number
  download_progress: number
  connection_time: string
  last_seen: string
  metadata: any
  created_at: string
}

export interface MetricData {
  id: string
  simulation_run_id: string
  timestamp: string
  metric_type: string
  value: number
  metadata: any
  created_at: string
}

export interface ResearchData {
  id: string
  category: string
  metric_name: string
  traditional_value: number
  anate_value: number
  improvement_percentage: number
  description: string
  methodology: string
  sample_size: number
  confidence_level: number
  created_at: string
  updated_at: string
}