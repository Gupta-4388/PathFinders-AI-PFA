'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileText, Lightbulb, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';
import { Badge } from '@/components/ui/badge';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResumeOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Limit file size to 5MB
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
        setAnalysis(result);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during analysis. Please try again.');
    } finally {
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
          Upload your resume to get instant AI-powered feedback and unlock your potential.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Accepted formats: PDF, DOCX. Max file size: 5MB.
              </CardDescription>
            </div>
            <Input
              ref={fileInputRef}
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            {!file && (
               <Button onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {file && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary">{Math.round(file.size / 1024)} KB</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <X className="h-4 w-4"/>
              </Button>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleAnalyzeClick}
              disabled={!file || loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze My Resume'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="space-y-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Skill Summary
              </CardTitle>
              <CardDescription>An AI-generated overview of the skills identified in your resume.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-md">{analysis.skillSummary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-accent" />
                Improvement Insights
              </CardTitle>
              <CardDescription>Actionable feedback to make your resume stand out.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-md">{analysis.improvementInsights}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
