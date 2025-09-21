import { useState, useEffect } from 'react'
import { supabase, ResearchData } from '../lib/supabase'

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
      const { data, error } = await supabase
        .from('research_data')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      setResearchData(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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