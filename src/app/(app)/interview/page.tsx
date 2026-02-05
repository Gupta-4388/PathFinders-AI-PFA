
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
  X,
} from 'lucide-react';
import {
  mockInterviewWithRealtimeFeedback,
} from '@/ai/flows/mock-interview-flow';
import {
  analyzeInterviewAnswer,
  AnalyzeInterviewAnswerOutput,
} from '@/ai/flows/analyze-interview-answer-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
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
  const [questionAudio, setQuestionAudio] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeInterviewAnswerOutput | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = React.useMemo(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

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
      if (result.question) {
        const audioResult = await textToSpeech(result.question);
        setQuestionAudio(audioResult.audioDataUri);
      }
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
    setQuestionAudio(null);
    if (!userProfile?.resumeDataUri) return;
    try {
      const result = await mockInterviewWithRealtimeFeedback({
        domain,
        resumeDataUri: userProfile.resumeDataUri,
      });
      setCurrentQuestion(result.question);
      if (result.question) {
        const audioResult = await textToSpeech(result.question);
        setQuestionAudio(audioResult.audioDataUri);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to get next question',
      });
    } finally {
      setLoading(false);
    }
  };

  const endInterview = () => {
    setInterviewStarted(false);
    setCurrentQuestion('');
    setQuestionAudio(null);
    setUserAnswer('');
    setAnalysis(null);
    setLoading(false);
    setIsRecording(false);
    setHasCameraPermission(false);

    // Stop camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    toast({
      title: 'Interview Ended',
      description: 'You have returned to the setup screen.',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in-up">
      {questionAudio && <audio src={questionAudio} autoPlay />}
      <Card className="transition-all duration-300 transform hover:scale-[1.01] border border-transparent hover:border-primary/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Interview Question</CardTitle>
          <Button variant="destructive" size="sm" onClick={endInterview}>
            <X className="mr-2 h-4 w-4" />
            End Interview
          </Button>
        </CardHeader>
        <CardContent className="text-base text-muted-foreground min-h-[80px] flex items-center">
          {loading && !currentQuestion ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : (
            <p>{currentQuestion}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex-grow">
        {analysis ? (
          <Card className="animate-pop-in transition-all duration-300 transform hover:scale-[1.01] border border-transparent hover:border-primary/50">
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
              <CardDescription>
                Overall Score:{' '}
                <Badge
                  className={cn(
                    'ml-2 text-lg',
                    analysis.score > 80
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : analysis.score > 60
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  )}
                >
                  {analysis.score}%
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Clarity:</h4>
                <p className="text-muted-foreground">{analysis.analysis?.clarity}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Content:</h4>
                <p className="text-muted-foreground">{analysis.analysis?.content}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Improvement Tips:</h4>
                <p className="text-muted-foreground">{analysis.improvementTips}</p>
              </div>
              <Button onClick={nextQuestion} className="w-full h-11 text-base">
                Next Question <RefreshCcw className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col flex-grow transition-all duration-300 transform hover:scale-[1.01] border border-transparent hover:border-primary/50">
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
              {interviewMode === 'video' && (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  {isRecording && (
                    <div className="absolute top-2 left-2 bg-red-500/80 text-white px-2 py-1 rounded-md text-sm font-mono flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      <span>{formatDuration(recordingDuration)}</span>
                    </div>
                  )}
                  {!hasCameraPermission && (
                    <Alert variant="destructive" className="absolute w-auto m-4">
                      <VideoOff className="h-4 w-4" />
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access to use this feature.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
              {interviewMode === 'audio' && (
                <div className="h-32 flex flex-col items-center justify-center bg-muted rounded-md gap-4">
                  <Mic
                    className={cn(
                      'w-10 h-10 text-muted-foreground transition-colors',
                      isRecording && 'text-red-500 animate-pulse'
                    )}
                  />
                  {isRecording ? (
                    <div className="text-center">
                      <p className="text-sm text-red-500">Recording your answer...</p>
                      <p className="text-sm font-mono text-red-500">{formatDuration(recordingDuration)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Get ready to speak
                    </p>
                  )}
                </div>
              )}

              <Textarea
                placeholder={
                  interviewMode === 'text'
                    ? 'Type your answer here...'
                    : 'Your answer will be transcribed here... or you can type.'
                }
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full flex-grow min-h-[150px] text-base"
                disabled={loading}
              />

              <div className="flex justify-between items-center mt-2">
                {interviewMode !== 'text' ? (
                  <Button
                    onClick={toggleRecording}
                    variant="outline"
                    size="lg"
                    className="h-11"
                    disabled={loading}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 text-red-500" /> Stop Recording
                      </>
                    ) : userAnswer.trim() ? (
                      <>
                        <RefreshCcw className="mr-2" /> Record Again
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2" /> Start Recording
                      </>
                    )}
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  onClick={submitAnswer}
                  disabled={loading || !userAnswer.trim() || isRecording}
                  size="lg"
                  className="h-11"
                >
                  {loading ? (
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
        )}
      </div>
    </div>
  );
}
