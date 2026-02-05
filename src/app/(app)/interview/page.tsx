
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Loader2,
  Send,
  ArrowRight,
  RefreshCcw,
  Keyboard,
} from 'lucide-react';
import {
  mockInterviewWithRealtimeFeedback,
} from '@/ai/flows/mock-interview-flow';
import {
  analyzeInterviewAnswer,
  AnalyzeInterviewAnswerOutput,
} from '@/ai/flows/analyze-interview-answer-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && window.webkitSpeechRecognition);

type InterviewMode = 'video' | 'audio' | 'text';
type UserProfile = { resumeDataUri?: string };

export default function InterviewPage() {
  const [domain, setDomain] = useState('');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('text');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeInterviewAnswerOutput | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = React.useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (interviewStarted && interviewMode === 'video') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description:
              'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    }
  }, [interviewStarted, interviewMode, toast]);

  useEffect(() => {
    if (SpeechRecognition && interviewMode !== 'text') {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      let finalTranscript = '';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        finalTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserAnswer(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      recognitionRef.current?.stop();
    }
  }, [interviewMode]);

  const startInterview = useCallback(async () => {
    if (!domain) {
      toast({
        variant: 'destructive',
        title: 'Please enter a domain.',
      });
      return;
    }
    setInterviewStarted(true);
    setLoading(true);

    if (!userProfile?.resumeDataUri) {
      toast({
        variant: 'destructive',
        title: 'Resume not found',
        description: 'Please upload a resume on the resume or settings page.',
      });
      setInterviewStarted(false);
      setLoading(false);
      return;
    }

    try {
      const result = await mockInterviewWithRealtimeFeedback({
        domain,
        resumeDataUri: userProfile.resumeDataUri,
      });
      setCurrentQuestion(result.question);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to start interview',
        description: 'Could not generate the first question. Please try again.',
      });
      setInterviewStarted(false);
    } finally {
      setLoading(false);
    }
  }, [domain, toast, userProfile]);

  const toggleRecording = () => {
    if (!SpeechRecognition) {
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support voice recording.',
      });
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setUserAnswer('');
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const submitAnswer = async () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    if (!userAnswer.trim()) {
      toast({
        variant: 'destructive',
        title: 'Please provide an answer.',
      });
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const analysisResult = await analyzeInterviewAnswer({
        question: currentQuestion,
        answer: userAnswer,
      });
      setAnalysis(analysisResult);
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze your answer. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    setLoading(true);
    setCurrentQuestion('');
    setUserAnswer('');
    setAnalysis(null);
    if (!userProfile?.resumeDataUri) return;
    try {
      const result = await mockInterviewWithRealtimeFeedback({
        domain,
        resumeDataUri: userProfile.resumeDataUri,
      });
      setCurrentQuestion(result.question);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to get next question',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!interviewStarted) {
    return (
      <div className="flex justify-center items-center h-full animate-pop-in p-4 sm:p-0">
        <Card className="w-full max-w-lg transition-transform transform hover:scale-[1.02]">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Mock Interview Simulator</CardTitle>
            <CardDescription>
              Prepare for your next interview. Choose your settings to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-base font-semibold">
                Interview Domain
              </Label>
              <Input
                id="domain"
                placeholder="e.g., Software Engineering, Product Management"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-4">
              <Label className="text-base font-semibold">Interview Mode</Label>
              <RadioGroup
                value={interviewMode}
                onValueChange={(value) =>
                  setInterviewMode(value as InterviewMode)
                }
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="text"
                    id="text"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="text"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                  >
                    <Keyboard className="mb-3 h-6 w-6" />
                    Text-based
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="audio"
                    id="audio"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="audio"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                  >
                    <Mic className="mb-3 h-6 w-6" />
                    Audio Interview
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="video"
                    id="video"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="video"
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                  >
                    <Video className="mb-3 h-6 w-6" />
                    Video Interview
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              onClick={startInterview}
              className="w-full h-12 text-lg"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Start Interview <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-fade-in-up">
      <div className="flex flex-col gap-4">
        <Card className="flex-grow transition-transform transform hover:scale-[1.02]">
          <CardHeader>
            <CardTitle>Interview Question</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold min-h-[100px]">
            {loading && !currentQuestion ? (
              <Loader2 className="animate-spin" />
            ) : (
              currentQuestion
            )}
          </CardContent>
        </Card>
        {analysis ? (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
              <CardDescription>
                Overall Score:
                <Badge className="ml-2 text-lg">{analysis.score}%</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Clarity:</h4>
                <p className="text-muted-foreground">
                  {analysis.analysis?.clarity}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Content:</h4>
                <p className="text-muted-foreground">
                  {analysis.analysis?.content}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Improvement Tips:</h4>
                <p className="text-muted-foreground">
                  {analysis.improvementTips}
                </p>
              </div>
              <Button onClick={nextQuestion} className="w-full">
                Next Question <RefreshCcw className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground h-full">
            <p>
              {loading && analysis === null
                ? 'Analyzing your answer...'
                : 'Your feedback will appear here.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {interviewMode === 'video' ? (
          <Card className="flex-grow transition-transform transform hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Camera</CardTitle>
              <Badge variant={hasCameraPermission ? 'default' : 'destructive'}>
                {hasCameraPermission ? (
                  <Video className="mr-2" />
                ) : (
                  <VideoOff className="mr-2" />
                )}
                {hasCameraPermission ? 'Camera On' : 'No Camera'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                {hasCameraPermission ? (
                  <video
                    ref={videoRef}
                    className="w-full aspect-video rounded-md"
                    autoPlay
                    playsInline
                    muted
                  />
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        ) : interviewMode === 'audio' ? (
          <Card className="flex flex-col items-center justify-center bg-muted p-4">
            <Mic
              className={cn(
                'w-12 h-12 text-muted-foreground transition-colors',
                isRecording && 'text-green-500 animate-pulse'
              )}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {isRecording ? 'Recording...' : 'Audio only mode'}
            </p>
          </Card>
        ) : null}

        <Card className="transition-transform transform hover:scale-[1.02] flex-grow">
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col h-[calc(100%-76px)]">
            <Textarea
              placeholder={interviewMode !== 'text' ? "Your answer will be transcribed here... or type it directly." : "Type your answer here..."}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full flex-grow"
            />
            <div className="flex justify-between items-center">
              {interviewMode !== 'text' ? (
                <Button onClick={toggleRecording} variant="outline" size="icon">
                  {isRecording ? (
                    <MicOff className="text-red-500" />
                  ) : (
                    <Mic />
                  )}
                </Button>
              ) : <div></div>}
              <Button onClick={submitAnswer} disabled={loading || !userAnswer}>
                {loading && analysis === null ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Submit Answer <Send className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
