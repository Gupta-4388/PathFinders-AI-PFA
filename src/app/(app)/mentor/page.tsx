'use client';

import { aiMentorProvidePersonalizedGuidance, AIMentorProvidePersonalizedGuidanceOutput } from '@/ai/ai-mentor-guidance-flow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Loader2, Send, User } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  resources?: AIMentorProvidePersonalizedGuidanceOutput['suggestedResources'];
}

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await aiMentorProvidePersonalizedGuidance({ query: input });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.response,
        isUser: false,
        resources: aiResponse.suggestedResources,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="text-accent">AI Mentor</CardTitle>
          <CardDescription>
            Your personal AI career coach. Ask me anything about your career path.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          <ScrollArea className="flex-grow h-[400px] pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-3',
                    message.isUser ? 'justify-end' : ''
                  )}
                >
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-md rounded-lg p-3 text-sm',
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {message.resources && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Suggested Resources:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {message.resources.map((resource, index) => (
                            <li key={index}>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline"
                              >
                                {resource.title}
                              </a>
                              {resource.description && <p className="text-xs text-muted-foreground">{resource.description}</p>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {message.isUser && (
                     <Avatar className="h-8 w-8">
                       <AvatarImage src="https://picsum.photos/seed/user/100/100" />
                       <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for career advice..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
