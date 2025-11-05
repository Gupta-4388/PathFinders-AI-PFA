'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { UploadCloud, FileText, Lightbulb, Loader2, X, TrendingUp, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import Link from 'next/link';

const chartConfig = {
  demand: {
    label: "Demand",
    color: "hsl(var(--chart-2))",
  },
};

type SkillDemandData = {
  skill: string;
  demand: number;
}[];

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResumeOutput | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [skillDemandData, setSkillDemandData] = useState<SkillDemandData | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => {
      clearInterval(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (analysis?.extractedSkills) {
      // Take top 5 skills and generate mock demand data
      const demandData = analysis.extractedSkills.slice(0, 5).map(skill => ({
        skill,
        demand: Math.floor(Math.random() * (350 - 100 + 1) + 100) // Random demand between 100-350
      }));
      setSkillDemandData(demandData);
    } else {
      // Set initial static data
      const initialData = [
        { skill: "React", demand: 186},
        { skill: "Python", demand: 305 },
        { skill: "SQL", demand: 237 },
        { skill: "AWS", demand: 273 },
        { skill: "Next.js", demand: 209 },
      ];
      setSkillDemandData(initialData);
    }
  }, [analysis]);


  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(selectedFile.type)) {
        setError('Invalid file type. Please upload PDF, DOCX, or TXT.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(event.target.files?.[0] || null);
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] || null);
  };
  
  const handleAnalyzeClick = async () => {
    if (!file) {
      setError('Please select a resume file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resumeDataUri = reader.result as string;
        const result = await analyzeResume({ resumeDataUri });
        setProgress(100);
        setAnalysis(result);
        setLoading(false);
        setFile(null); // Clear file after analysis
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during analysis. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const handleAnalyzeAnother = () => {
    setAnalysis(null);
    handleRemoveFile();
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Upload your resume to get a detailed analysis of your skills and experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
                <CardTitle>Analyze Your Resume</CardTitle>
                <CardDescription>Upload your resume (PDF, DOCX, or TXT) to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                { !analysis && !file && (
                    <div
                        className={cn(
                            "flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-12 text-center h-64",
                            isDragging && "border-primary bg-primary/10"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            id="resume-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                            onChange={onFileChange}
                        />
                        <UploadCloud className="h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 font-semibold">Drag & drop your resume here, or click to select</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or TXT (max 5MB)</p>
                    </div>
                )}

                {file && !loading && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-md border">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                        <Button onClick={handleAnalyzeClick} className="w-full">
                            Analyze Resume
                        </Button>
                    </div>
                )}
                 {loading && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="font-semibold">Analyzing your resume...</p>
                        <p className="text-sm text-muted-foreground">This may take a moment.</p>
                        <Progress value={progress} className="w-full max-w-sm mt-4" />
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {analysis && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                      <Card>
                          <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Briefcase className="h-5 w-5 text-accent" />
                              Suggested Roles
                          </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              {analysis.suggestedRoles?.map((role, index) => (
                                  <div key={index} className="p-4 border rounded-lg">
                                      <div className="flex justify-between items-start">
                                          <div>
                                              <h4 className="font-semibold">{role.title}</h4>
                                              <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm font-bold text-accent">{role.matchConfidence}%</p>
                                            <p className="text-xs text-muted-foreground">Match</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-yellow-400" />
                              Improvement Insights
                          </CardTitle>
                          </CardHeader>
                          <CardContent>
                          <ul className="list-disc space-y-2 pl-5 text-sm">
                              {analysis.improvementInsights.map((insight, index) => (
                              <li key={index}>{insight}</li>
                              ))}
                          </ul>
                          </CardContent>
                      </Card>

                      <Card>
                          <CardHeader>
                          <CardTitle>Skill Summary</CardTitle>
                          </CardHeader>
                          <CardContent>
                          <p className="text-sm text-muted-foreground">
                              {analysis.skillSummary}
                          </p>
                          <Separator className="my-4" />
                          <div className="flex flex-wrap gap-2">
                              {analysis.extractedSkills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                  {skill}
                              </Badge>
                              ))}
                          </div>
                          </CardContent>
                      </Card>
                      <Button onClick={handleAnalyzeAnother}>Analyze Another Resume</Button>
                    </div>
                )}
            </CardContent>
           </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader className="items-center pb-0">
                    <CardTitle className='flex items-center gap-2'><TrendingUp /> Skill Demand</CardTitle>
                    <CardDescription>
                      {analysis ? "Demand for your top skills" : "A look at top trending skills"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                    config={chartConfig}
                    className="aspect-square h-[250px] w-full"
                    >
                    <AreaChart
                        accessibilityLayer
                        data={skillDemandData || []}
                        margin={{
                        left: 0,
                        right: 20,
                        top: 10,
                        bottom: 10,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="skill"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis hide={true} domain={['dataMin - 50', 'dataMax + 50']} />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                        dataKey="demand"
                        type="natural"
                        fill="var(--color-demand)"
                        fillOpacity={0.4}
                        stroke="var(--color-demand)"
                        stackId="a"
                        />
                    </AreaChart>
                    </ChartContainer>
                </CardContent>
                <CardHeader>
                   <Button asChild variant="link" className="text-accent">
                        <Link href="/trends">
                            Explore More Trends <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
            </Card>
        </div>
      </div>
    </div>
  );
}
