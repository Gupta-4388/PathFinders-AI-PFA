'use client';

import { useState, useEffect } from 'react';
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
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const isCooldownActive = cooldownSeconds > 0;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownSeconds > 0) {
      timer = setTimeout(() => setCooldownSeconds((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

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
        description = 'This email address is already in use. Please sign in or reset your password.';
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'The password must be at least 8 characters long.';
        break;
      case 'auth/invalid-email':
        title = 'Invalid Email';
        description = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        title = 'Too Many Requests';
        description = 'Access to this account has been temporarily disabled due to many failed login attempts.';
        break;
      case 'auth/network-request-failed':
        title = 'Network Error';
        description = 'Please check your internet connection and try again.';
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
  
  const onForgotPasswordSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    if (isCooldownActive) return;

    setIsResetting(true);
    setSubmissionError(null);
    try {
        const actionCodeSettings = {
          url: window.location.origin,
          handleCodeInApp: false,
        };

        await sendPasswordResetEmail(auth, values.email, actionCodeSettings);
        
        toast({
            title: 'Success',
            description: 'Password reset link sent. Please check your inbox.',
        });
        setCooldownSeconds(60);
        setResetDialogOpen(false);
        forgotPasswordForm.reset();
    } catch (error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/user-not-found') {
          toast({
              title: 'Success',
              description: 'Password reset link sent. Please check your inbox.',
          });
          setCooldownSeconds(60);
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
                                        <div className="space-y-2">
                                          <Button type="submit" className="w-full" disabled={isResetting || isCooldownActive}>
                                              {isResetting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                              {isResetting ? 'Sending...' : isCooldownActive ? `Wait ${cooldownSeconds}s` : 'Send Reset Link'}
                                          </Button>
                                          {isCooldownActive && (
                                            <p className="text-xs text-center text-muted-foreground">
                                              Please wait before requesting another reset email
                                            </p>
                                          )}
                                        </div>
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
                  {signInForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
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
                   {signUpForm.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                   {signUpForm.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

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
