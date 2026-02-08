'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isAdzunaConfigured, saveAdzunaConfig } from '@/app/actions/config-actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, ShieldCheck } from 'lucide-react';

export function AdzunaConfigModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [appId, setAppId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function checkConfig() {
      // Check if keys are already in the environment
      const configured = await isAdzunaConfigured();
      if (!configured) {
        setIsOpen(true);
      }
    }
    checkConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !apiKey) return;

    setLoading(true);
    try {
      // Save keys securely to .env via Server Action
      await saveAdzunaConfig(appId, apiKey);
      toast({
        title: 'Configuration Saved',
        description: 'Adzuna API credentials have been stored securely.',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Configuration Failed',
        description: 'Could not save credentials. Please check your permissions.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Configure Adzuna API</DialogTitle>
          </div>
          <DialogDescription>
            Enter your Adzuna API credentials to enable real-time job data. 
            These will be stored securely on the server and are never exposed to the client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appId">App ID</Label>
              <Input
                id="appId"
                placeholder="e.g. 1a2b3c4d"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="e.g. a1b2c3d4e5f6..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded border border-border">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            Stored securely on server. Not exposed to client or Firestore.
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Save Configuration
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
