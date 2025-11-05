import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account and application settings. This page is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Settings form and options will go here */}
        </CardContent>
      </Card>
    </div>
  );
}
