
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function ThemeToggle() {
  const { toast } = useToast();

  const toggleTheme = () => {
    // Determine the new theme based on the current one
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';

    // Persist the new theme
    localStorage.setItem('theme', newTheme);
    
    // Apply the new theme
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    toast({
      title: 'Theme Changed',
      description: `Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode.`,
    });
  };

  return (
    <SidebarMenuButton onClick={toggleTheme} tooltip="Appearance">
      <Sun className="block dark:hidden" />
      <Moon className="hidden dark:block" />
      <span>Appearance</span>
    </SidebarMenuButton>
  );
}
