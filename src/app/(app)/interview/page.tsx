
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  mockInterviewWithRealtimeFeedback,
  MockInterviewOutput,
} from '@/ai/flows/mock-interview-flow';
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

const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && window.webkitSpeechRecognition);

type InterviewMode = 'video' | 'text';

export default function InterviewPage() {
  const [domain, setDomain] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<
    'entry' | 'mid' | 'senior'
  >('entry');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('video');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [analysis, setAnalysis] = useState<MockInterviewOutput | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const { toast } = useToast();

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
    if (SpeechRecognition && interviewMode === 'video') {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setUserAnswer(
          (prev) => prev + finalTranscript + interimTranscript
        );
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
    const resumeDataUri = localStorage.getItem('resumeDataUri');
    if (!resumeDataUri) {
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
        experienceLevel,
        resumeDataUri,
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
  }, [domain, experienceLevel, toast]);

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
      // This is a simplified simulation. A real implementation would send the answer
      // to the backend for analysis against the specific question.
      const analysisResult: MockInterviewOutput = {
        question: currentQuestion,
        analysis: {
          tone: 'Confident and clear.',
          clarity: 'Well-structured and easy to follow.',
          content:
            'The answer was relevant and demonstrated good knowledge of the topic.',
        },
        score: 85,
        improvementTips:
          'Consider providing a more specific example to strengthen your point.',
      };
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
    const resumeDataUri = localStorage.getItem('resumeDataUri') as string;
    try {
      const result = await mockInterviewWithRealtimeFeedback({
        domain,
        experienceLevel,
        resumeDataUri,
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
      <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Mock Interview Simulator</CardTitle>
            <CardDescription>
              Prepare for your next interview. Choose your settings to begin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="domain">Interview Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., Software Engineering"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                onValueChange={(
                  value: 'entry' | 'mid' | 'senior'
                ) => setExperienceLevel(value)}
                value={experienceLevel}
              >
                <SelectTrigger id="experience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview-mode">Interview Mode</Label>
              <Select
                onValueChange={(value: InterviewMode) =>
                  setInterviewMode(value)
                }
                value={interviewMode}
              >
                <SelectTrigger id="interview-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video /> Video Interview
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Keyboard /> Text-based Interview
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={startInterview}
              className="w-full"
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
    <div className="grid md:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col gap-4">
        {interviewMode === 'video' && (
          <Card className="flex-grow">
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
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={interviewMode === 'video' ? "Your answer will be transcribed here... or type it directly." : "Type your answer here..."}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={interviewMode === 'video' ? 5 : 10}
              className="w-full"
            />
            <div className="flex justify-between items-center">
              {interviewMode === 'video' ? (
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

      <div className="flex flex-col gap-4">
        <Card className="flex-grow">
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
          <Card>
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
                <h4 className="font-semibold">Tone:</h4>
                <p className="text-muted-foreground">
                  {analysis.analysis?.tone}
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
    </div>
  );
}

    