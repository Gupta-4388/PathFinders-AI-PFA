
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
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  mockInterviewWithRealtimeFeedback,
} from '@/ai/flows/mock-interview-flow';
import {
  analyzeInterviewAnswer,
  AnalyzeInterviewAnswerOutput,
} from '@/ai/flows/analyze-interview-answer-flow';
import { validateRoleCompatibility, ValidateRoleCompatibilityOutput } from '@/ai/flows/validate-role-compatibility-flow';
import { generateFinalReport, GenerateFinalReportOutput } from '@/ai/flows/generate-final-report-flow';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && window.webkitSpeechRecognition);

type InterviewMode = 'video' | 'audio' | 'text';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed';

interface InterviewSessionItem {
  question: string;
  answer: string;
  analysis: AnalyzeInterviewAnswerOutput;
  score: number;
}

export default function InterviewPage() {
  // Config state
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed');
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('text');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  
  // Status state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compatibility, setCompatibility] = useState<ValidateRoleCompatibilityOutput | null>(null);
  
  // Session state
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [questionAudio, setQuestionAudio] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionHistory, setSessionHistory] = useState<InterviewSessionItem[]>([]);
  const [finalReport, setFinalReport] = useState<GenerateFinalReportOutput | null>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedMediaUrl, setRecordedMediaUrl] = useState<string | null>(null);
  
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
        const text = e.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/msword': ['.doc', '.docx'] },
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
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: interviewMode === 'video',
            audio: true,
          });
          streamRef.current = stream;
          if (interviewMode === 'video' && videoRef.current) {
            setHasCameraPermission(true);
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (error) {
          toast({ variant: 'destructive', title: 'Media Access Denied', description: 'Enable camera/mic permissions.' });
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
      setRecordedMediaUrl(null);
      recordedChunksRef.current = [];

      try {
        if (streamRef.current) {
          mediaRecorderRef.current = new MediaRecorder(streamRef.current);
          mediaRecorderRef.current.ondataavailable = (e) => e.data.size > 0 && recordedChunksRef.current.push(e.data);
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: interviewMode === 'video' ? 'video/webm' : 'audio/webm' });
            setRecordedMediaUrl(URL.createObjectURL(blob));
          };
          mediaRecorderRef.current.start();
        }

        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
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
        toast({ variant: "destructive", title: "Recording Failed" });
      }
    }
  };

  const handleStart = async () => {
    if (!jobRole.trim() || !resumeText) {
      toast({ variant: 'destructive', title: 'Setup Incomplete', description: 'Please enter a job role and upload your resume.' });
      return;
    }

    setIsValidating(true);
    try {
      const val = await validateRoleCompatibility({ jobRole, resumeText });
      setCompatibility(val);
      if (val.isCompatible) {
        setInterviewStarted(true);
        fetchNextQuestion(true);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Validation Error' });
    } finally {
      setIsValidating(false);
    }
  };

  const fetchNextQuestion = async (isFirst = false) => {
    setLoading(true);
    try {
      const history = sessionHistory.map(h => ({ question: h.question, answer: h.answer }));
      const result = await mockInterviewWithRealtimeFeedback({
        jobRole,
        difficulty,
        interviewType,
        resumeText,
        history
      });
      setCurrentQuestion(result.question);
      if (result.question) {
        const audio = await textToSpeech(result.question);
        setQuestionAudio(audio.audioDataUri);
      }
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to generate question' });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const feedback = await analyzeInterviewAnswer({ question: currentQuestion, answer: userAnswer });
      const newItem: InterviewSessionItem = {
        question: currentQuestion,
        answer: userAnswer,
        analysis: feedback,
        score: feedback.score
      };
      setSessionHistory(prev => [...prev, newItem]);
      toast({ title: 'Answer Submitted', description: `Score: ${feedback.score}%` });
      setCurrentQuestion('');
      setUserAnswer('');
      setRecordedMediaUrl(null);
      fetchNextQuestion();
    } catch (e) {
      toast({ variant: 'destructive', title: 'Submission failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (sessionHistory.length === 0) {
      setInterviewStarted(false);
      return;
    }
    setLoading(true);
    try {
      const report = await generateFinalReport({ jobRole, resumeText, history: sessionHistory });
      setFinalReport(report);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Report generation failed' });
    } finally {
      setLoading(false);
    }
  };

  if (finalReport) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <Card className="border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-primary/10 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> Interview Report
                </CardTitle>
                <CardDescription>Target Role: {jobRole}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Overall Score</p>
                <p className="text-4xl font-black text-primary">{finalReport.overallScore}%</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-green-500" /> Key Strengths</h3>
                <ul className="space-y-2">
                  {finalReport.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm bg-muted p-2 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /> Areas to Improve</h3>
                <ul className="space-y-2">
                  {finalReport.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm bg-muted p-2 rounded-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-500" /> Skill Gaps for {jobRole}</h3>
              <div className="flex flex-wrap gap-2">
                {finalReport.skillGaps.map((gap, i) => (
                  <Badge key={i} variant="outline" className="text-sm py-1 px-3 border-blue-500/30 bg-blue-500/5">{gap}</Badge>
                ))}
              </div>
            </div>

            <Alert className="bg-primary/5 border-primary/20">
              <Lightbulb className="w-5 h-5 text-primary" />
              <AlertTitle className="font-bold">AI Improvement Suggestions</AlertTitle>
              <AlertDescription className="text-sm">{finalReport.improvementSuggestions}</AlertDescription>
            </Alert>

            <div className="pt-6 border-t">
              <p className="font-bold mb-2">Final Verdict</p>
              <p className="text-muted-foreground italic">&quot;{finalReport.readinessVerdict}&quot;</p>
            </div>

            <Button onClick={() => window.location.reload()} className="w-full h-12 text-lg font-bold">
              Try Another Session <RefreshCcw className="ml-2 w-5 h-5" />
            </Button>
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
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src="https://github.com/Gupta-4388/PFA-logo/blob/main/PFA-Mock%202.png?raw=true" alt="Mock 2" className="w-12 h-12" />
            </div>
            <CardTitle className="text-3xl font-bold">Interview Simulator Pro</CardTitle>
            <CardDescription>Setup your session. We'll validate your resume against the role.</CardDescription>
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
                <p className="text-xs text-muted-foreground mt-1">PDF or TXT required for role validation</p>
              </div>
            </div>

            {compatibility && !compatibility.isCompatible && (
              <Alert variant="destructive" className="animate-pop-in">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Incompatible Resume</AlertTitle>
                <AlertDescription>
                  {compatibility.feedback} 
                  <div className="mt-2">
                    <p className="font-bold">Missing Skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {compatibility.missingSkills.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleStart} className="w-full h-12 text-lg font-bold" disabled={isValidating}>
              {isValidating ? <Loader2 className="animate-spin mr-2" /> : "Start Mock Interview"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in-up">
      {questionAudio && <audio src={questionAudio} autoPlay />}
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="secondary">{jobRole}</Badge>
          <Badge variant="outline" className="capitalize">{difficulty}</Badge>
          <Badge variant="outline">{interviewType}</Badge>
        </div>
        <Button variant="destructive" size="sm" onClick={handleEndInterview}>
          <X className="mr-2 h-4 w-4" /> End & Generate Report
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Interviewer Question</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-medium min-h-[100px] flex items-center">
          {loading && !currentQuestion ? (
            <div className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin" /><span>Generating next question...</span></div>
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
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden group">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              {isRecording && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white" /> REC {recordingDuration}s
                </div>
              )}
            </div>
          )}

          {interviewMode === 'audio' && (
            <div className="h-32 bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
              <Mic className={cn("w-12 h-12", isRecording ? "text-red-500 animate-pulse" : "text-muted-foreground")} />
              <p className="text-sm font-bold">{isRecording ? `Recording... ${recordingDuration}s` : "Microphone Ready"}</p>
            </div>
          )}

          <Textarea 
            placeholder="Type your answer or speak..."
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
            <Button className="h-12 flex-1 text-lg font-bold" onClick={submitAnswer} disabled={loading || !userAnswer.trim() || isRecording}>
              {loading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" /> Submit Answer</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Session Progress</p>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {sessionHistory.map((h, i) => (
            <div key={i} className={cn(
              "h-2 rounded-full",
              h.score > 80 ? "bg-green-500" : h.score > 60 ? "bg-yellow-500" : "bg-red-500"
            )} />
          ))}
          {loading && <div className="h-2 rounded-full bg-muted animate-pulse" />}
        </div>
      </div>
    </div>
  );
}
