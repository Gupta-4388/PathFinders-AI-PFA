'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, TrendingUp } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

const careerPaths = [
  {
    title: 'AI/ML Engineer',
    description: 'Design and develop machine learning and deep learning systems.',
    growth: 18,
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP'],
    progress: 75,
    milestones: [
      { task: 'Master Python & Core Libraries', completed: true },
      { task: 'Learn Foundational ML Concepts', completed: true },
      { task: 'Deep Dive into Deep Learning', completed: true },
      { task: 'Specialize in NLP or Computer Vision', completed: false },
      { task: 'Build Portfolio Projects', completed: false },
    ],
  },
  {
    title: 'Full-Stack Developer',
    description: 'Work on both the front-end and back-end of web applications.',
    growth: 12,
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'APIs'],
    progress: 60,
    milestones: [
      { task: 'HTML, CSS, & JavaScript Fundamentals', completed: true },
      { task: 'Master a Frontend Framework (React)', completed: true },
      { task: 'Learn Backend Development (Node.js)', completed: false },
      { task: 'Database Management (SQL/NoSQL)', completed: false },
      { task: 'Deploy a Full-Stack Application', completed: false },
    ],
  },
  {
    title: 'Cloud & DevOps Engineer',
    description: 'Manage and automate infrastructure on cloud platforms.',
    growth: 22,
    skills: ['AWS/GCP/Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    progress: 40,
    milestones: [
      { task: 'Cloud Provider Fundamentals (AWS)', completed: true },
      { task: 'Containerization with Docker', completed: true },
      { task: 'Orchestration with Kubernetes', completed: false },
      { task: 'Infrastructure as Code (Terraform)', completed: false },
      { task: 'CI/CD Pipeline Automation', completed: false },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome Back, PathFinder!
        </h1>
        <p className="text-muted-foreground max-w-4xl">
          PathFinders AI is your personal career navigator. Analyze your resume,
          explore tailored career paths, practice for interviews, and stay ahead
          of job market trends. Ready to get started?
        </p>
      </div>

      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-accent font-headline">
          Transform your AI into a trusted companion
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Build loyalty with contextual intelligence that lasts beyond a single
          session.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Top Career Paths For You</h2>
        <p className="text-muted-foreground mb-6">
          Based on Current Trends, here are some recommended career paths.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {careerPaths.map((path, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{path.title}</CardTitle>
                  <Badge variant="secondary" className="bg-green-800/20 text-green-400 border-none">
                    <TrendingUp className="mr-1 h-4 w-4" /> +{path.growth}%
                  </Badge>
                </div>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
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

                <div className="my-4">
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Roadmap Progress
                  </h4>
                  <div className="flex items-center gap-2">
                    <Progress value={path.progress} className="h-2 bg-muted/50 [&>div]:bg-accent" />
                    <span className="text-xs font-mono text-muted-foreground">{path.progress}%</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                    Next Milestones
                  </h4>
                  <ul className="space-y-3">
                    {path.milestones.map((milestone, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {milestone.completed ? (
                          <CheckCircle className="h-5 w-5 text-accent" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/50" />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            milestone.completed
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          )}
                        >
                          {milestone.task}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
