
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  Book,
  Bot,
  FileText,
  LayoutGrid,
  Lightbulb,
  Loader2,
  LogOut,
  MessageSquare,
  Settings,
  TrendingUp,
  User,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/dashboard/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { href: '/interview', icon: MessageSquare, label: 'Mock Interview' },
  { href: '/mentor', icon: Bot, label: 'AI Mentor' },
  { href: '/trends', icon: TrendingUp, label: 'Job Trends' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userDocRef = React.useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<{ profilePicture?: string }>(userDocRef);

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        toast({
          title: 'Signed Out',
          description: 'You have been successfully signed out.',
        });
        router.push('/');
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Sign Out Failed',
          description: 'An unexpected error occurred. Please try again.',
        });
      });
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <Logo />
            {/* This trigger is now only for mobile, as requested */}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  as={Link}
                  href={item.href}
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                    <LogOut />
                    <span>Sign Out</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full relative">
          <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20"
          >
            <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-500"></div>
            <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-500"></div>
          </div>
          <div className="flex h-14 lg:h-[60px] items-center gap-4 px-6 z-10 shrink-0">
            <SidebarTrigger className={cn(pathname !== '/dashboard' && 'md:hidden')} />
            {pathname !== '/dashboard' && (
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <PageHeader />
          </div>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pt-0 z-10">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
