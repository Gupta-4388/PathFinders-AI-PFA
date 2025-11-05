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

const careerPaths = [
  {
    title: 'AI/ML Engineer',
    description:
      'Design and develop machine learning and deep learning systems.',
    growth: 18,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP'],
    progress: 75,
  },
  {
    title: 'Full-Stack Developer',
    description:
      'Work on both the front-end and back-end of web applications.',
    growth: 12,
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'APIs'],
    progress: 60,
  },
  {
    title: 'Cloud & DevOps Engineer',
    description: 'Manage and automate infrastructure on cloud platforms.',
    growth: 22,
    skills: ['AWS/GCP/Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    progress: 40,
  },
];

export default function DashboardPage() {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Welcome Back, PathFinder!</CardTitle>
          <CardDescription>
            Here&apos;s a snapshot of your career journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Resume Score
              </CardTitle>
              <Lightbulb className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">88%</div>
              <p className="text-xs text-muted-foreground">
                Top 15% of profiles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Skills to Develop
              </CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                2 new skills suggested
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Learning
              </CardTitle>
              <Book className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Courses</div>
              <p className="text-xs text-muted-foreground">1 course completed</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
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

      {careerPaths.map((path, index) => (
        <Card key={index} className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{path.title}</CardTitle>
              <Badge
                variant="secondary"
                className="bg-green-800/20 text-green-400 border-none"
              >
                <TrendingUp className="mr-1 h-4 w-4" /> +{path.growth}%
              </Badge>
            </div>
            <CardDescription>{path.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mb-4">
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
            <p className="text-xs text-muted-foreground">Progress</p>
            <Progress value={path.progress} className="w-full h-2" />
            <Button variant="link" size="sm" className="px-0">
              View Full Roadmap <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
