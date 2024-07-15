'use client'
import React from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockPipelineData = [
  { stage: 'Qualification', value: 2000000 },
  { stage: 'Needs Analysis', value: 1500000 },
  { stage: 'Proposal', value: 1000000 },
  { stage: 'Negotiation', value: 750000 },
  { stage: 'Closed Won', value: 500000 },
]

const SalesPipeline: React.FC = () => (
  <Card className="bg-slate-700">
    <CardHeader>This Month Sales Pipeline</CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart layout="vertical" data={mockPipelineData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="stage" type="category" />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

export default SalesPipeline