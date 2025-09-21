import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface RealTimeMetricsProps {
  metrics: { [key: string]: number }
  historicalData?: Array<{ timestamp: string; [key: string]: any }>
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ metrics, historicalData = [] }) => {
  const formatValue = (value: number, type: string): string => {
    if (type.includes('speed')) {
      return value > 1000 ? `${(value / 1000).toFixed(1)} MB/s` : `${value.toFixed(0)} KB/s`
    }
    if (type.includes('rate') || type.includes('percentage')) {
      return `${value.toFixed(1)}%`
    }
    return value.toFixed(0)
  }

  const getMetricTrend = (current: number, previous: number) => {
    if (previous === 0) return 'neutral'
    const change = ((current - previous) / previous) * 100
    return change > 5 ? 'up' : change < -5 ? 'down' : 'neutral'
  }

  const metricCards = [
    {
      key: 'total_peers',
      label: 'Total Peers',
      icon: Activity,
      color: 'blue'
    },
    {
      key: 'avg_download_speed',
      label: 'Avg Download Speed',
      icon: TrendingUp,
      color: 'green'
    },
    {
      key: 'completion_rate',
      label: 'Completion Rate',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      key: 'seeders',
      label: 'Seeders',
      icon: TrendingUp,
      color: 'emerald'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(({ key, label, icon: Icon, color }) => {
          const value = metrics[key] || 0
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }

          return (
            <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    {formatValue(value, key)}
                  </p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Historical Charts */}
      {historicalData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Download Speed Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Download Speed Over Time</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [formatValue(value, 'speed'), 'Speed']}
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_download_speed" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Rate Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Completion Rate Progress</h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion']}
                />
                <Area 
                  type="monotone" 
                  dataKey="completion_rate" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default RealTimeMetrics