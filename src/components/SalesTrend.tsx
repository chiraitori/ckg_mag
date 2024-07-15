'use client'
import React from 'react'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockSalesTrend = [
  { month: 'Dec 2019', value: 0.5 },
  { month: 'Feb 2020', value: 0.3 },
  { month: 'Apr 2020', value: 0.7 },
  { month: 'Jun 2020', value: 0.4 },
  { month: 'Aug 2020', value: 0.8 },
  { month: 'Oct 2020', value: 1.2 },
  { month: 'Dec 2020', value: 0.9 },
  { month: 'Feb 2021', value: 1.1 },
]

const SalesTrend: React.FC = () => (
  <Card className="bg-slate-700">
    <CardHeader>Sales Trend with Forecast</CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockSalesTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

export default SalesTrend