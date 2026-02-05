
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PageHeader from '@/components/dashboard/page-header';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

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
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = React.useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<{ profilePicture?: string }>(userDocRef);

  const handleSignOut = () => {
    localStorage.clear();
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
    router.push('/');
  };


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
          {/* Footer content can go here */}
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
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card/50 px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              {pathname !== '/dashboard' && (
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <SidebarTrigger />
              <PageHeader />
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 z-10">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
