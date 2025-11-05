
'use client';

import {
  Activity,
  ArrowRight,
  Book,
  CheckCircle,
  Lightbulb,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

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

export default function DashboardPage() {
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
    </div>
  );
}
