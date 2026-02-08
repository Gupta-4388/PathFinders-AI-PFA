'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' }),
});

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
});

export function AuthForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('sign-in');
  const [submissionError, setSubmissionError] = useState<{ title: string; description: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });
  
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const handleAuthError = (error: AuthError) => {
    let title = 'Authentication Failed';
    let description = 'An unexpected error occurred. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        title = 'Invalid Credentials';
        description = 'The email or password you entered is incorrect.';
        break;
      case 'auth/email-already-in-use':
        title = 'Email Already in Use';
        description = 'This email address is already associated with an account.';
        break;
      case 'auth/account-exists-with-different-credential':
        title = 'Account Already Exists';
        description = 'An account already exists with the same email address but different sign-in credentials. Please sign in using your original method (Email/Password or Google).';
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'The password must be at least 8 characters long.';
        break;
      case 'auth/invalid-email':
        title = 'Invalid Email';
        description = 'Please enter a valid email address.';
        break;
      case 'auth/operation-not-allowed':
        title = 'Sign-In Method Disabled';
        description = 'This sign-in method is disabled. Please contact support.';
        break;
      case 'auth/popup-blocked':
        title = 'Popup Blocked';
        description = 'The sign-in popup was blocked by your browser. Please enable popups.';
        break;
      case 'auth/popup-closed-by-user':
        setSubmissionError(null);
        return;
      case 'auth/too-many-requests':
        title = 'Too Many Requests';
        description = 'Access to this account has been temporarily disabled due to many failed login attempts.';
        break;
      case 'auth/network-request-failed':
        title = 'Network Error';
        description = 'Please check your internet connection and try again.';
        break;
      case 'auth/unauthorized-domain':
        title = 'Configuration Error';
        description = 'This preview domain must be added to Firebase Authentication → Authorized domains';
        break;
    }
    
    setSubmissionError({ title, description });
  };

  const onSignInSubmit = async (values: z.infer<typeof signInSchema>) => {
    setSubmissionError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Signed In',
        description: 'Welcome back!',
      });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const onSignUpSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setSubmissionError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await updateProfile(userCredential.user, {
        displayName: values.name,
      });

      toast({
        title: 'Account Created',
        description: 'Welcome to PathFinders AI!',
      });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const onGoogleSignIn = async () => {
    setSubmissionError(null);
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    // Allow for existing email/password accounts to be linked if the email matches
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Signed In with Google',
        description: 'Welcome to PathFinders AI!',
      });
      router.push('/dashboard');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsResetting(true);
    setSubmissionError(null);
    try {
        const actionCodeSettings = {
          url: `${window.location.origin}/reset-password`,
          handleCodeInApp: true,
        };
        
        await sendPasswordResetEmail(auth, values.email, actionCodeSettings);
        
        toast({
            title: 'Email Sent',
            description: 'Please check your inbox for password reset instructions.',
        });
        setResetDialogOpen(false);
        forgotPasswordForm.reset();
    } catch (error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/user-not-found') {
          toast({
              title: 'Email Sent',
              description: 'Please check your inbox for password reset instructions.',
          });
          setResetDialogOpen(false);
          forgotPasswordForm.reset();
          return;
        }
        handleAuthError(authError);
    } finally {
        setIsResetting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none p-0">
      <CardContent className="p-0">
        {submissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>{submissionError.title}</AlertTitle>
            <AlertDescription>{submissionError.description}</AlertDescription>
          </Alert>
        )}
        <Tabs
          defaultValue="sign-in"
          value={activeTab}
          onValueChange={(tab) => {
            setSubmissionError(null);
            setActiveTab(tab);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Dialog open={resetDialogOpen} onOpenChange={(open) => {
                          setResetDialogOpen(open);
                          if (!open) setSubmissionError(null);
                        }}>
                            <DialogTrigger asChild>
                                <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                Forgot password?
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                <DialogTitle>Reset Password</DialogTitle>
                                <DialogDescription>
                                    Enter your email and we'll send a link to reset your password.
                                </DialogDescription>
                                </DialogHeader>
                                <Form {...forgotPasswordForm}>
                                    <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-6 pt-2">
                                        <FormField
                                            control={forgotPasswordForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={isResetting}>
                                            {isResetting ? 'Sending...' : 'Send Reset Link'}
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                      </div>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={signInForm.formState.isSubmitting}>
                  {signInForm.formState.isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="sign-up">
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={signUpForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={signUpForm.formState.isSubmitting}>
                   {signUpForm.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={onGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {activeTab === 'sign-in' ? (
            <>
              New User?{' '}
              <button
                onClick={() => setActiveTab('sign-up')}
                className="font-medium text-primary hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('sign-in')}
                className="font-medium text-primary hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
