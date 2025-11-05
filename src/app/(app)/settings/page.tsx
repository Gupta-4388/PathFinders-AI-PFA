
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/settings/theme-toggle';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
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
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline">
                Change photo
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="Your Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="your.email@example.com" />
              </div>
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password here. Choose a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
