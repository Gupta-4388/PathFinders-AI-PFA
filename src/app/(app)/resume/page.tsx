'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, FileText, Lightbulb, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';


export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResumeOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => {
      clearInterval(timer);
    };
  }, [loading]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) {
      setError('Please select a resume file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resumeDataUri = reader.result as string;
        const result = await analyzeResume({ resumeDataUri });
        setProgress(100);
        setAnalysis(result);
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during analysis. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume to get instant AI-powered feedback.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Accepted formats: PDF, DOCX. Max file size: 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            ref={fileInputRef}
            id="resume-upload"
            type="file"
            className="file:text-white"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
          {file && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <X className="h-4 w-4"/>
              </Button>
            </div>
          )}
          <Button onClick={handleAnalyzeClick} disabled={loading || !file} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>
          {loading && <Progress value={progress} className="w-full" />}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Improvement Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {analysis.improvementInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {analysis.skillSummary}
              </p>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {analysis.extractedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
