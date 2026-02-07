
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
import { File as FileIcon, LogOut, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signOut } from 'firebase/auth';

type UserProfile = {
  name?: string;
  email?: string;
  careerPath?: string;
  profilePicture?: string;
  resumeFileName?: string;
  resumeDataUri?: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

  const [resumeFile, setResumeFile] = useState<{ name: string } | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [careerPath, setCareerPath] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || user?.displayName || '');
      setEmail(userProfile.email || user?.email || '');
      setCareerPath(userProfile.careerPath || '');
      if (userProfile.profilePicture) {
        setAvatarImage(userProfile.profilePicture);
      }
      if (userProfile.resumeFileName) {
        setResumeFile({ name: userProfile.resumeFileName });
      }
    }
  }, [userProfile, user]);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userDocRef) return;

    const dataToSave: Partial<UserProfile> = {
      name,
      email,
      careerPath,
    };

    setDocumentNonBlocking(userDocRef, dataToSave, { merge: true });

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
    if (!file || !userDocRef) {
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
        const dataToSave = { resumeDataUri, resumeFileName: file.name };
        setDocumentNonBlocking(userDocRef, dataToSave, { merge: true });
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
  }, [toast, userDocRef]);

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
    if (!userDocRef) return;
    const dataToSave = { resumeDataUri: null, resumeFileName: null };
    setDocumentNonBlocking(userDocRef, dataToSave, { merge: true });
    setResumeFile(null);
    toast({
      title: 'Resume Removed',
      description: 'Your resume has been removed.',
    });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userDocRef) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = reader.result as string;
        setAvatarImage(dataUri);
        setDocumentNonBlocking(userDocRef, { profilePicture: dataUri }, { merge: true });
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
    signOut(auth).then(() => {
      localStorage.clear();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      router.push('/');
    }).catch((error) => {
        toast({
            variant: 'destructive',
            title: 'Sign Out Failed',
            description: 'An unexpected error occurred. Please try again.',
        });
    });
  };


  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Card className="transition-transform transform hover:scale-[1.02]">
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
      
      <Card className="transition-transform transform hover:scale-[1.02]">
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
                <FileIcon className="h-5 w-5 text-primary" />
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
            <Card className="transition-transform transform hover:scale-[1.02]">
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
            <Card className="transition-transform transform hover:scale-[1.02] block lg:hidden">
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
        <div className="space-y-6">
            <Card className="transition-transform transform hover:scale-[1.02]">
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
            <Card className="transition-transform transform hover:scale-[1.02] hidden lg:block">
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
      </div>
    </div>
  );
}

    
