
'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  DollarSign,
  Lightbulb,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  RecommendCareerPathsOutput,
  recommendCareerPaths,
} from '@/ai/flows/recommend-career-paths-flow';
import { analyzeResume } from '@/ai/flows/analyze-resume-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

type UserProfile = {
  name?: string;
  resumeDataUri?: string;
};

export default function DashboardPage() {
  const [recommendedPaths, setRecommendedPaths] =
    useState<RecommendCareerPathsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const lastAnalyzedUri = useRef<string | null>(null);
  const isAnalyzing = useRef(false);

  const userDocRef = useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Guard: already in flight
      if (isAnalyzing.current) return;

      // Safe localStorage check
      if (typeof window !== 'undefined') {
        const existingData = localStorage.getItem('recommendedCareerPaths');
        if (existingData) {
          try {
            const parsed = JSON.parse(existingData);
            if (parsed && typeof parsed === 'object') {
              setRecommendedPaths(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            localStorage.removeItem('recommendedCareerPaths');
          }
        }
      }
      
      if (userProfile && userProfile.resumeDataUri) {
        // Prevent redundant analysis if URI hasn't changed
        if (lastAnalyzedUri.current === userProfile.resumeDataUri) {
          setLoading(false);
          return;
        }

        isAnalyzing.current = true;
        setLoading(true);
        try {
          // Immediately set this to prevent re-entry during async calls
          lastAnalyzedUri.current = userProfile.resumeDataUri;

          const analysisResult = await analyzeResume({ resumeDataUri: userProfile.resumeDataUri });

          if (analysisResult?.isResume && analysisResult?.extractedSkills && analysisResult.extractedSkills.length > 0) {
            const careerPathResult = await recommendCareerPaths({
              skills: analysisResult.extractedSkills,
            });
            
            if (typeof window !== 'undefined') {
              localStorage.setItem(
                'recommendedCareerPaths',
                JSON.stringify(careerPathResult)
              );
            }
            setRecommendedPaths(careerPathResult);
          }
        } catch (error) {
          console.error('Dashboard: Analysis loop failed:', error);
          // Reset URI ref on error so we can retry on next profile update
          lastAnalyzedUri.current = null;
          toast({
            variant: 'destructive',
            title: 'Analysis Paused',
            description: 'We hit a rate limit or error. Recommendations will refresh shortly.',
          });
        } finally {
          isAnalyzing.current = false;
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (userProfile !== undefined) {
        fetchRecommendations();
    }
  }, [userProfile, toast]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
      <Card className="col-span-1 lg:col-span-3 transition-all duration-300 transform hover:scale-[1.02] border border-transparent hover:border-primary">
        <CardHeader>
          <CardTitle>Welcome Back, {userProfile?.name || 'PathFinder'}!</CardTitle>
          <CardDescription>
            Here&apos;s a snapshot of your career journey. Let&apos;s find your
            path.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3 transition-all duration-300 transform hover:scale-[1.02] border border-transparent hover:border-primary">
        <CardHeader>
          <CardTitle className="text-primary">Get Started</CardTitle>
          <CardDescription>
            Begin by analyzing your resume or talking to your AI mentor.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Link
            href="/resume"
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-all duration-300 transform hover:-translate-y-1"
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
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-all duration-300 transform hover:-translate-y-1"
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
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-all duration-300 transform hover:-translate-y-1"
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

      <Card className="col-span-1 md:col-span-2 lg:col-span-3 transition-all duration-300 transform hover:scale-[1.02] border border-transparent hover:border-primary">
        <CardHeader>
          <CardTitle className="text-primary">Recommended Career Paths</CardTitle>
          <CardDescription>
            Based on your resume, here are some career paths you could excel in.
            Upload your resume on the resume or settings page to see recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">Calculating paths...</p>
              </div>
            </div>
          ) : recommendedPaths && recommendedPaths.careerPaths && recommendedPaths.careerPaths.length > 0 ? (
            <div className="grid gap-6">
              {recommendedPaths.careerPaths.map((path, index) => (
                <div key={index} className="p-6 border rounded-lg space-y-4 animate-fade-in-up transition-transform transform hover:scale-[1.02]" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{path.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {path.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="h-5 w-5 text-muted-foreground" />
                       <div>
                        <span className="font-semibold">Demand: </span>
                        <Badge variant="secondary">{path.demandScore}/10</Badge>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-semibold">Salary: </span>
                        <Badge variant="secondary">{path.salaryRange}</Badge>
                      </div>
                    </div>
                  </div>

                  {path.skills && path.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Key Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {path.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">Your Skill Match</span>
                      <span className="font-bold text-primary">{path.progress}%</span>
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
                Go to{' '}
                <Link href="/resume" className="text-primary hover:underline">
                  Resume Analysis
                </Link>{' '}
                to upload your resume and get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
