'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
  AuthError,
} from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { toast } = useToast();

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    // Get the OOB (Out-of-band) code from the URL parameters
    const code = searchParams.get('oobCode');
    if (!code) {
      setError('Invalid password reset link. No reset code was provided.');
      setIsVerifying(false);
      return;
    }
    setOobCode(code);

    // Verify the code is still valid (not expired or already used)
    verifyPasswordResetCode(auth, code)
      .then(() => {
        setIsVerifying(false);
      })
      .catch((err: AuthError) => {
        console.error('Password reset code verification failed:', err);
        if (err.code === 'auth/invalid-action-code') {
          setError('This password reset link is invalid or has expired. Please request a new one.');
        } else if (err.code === 'auth/expired-action-code') {
          setError('This password reset link has expired.');
        } else {
          setError('An unexpected error occurred. Please try again or request a new reset link.');
        }
        setIsVerifying(false);
      });
  }, [searchParams, auth]);

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!oobCode) return;

    try {
      await confirmPasswordReset(auth, oobCode, values.newPassword);
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been changed. You can now log in with your new credentials.',
      });
      // Redirect to landing page where they can sign in
      router.push('/');
    } catch (err) {
      const authError = err as AuthError;
      if (authError.code === 'auth/weak-password') {
        form.setError('newPassword', {
          type: 'manual',
          message: 'The password you chose is too weak. Please use a stronger password.',
        });
      } else {
        setError('Failed to reset password. The session may have expired. Please request a new link.');
      }
    }
  }

  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Verifying reset link...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20 pointer-events-none">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-500"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-500"></div>
      </div>

      <div className="absolute top-6 left-6 z-10">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <Card className="w-full max-w-md z-10 shadow-xl border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Enter a strong password to secure your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Problem with Link</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Min. 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Repeat your new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Reset Password
                </Button>
              </form>
            </Form>
          )}
           <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Return to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center flex-col gap-4 text-primary"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ResetPasswordComponent />
        </Suspense>
    )
}