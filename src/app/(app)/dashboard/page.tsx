
'use client';

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Lightbulb,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import {
  RecommendCareerPathsOutput,
} from '@/ai/flows/recommend-career-paths-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const [recommendedPaths, setRecommendedPaths] =
    useState<RecommendCareerPathsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('recommendedCareerPaths');
    if (data) {
      setRecommendedPaths(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Welcome Back, PathFinder!</CardTitle>
          <CardDescription>
            Here&apos;s a snapshot of your career journey. Let&apos;s find your
            path.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-accent">Get Started</CardTitle>
          <CardDescription>
            Begin by analyzing your resume or talking to your AI mentor.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Link
            href="/resume"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Analyze Your Resume</p>
              <p className="text-sm text-muted-foreground">
                Get instant feedback and skill analysis
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </Link>
          <Link
            href="/mentor"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Chat with AI Mentor</p>
              <p className="text-sm text-muted-foreground">
                Get personalized career advice
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </Link>
          <Link
            href="/trends"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="bg-primary/10 p-3 rounded-full">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Explore Job Trends</p>
              <p className="text-sm text-muted-foreground">
                Discover in-demand skills and roles
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-accent">Recommended Career Paths</CardTitle>
          <CardDescription>
            Based on your resume, here are some career paths you could excel in.
            Upload your resume to see recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : recommendedPaths && recommendedPaths.careerPaths.length > 0 ? (
            <div className="grid gap-6">
              {recommendedPaths.careerPaths.map((path, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{path.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {path.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={path.roadmapUrl} target="_blank" rel="noopener noreferrer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Roadmap
                      </a>
                    </Button>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Skill Match</span>
                      <span className="font-bold text-accent">{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No career paths recommended yet.</p>
              <p>
                <Link href="/resume" className="text-primary hover:underline">
                  Analyze your resume
                </Link>{' '}
                to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
