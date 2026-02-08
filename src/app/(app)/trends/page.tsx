'use client';

import { useEffect, useState } from 'react';
import {
  BarChart as BarChartIcon,
  Loader2,
  PieChart as PieChartIcon,
  Search,
  TrendingUp,
  BrainCircuit,
  MapPin,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
];

export default function TrendsPage() {
  const [trendsData, setTrendsData] = useState<GetJobTrendsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  
  const [demandChartType, setDemandChartType] = useState<'bar' | 'pie'>('bar');
  const [locationChartType, setLocationChartType] = useState<'bar' | 'pie'>(
    'bar'
  );
  const { toast } = useToast();

  const fetchTrends = async (role?: string) => {
    setLoading(true);
    try {
      const data = await getJobTrends(role ? { role } : undefined);
      setTrendsData(data);
      setActiveRole(role || null);
    } catch (error) {
      console.error('Failed to fetch job trends:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Could not fetch job market trends. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrends(searchQuery);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Market Intelligence</CardTitle>
              <CardDescription className="text-base">
                Real-time data analyzed by AI to give you the competitive edge.
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex w-full md:max-w-sm items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search specific role (e.g. DevOps)..."
                  className="pl-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground animate-pulse">
            Analyzing {activeRole ? `trends for ${activeRole}...` : 'live tech market data...'}
          </p>
        </div>
      ) : trendsData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Salary Benchmarks {activeRole && <span className="text-primary">: {activeRole}</span>}
              </CardTitle>
              <CardDescription>
                Annual salary range (USD) across key roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[350px] w-full">
                <BarChart data={trendsData.salaryByExperience}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="role"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    fontSize={12}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={formatCurrency} width={80} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number)}
                        indicator="dot"
                      />
                    }
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar
                    dataKey="Entry-Level"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Mid-Level"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Senior-Level"
                    fill="hsl(var(--chart-3))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-primary" />
                Salary Growth Trends
              </CardTitle>
              <CardDescription>
                Representative average salary progression (2020-2024).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <LineChart data={trendsData.salaryTrends}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis tickFormatter={formatCurrency} axisLine={false} tickLine={false} width={80} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatCurrency(value as number)}
                        indicator="line"
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="salary"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Most In-Demand Skills
              </CardTitle>
              <CardDescription>
                Top technical skills mentioned in active listings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart data={trendsData.topSkills} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="skill"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                    fontSize={12}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="score" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Market Demand Index
                  </CardTitle>
                  <CardDescription>
                    Role popularity score (1-100) based on listing volume.
                  </CardDescription>
                </div>
                <RadioGroup
                  value={demandChartType}
                  onValueChange={(v) => setDemandChartType(v as 'bar' | 'pie')}
                  className="flex items-center gap-1 bg-muted p-1 rounded-md"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="bar" id="demand-bar" className="peer sr-only" />
                    <Label
                      htmlFor="demand-bar"
                      className="p-1.5 rounded-sm cursor-pointer hover:bg-background/50 peer-data-[state=checked]:bg-background peer-data-[state=checked]:shadow-sm"
                    >
                      <BarChartIcon className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="pie" id="demand-pie" className="peer sr-only" />
                    <Label
                      htmlFor="demand-pie"
                      className="p-1.5 rounded-sm cursor-pointer hover:bg-background/50 peer-data-[state=checked]:bg-background peer-data-[state=checked]:shadow-sm"
                    >
                      <PieChartIcon className="h-4 w-4" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[350px] w-full">
                {demandChartType === 'bar' ? (
                  <BarChart
                    data={trendsData.marketDemand}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <YAxis
                      dataKey="role"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={140}
                      fontSize={11}
                    />
                    <XAxis type="number" hide />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={trendsData.marketDemand}
                      dataKey="demand"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={5}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {trendsData.marketDemand.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dot" nameKey="role" />}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Availability by Location
                  </CardTitle>
                  <CardDescription>
                    Job availability in global tech hubs.
                  </CardDescription>
                </div>
                <RadioGroup
                  value={locationChartType}
                  onValueChange={(v) => setLocationChartType(v as 'bar' | 'pie')}
                  className="flex items-center gap-1 bg-muted p-1 rounded-md"
                >
                  <div className="flex items-center">
                    <RadioGroupItem value="bar" id="location-bar" className="peer sr-only" />
                    <Label
                      htmlFor="location-bar"
                      className="p-1.5 rounded-sm cursor-pointer hover:bg-background/50 peer-data-[state=checked]:bg-background peer-data-[state=checked]:shadow-sm"
                    >
                      <BarChartIcon className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="pie" id="location-pie" className="peer sr-only" />
                    <Label
                      htmlFor="location-pie"
                      className="p-1.5 rounded-sm cursor-pointer hover:bg-background/50 peer-data-[state=checked]:bg-background peer-data-[state=checked]:shadow-sm"
                    >
                      <PieChartIcon className="h-4 w-4" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[350px] w-full">
                {locationChartType === 'bar' ? (
                  <BarChart
                    data={trendsData.jobOpeningsByLocation}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <YAxis
                      dataKey="location"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={120}
                      fontSize={11}
                    />
                    <XAxis type="number" hide />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatNumber(value as number)}
                          indicator="line"
                        />
                      }
                    />
                    <Bar
                      dataKey="openings"
                      fill="hsl(var(--chart-4))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={trendsData.jobOpeningsByLocation}
                      dataKey="openings"
                      nameKey="location"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={5}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {trendsData.jobOpeningsByLocation.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatNumber(value as number)}
                          indicator="dot"
                          nameKey="location"
                        />
                      }
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-xl font-semibold">No Data Available</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            We couldn't retrieve market trends right now. Please check your API configuration or try a different search.
          </p>
          <Button onClick={() => fetchTrends()} variant="outline" className="mt-6">
            Reload General Trends
          </Button>
        </div>
      )}
    </div>
  );
}
