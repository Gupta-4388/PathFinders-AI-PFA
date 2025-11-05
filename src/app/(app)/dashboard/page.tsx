'use client';

import {
  Activity,
  ArrowRight,
  Book,
  CheckCircle,
  Lightbulb,
  Loader2,
  TrendingUp,
  DollarSign,
  Star,
  FileWarning,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { recommendCareerPaths, RecommendCareerPathsOutput } from '@/ai/flows/recommend-career-paths-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mocked user skills, in a real app this would come from the resume analysis
const MOCK_USER_SKILLS = ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'];

type CareerPath = RecommendCareerPathsOutput['careerPaths'][0];

export default function DashboardPage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[] | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCareerPaths() {
      setLoading(true);
      try {
        const { careerPaths: paths } = await recommendCareerPaths({ skills: MOCK_USER_SKILLS });
        setCareerPaths(paths);
      } catch (error) {
        console.error('Failed to fetch career paths:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load personalized career paths. Please try again later.',
        });
        setCareerPaths([]); // Set to empty array to stop loading and show message
      } finally {
        setLoading(false);
      }
    }
    fetchCareerPaths();
  }, [toast]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Welcome Back, PathFinder!</CardTitle>
          <CardDescription>
            Here&apos;s a snapshot of your career journey.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-accent">Next Steps</CardTitle>
          <CardDescription>
            Actions to accelerate your career growth.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Link
            href="/resume"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="bg-accent/10 p-3 rounded-full">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Update Your Resume</p>
              <p className="text-sm text-muted-foreground">
                Incorporate recent feedback
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="bg-accent/10 p-3 rounded-full">
              <Loader2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Practice Interview</p>
              <p className="text-sm text-muted-foreground">
                AI/ML Engineer Role
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </Link>
          <Link
            href="/mentor"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="bg-accent/10 p-3 rounded-full">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold">Explore New Skills</p>
              <p className="text-sm text-muted-foreground">
                Chat with your AI Mentor
              </p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      {loading && Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="flex flex-col lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardFooter>
        </Card>
      ))}

      {!loading && careerPaths && careerPaths.length > 0 && careerPaths.map((path, index) => (
        <Card key={index} className="flex flex-col lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-accent">{path.title}</CardTitle>
              <Badge
                variant="secondary"
                className="bg-yellow-800/20 text-yellow-400 border-none"
              >
                <Star className="mr-1 h-4 w-4" /> {path.demandScore}/10
              </Badge>
            </div>
            <CardDescription>{path.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow space-y-4">
             <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="mr-2 h-4 w-4" />
              <span className="font-semibold">{path.salaryRange}</span>
              <span className="ml-1">(est. annual)</span>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {path.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <p className="text-xs text-muted-foreground">Your Skill Match</p>
            <Progress value={path.progress} className="w-full h-2 [&>div]:bg-accent" />
            <Button asChild variant="link" size="sm" className="px-0 text-accent">
              <Link href={path.roadmapUrl} target="_blank" rel="noopener noreferrer">
                View Full Roadmap <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}

      {!loading && (!careerPaths || careerPaths.length === 0) && (
         <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardContent className="flex flex-col items-center justify-center text-center p-12">
            <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Analyze Your Resume to Get Started</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              Upload your resume to receive personalized career path recommendations.
            </p>
            <Button asChild>
              <Link href="/resume">
                <Upload className="mr-2 h-4 w-4" /> Go to Resume Analyzer
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
