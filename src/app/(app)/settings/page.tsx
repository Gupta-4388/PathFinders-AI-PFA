
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
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
import { File, LogOut, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<{ name: string } | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(
    'https://picsum.photos/seed/user/100/100'
  );
  const [name, setName] = useState('Your Name');
  const [email, setEmail] = useState('your.email@example.com');
  const [careerPath, setCareerPath] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedResumeName = localStorage.getItem('resumeFileName');
    if (savedResumeName) {
      setResumeFile({ name: savedResumeName });
    }
    const savedAvatar = localStorage.getItem('avatarImage');
    if (savedAvatar) {
      setAvatarImage(savedAvatar);
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
    }
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
    const savedCareerPath = localStorage.getItem('userCareerPath');
    if (savedCareerPath) {
      setCareerPath(savedCareerPath);
    }
  }, []);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userCareerPath', careerPath);
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
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'File upload failed',
        description: 'Please select a valid file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      try {
        const resumeDataUri = reader.result as string;
        localStorage.setItem('resumeDataUri', resumeDataUri);
        localStorage.setItem('resumeFileName', file.name);
        setResumeFile({ name: file.name });
        toast({
          title: 'Resume Uploaded',
          description: `${file.name} has been saved.`,
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Could not save the resume. Please try again.',
        });
      }
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the uploaded file.',
      });
    };
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleRemoveResume = () => {
    localStorage.removeItem('resumeDataUri');
    localStorage.removeItem('resumeFileName');
    setResumeFile(null);
    toast({
      title: 'Resume Removed',
      description: 'Your resume has been removed.',
    });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        setAvatarImage(dataUri);
        localStorage.setItem('avatarImage', dataUri);
        toast({
          title: 'Photo updated',
          description: 'Your new profile photo has been saved.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSignOut = () => {
    localStorage.clear();
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
    router.push('/');
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
                <AvatarImage src={avatarImage || ''} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button type="button" variant="outline" onClick={handleAvatarClick}>
                Change photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="career-path">Career Path</Label>
                <Input id="career-path" placeholder="e.g., Software Engineer, Product Manager" value={careerPath} onChange={(e) => setCareerPath(e.target.value)} />
              </div>
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Resume</CardTitle>
          <CardDescription>
            Manage your resume for analysis and career recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resumeFile ? (
            <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              Upload your resume here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              (PDF, DOCX, TXT)
            </p>
          </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 font-medium">
                <File className="h-5 w-5 text-primary" />
                <span>{resumeFile.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveResume}>
                <X className="h-5 w-5" />
                <span className="sr-only">Remove resume</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
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
                    <CardTitle>Sign Out</CardTitle>
                    <CardDescription>
                    You will be returned to the login screen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                    </Button>
                </CardContent>
            </Card>
        </div>
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

    