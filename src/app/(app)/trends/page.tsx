
'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getJobTrends,
  GetJobTrendsOutput,
} from '@/ai/flows/get-job-trends-flow';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';

export default function TrendsPage() {
  const [trendsData, setTrendsData] = useState<GetJobTrendsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      const cachedData = localStorage.getItem('jobTrendsData');
      if (cachedData) {
        setTrendsData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
      try {
        const data = await getJobTrends();
        setTrendsData(data);
        localStorage.setItem('jobTrendsData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch job trends:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch job market trends. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Gathering Latest Market Data...</span>
        </div>
      </div>
    );
  }

  if (!trendsData) {
    return (
      <div className="text-center text-muted-foreground">
        No trend data available.
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Job Market Trends</CardTitle>
          <CardDescription>
            Visualize current job trends, in-demand skills, and salary benchmarks.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Average Salary Trends (Last 12 Months)</CardTitle>
          <CardDescription>
            Monthly estimated salary for popular tech roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <LineChart data={trendsData.salaryTrends}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickFormatter={formatCurrency} width={80} />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    indicator="line"
                  />
                }
              />
              <Legend />
              <Line
                dataKey="Software Engineer"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Data Scientist"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Product Manager"
                type="monotone"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Market Demand</CardTitle>
          <CardDescription>
            Demand score indicates how frequently a role appears in job openings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <BarChart
              data={trendsData.marketDemand}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="role"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={120}
              />
              <XAxis type="number" dataKey="demand" hide />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="demand" radius={4}>
                {trendsData.marketDemand.map((entry, index) => (
                  <Bar
                    key={`bar-${index}`}
                    dataKey="demand"
                    fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
