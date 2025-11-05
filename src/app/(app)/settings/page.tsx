'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    toast({
      title: 'Theme Changed',
      description: `Switched to ${checked ? 'dark' : 'light'} mode.`,
    });
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: 'Settings Saved',
        description: 'Your profile information has been updated.',
    });
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
     toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
    });
  }

  const handleSignOut = () => {
    toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
    });
  }

  return (
    <div className="w-full space-y-8">
       <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This is how others will see you on the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Button variant="outline" type="button">Change Photo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="jane.doe@example.com" />
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Change your password here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button type="submit">Change Password</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="font-medium">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable dark theme.
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={handleThemeChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-destructive">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                    Ends your current session.
                </p>
            </div>
            <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
