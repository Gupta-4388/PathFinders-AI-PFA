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
  List,
  Target,
} from 'lucide-react';
import { AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';

interface ResumeAnalysisProps {
  analysis: AnalyzeResumeOutput;
}

export default function ResumeAnalysis({ analysis }: ResumeAnalysisProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Activity />
              Skill Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.skillSummary}</p>
          </CardContent>
        </Card>

        <Card>
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
              {analysis.improvementInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 text-green-500 shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Award />
              Extracted Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analysis.extractedSkills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
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
            <Accordion type="single" collapsible className="w-full">
              {analysis.suggestedRoles.map((role, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{role.title}</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
