
'use client';

import { useState } from 'react';
import { File as FileIcon, Loader2, Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as React from 'react';

import {
  analyzeResume,
  AnalyzeResumeOutput,
} from '@/ai/flows/analyze-resume-flow';
import {
  recommendCareerPaths,
} from '@/ai/flows/recommend-career-paths-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ResumeAnalysis from '@/components/dashboard/resume-analysis';

export default function ResumePage() {
  const [analysis, setAnalysis] = useState<AnalyzeResumeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resumeDataUri, setResumeDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) {
      toast({
        variant: 'destructive',
        title: 'File upload failed',
        description: 'Please select a valid file.',
      });
      return;
    }
    
    if (uploadedFile.size > 2 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Please upload a resume smaller than 2 MB.',
      });
      return;
    }

    setFile(uploadedFile);
    setAnalysis(null);
    setResumeDataUri(null);

    await handleAnalysis(uploadedFile);
  };

  const handleAnalysis = async (fileToAnalyze: File) => {
    setLoading(true);
    localStorage.removeItem('recommendedCareerPaths');

    const reader = new FileReader();
    reader.readAsDataURL(fileToAnalyze);
    reader.onload = async () => {
      try {
        const dataUri = reader.result as string;
        setResumeDataUri(dataUri);

        const analysisResult = await analyzeResume({ resumeDataUri: dataUri });
        
        if (analysisResult.isResume) {
            setAnalysis(analysisResult);

            if (analysisResult.extractedSkills && analysisResult.extractedSkills.length > 0) {
              const careerPathResult = await recommendCareerPaths({
                skills: analysisResult.extractedSkills,
              });
              localStorage.setItem(
                'recommendedCareerPaths',
                JSON.stringify(careerPathResult)
              );
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid File',
                description: analysisResult.rejectionReason || "The uploaded file does not appear to be a resume. Please upload a valid resume (CV)."
            });
            setFile(null);
            setResumeDataUri(null);
        }

      } catch (error) {
        console.error('Error analyzing resume:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the resume. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the uploaded file.',
      });
      setLoading(false);
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
    setResumeDataUri(null);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="transition-transform transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="text-accent">Resume Analyzer</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              { file ? "Drop a different file or click to replace" : "Upload your resume here" }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              (PDF, TXT - Max 2MB)
            </p>
          </div>
          {file && (
            <div className="mt-6 flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <FileIcon className="w-6 h-6 text-primary" />
                <span className="font-medium truncate">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12 animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-4 text-lg">Analyzing your resume...</p>
        </div>
      )}

      {analysis && !loading && (
        <>
          <ResumeAnalysis analysis={analysis} />
        </>
      )}
    </div>
  );
}
