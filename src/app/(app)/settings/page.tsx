
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
import { File as FileIcon, Loader2, LogOut, Upload, X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  AuthError,
} from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { analyzeResume } from '@/ai/flows/analyze-resume-flow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

type UserProfile = {
  name?: string;
  email?: string;
  careerPath?: string;
  profilePicture?: string;
  resumeFileName?: string;
  resumeDataUri?: string;
};

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
  });

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const userDocRef = React.useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const [resumeFile, setResumeFile] = useState<{ name: string } | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [careerPath, setCareerPath] = useState('');
  const [isValidatingResume, setIsValidatingResume] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; reason: string }>({ isOpen: false, reason: '' });
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

  const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

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

  const handlePasswordSubmit = async (
    values: z.infer<typeof changePasswordSchema>
  ) => {
    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not verify user. Please sign in again.',
      });
      return;
    }

    changePasswordForm.clearErrors();
    const credential = EmailAuthProvider.credential(
      user.email,
      values.currentPassword
    );

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      toast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully.',
      });
      changePasswordForm.reset();
    } catch (error) {
      const authError = error as AuthError;
      let description = 'An unexpected error occurred.';
      if (authError.code === 'auth/wrong-password') {
        description = 'The current password you entered is incorrect.';
        changePasswordForm.setError('currentPassword', {
          type: 'manual',
          message: description,
        });
      } else if (authError.code === 'auth/weak-password') {
        description = 'The new password is too weak.';
        changePasswordForm.setError('newPassword', {
          type: 'manual',
          message: description,
        });
      } else if (authError.code === 'auth/requires-recent-login') {
        description =
          'This operation is sensitive and requires recent authentication. Please sign out and sign in again.';
      }
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description,
      });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !userDocRef) {
        toast({
          variant: 'destructive',
          title: 'File upload failed',
          description: 'Please select a valid file.',
        });
        return;
      }

      setIsValidatingResume(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const resumeDataUri = reader.result as string;
          
          // Validate resume content before saving
          const val = await analyzeResume({ resumeDataUri });
          
          if (!val.isResume) {
            setRejectionModal({ 
              isOpen: true, 
              reason: val.rejectionReason || "The uploaded document does not appear to be a valid resume." 
            });
            setIsValidatingResume(false);
            return;
          }

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
        } finally {
          setIsValidatingResume(false);
        }
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the uploaded file.',
        });
        setIsValidatingResume(false);
      };
    },
    [toast, userDocRef]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
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
        setDocumentNonBlocking(
          userDocRef,
          { profilePicture: dataUri },
          { merge: true }
        );
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

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Dialog open={rejectionModal.isOpen} onOpenChange={(open) => setRejectionModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
               <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Invalid Document</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {rejectionModal.reason}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button className="w-full" onClick={() => setRejectionModal({ isOpen: false, reason: '' })}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="career-path">Career Path</Label>
                <Input
                  id="career-path"
                  placeholder="e.g., Software Engineer, Product Manager"
                  value={careerPath}
                  onChange={(e) => setCareerPath(e.target.value)}
                />
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
          {isValidatingResume ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-medium">Validating document content...</p>
            </div>
          ) : !resumeFile ? (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="transition-transform transform hover:scale-[1.02]">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password here. Choose a strong password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...changePasswordForm}>
              <form
                onSubmit={changePasswordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={changePasswordForm.formState.isSubmitting}
                >
                  {changePasswordForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="transition-transform transform hover:scale-[1.02]">
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
  );
}
