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
  Upload,
  FileText,
  AlertCircle,
  Trophy,
  Target,
  BarChart,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  FileSearch,
  MessageSquare,
  Activity,
  User,
  Zap,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  mockInterviewWithRealtimeFeedback,
} from '@/ai/flows/mock-interview-flow';
import {
  generateFinalReport,
  GenerateFinalReportOutput,
} from '@/ai/flows/generate-final-report-flow';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { validateRoleCompatibility, ValidateRoleCompatibilityOutput } from '@/ai/flows/validate-role-compatibility-flow';

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || (window as any).webkitSpeechRecognition));

type InterviewMode = 'video' | 'audio' | 'text';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed';

interface InterviewSessionItem {
  question: string;
  answer: string;
}

const TOTAL_QUESTIONS = 15;

export default function InterviewPage() {
  // Config state
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('text');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string>('');
  
  // Status state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [compatibility, setCompatibility] = useState<ValidateRoleCompatibilityOutput | null>(null);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(false);
  
  // Session state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionAudio, setQuestionAudio] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionHistory, setSessionHistory] = useState<InterviewSessionItem[]>([]);
  const [finalReport, setFinalReport] = useState<GenerateFinalReportOutput | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setResumeFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setResumeDataUri(dataUri);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'], 
      'text/plain': ['.txt'], 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  });

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  useEffect(() => {
    if (interviewStarted && (interviewMode === 'video' || interviewMode === 'audio')) {
      const getMediaPermission = async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: interviewMode === 'video',
            audio: true,
          });
          streamRef.current = stream;
          if (interviewMode === 'video' && videoRef.current) {
            setHasCameraPermission(true);
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Media Access Denied', description: 'Please enable camera and microphone permissions in your browser settings.' });
        }
      };
      getMediaPermission();
      return () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };
    }
  }, [interviewStarted, interviewMode, toast]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!streamRef.current && (interviewMode === 'video' || interviewMode === 'audio')) return;
      setUserAnswer('');
      recordedChunksRef.current = [];

      try {
        if (streamRef.current && typeof window !== 'undefined' && 'MediaRecorder' in window) {
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
          mediaRecorderRef.current.ondataavailable = (e) => e.data.size > 0 && recordedChunksRef.current.push(e.data);
          mediaRecorderRef.current.start();
        }

        if (SpeechRecognition) {
          recognitionRef.current = new (SpeechRecognition as any)();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.onresult = (e: any) => {
            let transcript = '';
            for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
            setUserAnswer(transcript);
          };
          recognitionRef.current.start();
        }
        setIsRecording(true);
      } catch (e) {
        toast({ variant: "destructive", title: "Recording Failed", description: "Could not start audio/video recording." });
      }
    }
  };

  const handleStart = async () => {
    if (!jobRole.trim() || !resumeDataUri) {
      toast({ variant: 'destructive', title: 'Setup Incomplete', description: 'Please enter a job role and upload your resume.' });
      return;
    }

    setIsValidating(true);
    try {
      const val = await validateRoleCompatibility({ jobRole, resumeDataUri });
      setCompatibility(val);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Could not validate your resume. Please try again.' });
    } finally {
      setIsValidating(false);
    }
  };

  const proceedWithInterview = () => {
    setInterviewStarted(true);
    setIsInterviewCompleted(false);
    setQuestionIndex(0);
    setSessionHistory([]);
    fetchNextQuestion(true, compatibility?.missingSkills);
  };

  const fetchNextQuestion = async (isFirst = false, missingSkills?: string[]) => {
    setLoading(true);
    try {
      const result = await mockInterviewWithRealtimeFeedback({
        jobRole,
        difficulty,
        interviewType,
        resumeDataUri: (compatibility?.parsingError) ? undefined : resumeDataUri,
        missingSkills,
        history: sessionHistory
      });
      setCurrentQuestion(result.question);
      setQuestionIndex(prev => prev + 1);

      if (result.question && isNarrationEnabled) {
        const audio = await textToSpeech(result.question);
        setQuestionAudio(audio.audioDataUri);
      } else {
        setQuestionAudio(null);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to generate question', description: 'AI was unable to generate the next question.' });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    let finalAnswer = userAnswer.trim();
    if (!finalAnswer) {
      if (interviewMode === 'text') {
        toast({ title: "Answer Required", description: "Please provide an answer before submitting." });
        return;
      }
      finalAnswer = interviewMode === 'audio' ? "[Audio response recorded - transcription unavailable]" : "[Video response recorded - transcription unavailable]";
    }

    setLoading(true);
    try {
      const newItem: InterviewSessionItem = {
        question: currentQuestion,
        answer: finalAnswer,
      };
      setSessionHistory(prev => [...prev, newItem]);
      setUserAnswer('');
      setCurrentQuestion('');

      if (questionIndex < TOTAL_QUESTIONS) {
        fetchNextQuestion(false, compatibility?.missingSkills);
      } else {
        setIsInterviewCompleted(true);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Submission failed', description: 'Could not process your answer. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (retryCount = 0) => {
    setIsFinalizing(true);
    setLoading(true);
    try {
      const finalizedHistory = [...sessionHistory];
      
      const report = await generateFinalReport({ 
        jobRole, 
        difficulty,
        interviewMode,
        resumeDataUri: (compatibility?.parsingError) ? undefined : resumeDataUri, 
        history: finalizedHistory 
      });
      setFinalReport(report);
      setIsInterviewCompleted(true);
    } catch (e) {
      if (retryCount < 1) {
        return handleGenerateReport(retryCount + 1);
      }
      toast({ 
        variant: 'destructive', 
        title: 'Report generation failed', 
        description: 'We’re generating your report. Please try again in a moment.' 
      });
    } finally {
      setLoading(false);
      setIsFinalizing(false);
    }
  };

  const handleEndEarly = () => {
    setIsInterviewCompleted(true);
    setCurrentQuestion('');
    if (isRecording) {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    }
  };

  if (finalReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-20">
        <Card className="border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/10 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> Interview Report
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  Target Role: <Badge variant="secondary">{jobRole}</Badge>
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{difficulty}</Badge>
                  <Badge variant="outline" className="capitalize">{interviewMode} Mode</Badge>
                  <Badge variant={finalReport.summary?.status === 'Completed' ? "default" : "secondary"}>
                    {finalReport.summary?.status || 'Ended early'} ({finalReport.summary?.questionsAnswered || sessionHistory.length} / {TOTAL_QUESTIONS})
                  </Badge>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4 border shadow-sm flex flex-col items-center min-w-[140px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Overall Readiness</p>
                <p className="text-4xl font-black text-primary">{finalReport.overallScore || 0}%</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-10">
            {finalReport.readinessVerdict && (
              <Alert className="bg-primary/5 border-primary/20">
                <Zap className="w-5 h-5 text-primary" />
                <AlertTitle className="font-bold">Expert Readiness Verdict</AlertTitle>
                <AlertDescription className="text-sm italic">&quot;{finalReport.readinessVerdict}&quot;</AlertDescription>
              </Alert>
            )}

            {finalReport.questionReviews && finalReport.questionReviews.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Question-by-Question Review</h3>
                <Accordion type="single" collapsible className="w-full border rounded-lg overflow-hidden">
                  {finalReport.questionReviews.map((review, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="border-b last:border-0 px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex text-left gap-3">
                          <span className="text-muted-foreground font-bold">{i + 1}.</span>
                          <span className="font-medium line-clamp-1">{review.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Your Answer</p>
                          <p className="text-sm italic">{review.answer}</p>
                        </div>
                        <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                          <p className="text-xs font-bold text-primary uppercase mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> AI Analysis</p>
                          <p className="text-sm">{review.feedback}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {finalReport.strengths && finalReport.strengths.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Core Strengths</h3>
                  <ul className="space-y-2">
                    {finalReport.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-lg border border-transparent hover:border-green-500/20 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {finalReport.weaknesses && finalReport.weaknesses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Growth Areas</h3>
                  <ul className="space-y-2">
                    {finalReport.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-lg border border-transparent hover:border-red-500/20 transition-colors">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {finalReport.skillGaps && finalReport.skillGaps.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-500" /> Role-Specific Skill Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {finalReport.skillGaps.map((gap, i) => (
                    <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-blue-500/30 bg-blue-500/5">{gap}</Badge>
                  ))}
                </div>
              </div>
            )}

            {finalReport.overallFeedback && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500" /> Performance Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['communicationClarity', 'technicalDepth', 'problemSolving', 'confidence'].map((key) => (
                    <Card key={key} className="bg-muted/30 border-0 shadow-none">
                      <CardContent className="p-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm">{(finalReport.overallFeedback as any)[key]}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {finalReport.improvementSuggestions && finalReport.improvementSuggestions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" /> Actionable Next Steps</h3>
                <div className="grid gap-3">
                  {finalReport.improvementSuggestions.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-background group hover:border-primary/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {i + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 border-t flex flex-col sm:flex-row gap-4">
              <Button onClick={() => typeof window !== 'undefined' && window.location.reload()} className="flex-1 h-12 text-lg font-bold" variant="outline">
                New Session <RefreshCcw className="ml-2 w-5 h-5" />
              </Button>
              <Button onClick={() => typeof window !== 'undefined' && window.print()} className="flex-1 h-12 text-lg font-bold">
                Download PDF <FileSearch className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
            <p className="text-center text-[10px] text-muted-foreground mt-4">
              &copy; PathFinders AI. This report is based on the responses submitted during this mock interview session.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interviewStarted) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-0 animate-fade-in-up">
        <Card className="shadow-2xl border-primary/10">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
               <img src="https://github.com/Gupta-4388/PFA-logo/blob/main/PFA-Mock%202.png?raw=true" alt="Mock 2" className="w-12 h-12" />
            </div>
            <CardTitle className="text-3xl font-bold">Interview Simulator Pro</CardTitle>
            <CardDescription>Setup your session. We'll analyze how your resume matches the role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">Target Job Role</Label>
                <Input 
                  placeholder="e.g. Full Stack Developer, Marketing Lead" 
                  value={jobRole} 
                  onChange={e => setJobRole(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Interview Mode</Label>
                <Select value={interviewMode} onValueChange={v => setInterviewMode(v as InterviewMode)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text-Based</SelectItem>
                    <SelectItem value="audio">Audio Interview</SelectItem>
                    <SelectItem value="video">Video Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={v => setDifficulty(v as Difficulty)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner (Entry Level)</SelectItem>
                    <SelectItem value="Intermediate">Intermediate (Mid Level)</SelectItem>
                    <SelectItem value="Advanced">Advanced (Senior/Staff)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Focus Area</Label>
                <Select value={interviewType} onValueChange={v => setInterviewType(v as InterviewType)}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mixed">General Mixed</SelectItem>
                    <SelectItem value="Technical">Strictly Technical</SelectItem>
                    <SelectItem value="Behavioral">Behavioral (STAR Method)</SelectItem>
                    <SelectItem value="HR">HR & Culture Fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Upload Interview Resume</Label>
              <div {...getRootProps()} className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragActive ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
              )}>
                <input {...getInputProps()} />
                <Upload className="mx-auto w-10 h-10 text-muted-foreground mb-2" />
                <p className="font-medium">{resumeFile ? resumeFile.name : "Drag resume here or click to browse"}</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or TXT required</p>
              </div>
            </div>

            {compatibility && (
              <div className="space-y-4 animate-pop-in">
                {compatibility.parsingError ? (
                  <Alert className="border-yellow-500/50 bg-yellow-500/5">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-700">Analysis Warning</AlertTitle>
                    <AlertDescription className="text-yellow-600/80">
                      Resume uploaded successfully, but some content could not be fully analyzed. You can still proceed with the interview.
                    </AlertDescription>
                  </Alert>
                ) : compatibility.matchScore >= 60 ? (
                  <Alert className="border-green-500/50 bg-green-500/5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Strong Match ({compatibility.matchScore}%)</AlertTitle>
                    <AlertDescription className="text-green-600/80">
                      Your resume aligns well with the requirements for a {jobRole}.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant={compatibility.matchScore >= 40 ? "default" : "destructive"} className={cn(
                    compatibility.matchScore >= 40 ? "border-yellow-500/50 bg-yellow-500/5" : "border-red-500/50 bg-red-500/5 text-red-700"
                  )}>
                    {compatibility.matchScore >= 40 ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{compatibility.matchScore >= 40 ? `Partial Match (${compatibility.matchScore}%)` : `Low Match (${compatibility.matchScore}%)`}</AlertTitle>
                    <AlertDescription>
                      {compatibility.feedback}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-3">
                   <Button onClick={proceedWithInterview} className="flex-1 font-bold" disabled={compatibility.matchScore < 40 && !compatibility.parsingError}>
                     Proceed with Interview
                   </Button>
                  <Button variant="outline" onClick={() => setCompatibility(null)} className="flex-1 font-bold">Re-upload Resume</Button>
                </div>
              </div>
            )}

            {!compatibility && (
              <Button onClick={handleStart} className="w-full h-12 text-lg font-bold" disabled={isValidating}>
                {isValidating ? <Loader2 className="animate-spin mr-2" /> : "Analyze & Start"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in-up">
      {questionAudio && <audio src={questionAudio} autoPlay />}
      
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Badge variant="secondary">{jobRole}</Badge>
            <Badge variant="outline" className="capitalize">{difficulty}</Badge>
            <Badge variant="outline">{interviewType}</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            {isInterviewCompleted ? "Interview Session Concluded" : `Question ${questionIndex} of ${TOTAL_QUESTIONS}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
           {!isInterviewCompleted && (
             <div className="flex items-center gap-2">
                {isNarrationEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                <span className="text-xs font-bold mr-1">Voice Narration</span>
                <Switch checked={isNarrationEnabled} onCheckedChange={setIsNarrationEnabled} />
             </div>
           )}
           <Button variant="destructive" size="sm" onClick={handleEndEarly} disabled={isInterviewCompleted || loading}>
            <X className="mr-2 h-4 w-4" /> End Session
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Progress value={(questionIndex / TOTAL_QUESTIONS) * 100} className="h-2" />
      </div>

      {isInterviewCompleted ? (
        <Card className="border-primary shadow-xl bg-primary/5 text-center py-12">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Interview Completed</CardTitle>
            <CardDescription>
              Great job! You've finished your session for {jobRole}. 
              Generate your detailed performance report now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-14 text-xl font-bold" onClick={() => handleGenerateReport()} disabled={loading || isFinalizing}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <><FileSearch className="mr-2" /> Generate Interview Report</>}
            </Button>
            <p className="text-sm text-muted-foreground">
              Based on {sessionHistory.length} responses provided.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Interviewer Question</CardTitle>
            </CardHeader>
            <CardContent className="text-xl font-medium min-h-[100px] flex items-center">
              {loading && !currentQuestion ? (
                <div className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /><span>Preparing next question...</span></div>
              ) : (
                <p className="leading-relaxed">{currentQuestion}</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {interviewMode === 'video' && (
                <div className="aspect-video bg-black rounded-lg relative overflow-hidden group mb-4">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  {isRecording && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white" /> REC {recordingDuration}s
                    </div>
                  )}
                </div>
              )}

              {interviewMode === 'audio' && (
                <div className="h-32 bg-muted rounded-lg flex flex-col items-center justify-center gap-3 mb-4">
                  <Mic className={cn("w-12 h-12", isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
                  <p className="text-sm font-bold">{isRecording ? `Recording... ${recordingDuration}s` : "Microphone Ready"}</p>
                </div>
              )}

              <Textarea 
                placeholder={interviewMode === 'text' ? "Type your answer here..." : "Recording will be transcribed here..."}
                className="min-h-[200px] text-lg resize-none"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                disabled={loading || isRecording}
              />

              <div className="flex justify-between gap-4">
                {interviewMode !== 'text' && (
                  <Button variant="outline" className="h-12 px-8 font-bold" onClick={toggleRecording} disabled={loading}>
                    {isRecording ? <><MicOff className="mr-2" /> Stop Recording</> : <><Mic className="mr-2" /> {userAnswer ? "Record Again" : "Start Speaking"}</>}
                  </Button>
                )}
                <Button className="h-12 flex-1 text-lg font-bold" onClick={submitAnswer} disabled={loading || isRecording}>
                  {loading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" /> Submit Answer</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
