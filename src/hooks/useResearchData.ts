import { useState, useEffect } from 'react'
import { ResearchData } from '../lib/supabase'

// Mock research data for when Supabase is not configured
const mockResearchData: ResearchData[] = [
  {
    id: '1',
    category: 'Performance',
    metric_name: 'Redundant Packet Transfers',
    traditional_value: 100,
    anate_value: 31,
    improvement_percentage: 69,
    description: 'Reduction in redundant packet transfers through intelligent peer selection and broadcast-aware caching',
    methodology: 'Simulation-based analysis with 1000+ peer networks',
    sample_size: 50,
    confidence_level: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    category: 'Performance',
    metric_name: 'Download Time',
    traditional_value: 100,
    anate_value: 43,
    improvement_percentage: 57,
    description: 'Decrease in overall download time through optimized swarm formation and adaptive network awareness',
    methodology: 'Comparative analysis across multiple network conditions',
    sample_size: 75,
    confidence_level: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    category: 'Stability',
    metric_name: 'Swarm Stability Score',
    traditional_value: 60,
    anate_value: 85,
    improvement_percentage: 41.67,
    description: 'Improvement in swarm stability through hybrid peer selection strategy',
    methodology: 'Long-term stability monitoring over 24-hour periods',
    sample_size: 30,
    confidence_level: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    category: 'Efficiency',
    metric_name: 'Packet Transfer Efficiency',
    traditional_value: 65,
    anate_value: 92,
    improvement_percentage: 41.54,
    description: 'Enhanced packet transfer efficiency through central coordination and analytics',
    methodology: 'Network traffic analysis and optimization metrics',
    sample_size: 40,
    confidence_level: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function useResearchData() {
  const [researchData, setResearchData] = useState<ResearchData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResearchData()
  }, [])

  const fetchResearchData = async () => {
    try {
      setLoading(true)
      
      // Always use mock data in local mode
      setResearchData(mockResearchData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      // Fallback to mock data on error
      setResearchData(mockResearchData)
    } finally {
      setLoading(false)
    }
  }

  const getDataByCategory = (category: string) => {
    return researchData.filter(item => item.category === category)
  }

  const getOverallImprovement = () => {
    if (researchData.length === 0) return 0
    return researchData.reduce((sum, item) => sum + item.improvement_percentage, 0) / researchData.length
  }

  const getCategories = () => {
    return [...new Set(researchData.map(item => item.category))]
  }

  return {
    researchData,
    loading,
    error,
    getDataByCategory,
    getOverallImprovement,
    getCategories,
    refetch: fetchResearchData
  }
}