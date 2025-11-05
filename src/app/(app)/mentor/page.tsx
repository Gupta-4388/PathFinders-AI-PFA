
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Send, User as UserIcon, Link as LinkIcon, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  aiMentorProvidePersonalizedGuidance,
  AIMentorProvidePersonalizedGuidanceOutput,
} from '@/ai/ai-mentor-guidance-flow';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Message = {
  role: 'user' | 'model';
  content: string;
  resources?: AIMentorProvidePersonalizedGuidanceOutput['suggestedResources'];
};

type UserProfile = {
  name?: string;
  resumeDataUri?: string;
  profilePicture?: string;
};

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  
  useEffect(() => {
    if (messages.length) {
      scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    setMessages([{
        role: 'model',
        content: `Hello ${userProfile?.name || 'there'}! I'm your AI Mentor. How can I help you with your career today? Feel free to ask me anything about resumes, interviews, skill development, or career paths.`
    }])
  }, [userProfile?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({role: m.role, content: m.content}));

      const result = await aiMentorProvidePersonalizedGuidance({
        query: input,
        resume: userProfile?.resumeDataUri,
        history: chatHistory,
      });

      const modelMessage: Message = {
        role: 'model',
        content: result.response,
        resources: result.suggestedResources,
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error with AI Mentor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
      setMessages(prev => prev.slice(0, -1)); // remove user message on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot /> AI Mentor
          </CardTitle>
          <CardDescription>
            Your personal AI-powered career coach.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-lg p-3 rounded-lg',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4"/> Suggested Resources:</h4>
                        {message.resources.map((resource, i) => (
                           <Card key={i} className="bg-background/50 hover:bg-background transition-colors">
                             <CardContent className="p-3">
                                <Link href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                                  <LinkIcon className="w-4 h-4 text-muted-foreground"/>
                                  <div>
                                    <p className="font-semibold text-sm group-hover:underline">{resource.title}</p>
                                    <p className="text-xs text-muted-foreground">{resource.description}</p>
                                  </div>
                                </Link>
                             </CardContent>
                           </Card>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 border">
                      <AvatarImage src={userProfile?.profilePicture} />
                      <AvatarFallback>
                        <UserIcon />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-4">
                    <Avatar className="w-8 h-8 border">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-lg">
                       <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your career..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
