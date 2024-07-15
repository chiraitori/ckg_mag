import React from 'react'
import { Card, CardContent } from '../components/ui/card'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change }) => (
  <Card className="bg-slate-700">
    <CardContent>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {change && <p className="text-sm text-green-400">{change}</p>}
    </CardContent>
  </Card>
)

export default MetricCard