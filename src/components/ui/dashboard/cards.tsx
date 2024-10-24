'use client';

import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  InboxIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/components/fonts';
import { fetchCardData } from '@/lib/mknnClassifier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ZoneData {
  challans: number;
  amount: number;
  avgAmount: number;
  violations: { name: string; count: number }[];
}

interface ChartSectionProps {
  zoneData: { [key: string]: ZoneData };
}

const iconMap = {
  totalAmount: BanknotesIcon,
  avgAmount: CurrencyRupeeIcon,
  totalChallans: InboxIcon,
  violations: ExclamationTriangleIcon,
};

export default function Component() {
  const [zoneData, setZoneData] = useState<{ [key: string]: ZoneData } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCardData();
      setZoneData(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !zoneData) {
    return <div>Loading...</div>; // Loading state
  }

  // Calculate overall stats
  const overallStats = Object.values(zoneData).reduce(
    (acc, data) => {
      acc.totalChallans += data.challans;
      acc.totalAmount += data.amount;
      return acc;
    },
    { totalChallans: 0, totalAmount: 0 }
  );

  const overallAvgAmount = overallStats.totalAmount / overallStats.totalChallans;

  return (
    <div className='gap-y-8 flex flex-col'>
      <div className="space-y-4">
        <div className="md:flex gap-1">
          {Object.entries(zoneData).map(([zone, data]) => (
            <ZoneCard key={zone} zone={zone} data={data} />
          ))}
        </div>
      </div>
      <div className='w-full flex gap-1 justify-between'>
        <div className="w-6/7">
          <OverallStatsCard stats={overallStats} avgAmount={overallAvgAmount} />
        </div>
        <div className="w-1/4">
          <ChartSection zoneData={zoneData} />
        </div>
      </div>
    </div>
  );
}

function ZoneCard({ zone, data }: { 
  zone: string, 
  data: { 
    challans: number, 
    amount: number, 
    avgAmount: number,
    violations: { name: string, count: number }[]
  } 
}) {
  return (
    <Card className="flex-1 md:min-w-[300px] ">
      <CardHeader>
        <CardTitle>{zone}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DataRow title="Total Challans" value={data.challans} type="totalChallans" />
          <DataRow title="Total Amount" value={`₹${data.amount.toLocaleString()}`} type="totalAmount" />
          <DataRow title="Average Amount" value={`₹${data.avgAmount.toFixed(2)}`} type="avgAmount" />
          <ViolationRow violations={data.violations} />
        </div>
      </CardContent>
    </Card>
  );
}

function OverallStatsCard({ stats, avgAmount }: {
  stats: { totalChallans: number, totalAmount: number },
  avgAmount: number
}) {
  return (
    <Card className='w-[38rem]'>
      <CardHeader>
        <CardTitle>Overall Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="lg:grid lg:grid-cols-3 lg:gap-x-10 space-y-4">
          <DataRow title="Total Challans" value={stats.totalChallans} type="totalChallans" />
          <DataRow title="Total Amount Collected" value={`₹${stats.totalAmount.toLocaleString()}`} type="totalAmount" />
          <DataRow title="Overall Average Challan" value={`₹${avgAmount.toFixed(2)}`} type="avgAmount" />
        </div>
      </CardContent>
    </Card>
  );
}

function DataRow({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'totalChallans' | 'avgAmount' | 'totalAmount' | 'violations';
}) {
  const Icon = iconMap[type];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className={`${lusitana.className} text-lg font-semibold`}>
        {value}
      </p>
    </div>
  );
}

function ViolationRow({ violations }: { violations: { name: string; count: number }[] }) {
  return (
    <div className="space-y-2 ">
      <div className="flex items-center space-x-2">
        <ExclamationTriangleIcon className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Top Violations</h3>
      </div>
      <ul className="space-y-1">
        {violations.slice(0, 3).map((violation, index) => (
          <li key={index} className="flex justify-between text-sm">
            <span>{violation.name}</span>
            <span className="font-semibold">{violation.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartSection({ zoneData }: ChartSectionProps) {
  const [chartType, setChartType] = useState('pie');
  const [dataKey, setDataKey] = useState('challans');

  const chartData = Object.entries(zoneData).map(([zone, data]) => ({
    name: zone,
    challans: data.challans,
    amount: data.amount,
    avgAmount: data.avgAmount,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={dataKey}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} fill="hsl(var(--primary))">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={dataKey} stroke="hsl(var(--primary))" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-[37.5rem]">
      <CardHeader>
        <CardTitle>Zone Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="lg:grid lg:grid-cols-3 lg:gap-x-4 space-y-4">
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dataKey} onValueChange={setDataKey}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Data Key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="challans">Challans</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="avgAmount">Average Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderChart()}
      </CardContent>
    </Card>
  );
}
