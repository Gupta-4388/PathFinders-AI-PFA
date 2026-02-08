
'use client';

import Link from 'next/link';
import { ArrowRight, Bot, FileText, Briefcase, TrendingUp, BrainCircuit, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FlipCard from '@/components/flip-card';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user is logged in, redirect to the dashboard.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // While checking auth state, show a loader to prevent flicker and layout shifts.
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">Sign In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Welcome Back</DialogTitle>
                <DialogDescription>Sign in to access your dashboard.</DialogDescription>
              </DialogHeader>
              <AuthForm />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Get Started</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                <DialogTitle>Create an Account</DialogTitle>
                <DialogDescription>Join PathFinders AI to start your journey.</DialogDescription>
              </DialogHeader>
              <AuthForm />
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <main className="flex-grow">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40"
          >
            <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-500"></div>
            <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-500"></div>
          </div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-foreground to-gray-400 leading-tight">
                Your Career, Amplified by AI
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
                PathFinders AI is your intelligent partner for career growth. Analyze skills, practice interviews, and discover your perfect career path.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="font-semibold transform transition-transform duration-300 hover:scale-110">
                      Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Welcome to PathFinders AI</DialogTitle>
                      <DialogDescription>Sign in or create an account to get started.</DialogDescription>
                    </DialogHeader>
                    <AuthForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-28 bg-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">An Entire Career Toolkit</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                From resume to interview, PathFinders AI provides the tools you need to succeed in today's competitive job market.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FlipCard
                icon={<FileText className="h-8 w-8 text-accent" />}
                title="Resume Analyzer"
                description="Upload and analyze your resume to identify skills, projects, and get AI-driven improvement insights."
              />
              <FlipCard
                icon={<Bot className="h-8 w-8 text-accent" />}
                title="AI Mentor"
                description="Receive personalized career guidance, mentorship suggestions, and skill growth roadmaps from our AI chatbot."
              />
              <FlipCard
                icon={<Briefcase className="h-8 w-8 text-accent" />}
                title="Career Dashboard"
                description="Discover recommended roles based on your resume, and visualize skill gaps, growth paths, and salary ranges."
              />
              <FlipCard
                icon={<TrendingUp className="h-8 w-8 text-accent" />}
                title="Job Market Trends"
                description="Visualize current job trends, in-demand skills, and salary benchmarks with dynamic charts and graphs."
              />
              <FlipCard
                icon={
                  <img
                    src="https://github.com/Gupta-4388/PFA-logo/blob/main/PFA-Mock.png?raw=true"
                    alt="Mock Interview Simulator Logo"
                    className="h-8 w-8 object-contain"
                  />
                }
                title="Mock Interview Simulator"
                description="Practice for interviews with AI-generated questions and receive real-time analysis of your performance."
              />
               <FlipCard
                icon={<ArrowRight className="h-8 w-8 text-accent" />}
                title="And Much More"
                description="We're constantly adding new features to help you succeed in your career."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PathFinders AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
