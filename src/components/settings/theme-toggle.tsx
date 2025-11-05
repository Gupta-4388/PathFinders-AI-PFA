
'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export function ThemeToggle() {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState('dark');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    toast({
      title: 'Theme Changed',
      description: `Switched to ${
        newTheme.charAt(0).toUpperCase() + newTheme.slice(1)
      } mode.`,
    });
  };

  return (
    <RadioGroup
      value={theme}
      onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')}
      className="grid max-w-md grid-cols-2 gap-8 pt-2"
    >
      <Label className="border-muted hover:border-accent relative flex flex-col items-center justify-center rounded-md border-2 p-4 text-center">
        <Sun className="mb-3 h-6 w-6" />
        <RadioGroupItem value="light" id="light" className="sr-only" />
        Light
      </Label>
      <Label className="border-muted hover:border-accent relative flex flex-col items-center justify-center rounded-md border-2 p-4 text-center">
        <Moon className="mb-3 h-6 w-6" />
        <RadioGroupItem value="dark" id="dark" className="sr-only" />
        Dark
      </Label>
    </RadioGroup>
  );
}
