
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  Award,
  Briefcase,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';

interface ResumeAnalysisProps {
  analysis: AnalyzeResumeOutput;
}

export default function ResumeAnalysis({ analysis }: ResumeAnalysisProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="transition-transform transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Activity />
              Skill Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.skillSummary || 'No summary could be generated.'}</p>
          </CardContent>
        </Card>

        <Card className="transition-transform transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Lightbulb />
              Improvement Insights
            </CardTitle>
            <CardDescription>
              Actionable feedback to make your resume stand out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.improvementInsights && analysis.improvementInsights.length > 0 ? (
                analysis.improvementInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-1 text-green-500 shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No improvement insights available.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card className="transition-transform transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Award />
              Extracted Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.extractedSkills && analysis.extractedSkills.length > 0 ? (
              analysis.extractedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills were extracted.</p>
            )}
          </CardContent>
        </Card>

        <Card className="transition-transform transform hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Briefcase />
              Suggested Roles
            </CardTitle>
            <CardDescription>
              Top job roles based on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.suggestedRoles && analysis.suggestedRoles.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {analysis.suggestedRoles.map((role, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4">
                        <span className="truncate">{role.title}</span>
                        <Badge variant="outline">{role.matchConfidence}%</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground text-center pt-4">No roles were suggested.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
