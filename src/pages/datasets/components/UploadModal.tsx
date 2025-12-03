import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogPortal,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/db/supabase';

type UploadStatus = 'idle' | 'uploading' | 'success';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [country, setCountry] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    },
  });

  const handleUpload = async () => {
    if (!file || !insuranceCompany || !country || !user) {
      setError('Please fill in all required fields');
      return;
    }

    setUploadStatus('uploading');
    setError(null);

    try {
      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('Claims_Data', file);
      formData.append('Insurance Company Name', insuranceCompany);
      formData.append('Country', country);
      formData.append('Email', user.email || '');
      if (nickname) {
        formData.append('Dataset Nickname', nickname);
      }

      // Call Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-dataset-upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Show success checkmark
      setUploadStatus('success');

      // Wait 800ms to show checkmark, then call onSuccess
      setTimeout(() => {
        onSuccess();
        // Reset form
        setFile(null);
        setNickname('');
        setInsuranceCompany('');
        setCountry('');
        setUploadStatus('idle');
      }, 800);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('idle');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ingest New Dataset</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-4">
          {/* File Dropzone */}
          <div>
            <Label className="text-xs text-zinc-400 mb-2 block">
              Dataset File
            </Label>
            <div
              {...getRootProps()}
              className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-zinc-700 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <FileUp
                className={`h-10 w-10 ${isDragActive ? 'text-primary' : 'text-zinc-500'}`}
              />
              <p className="mt-2 text-center text-sm text-zinc-400">
                {file ? (
                  <span className="font-medium text-foreground">{file.name}</span>
                ) : isDragActive ? (
                  'Drop the file here...'
                ) : (
                  'Drag files here or click to browse'
                )}
              </p>
              {file ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              ) : (
                <div className="mt-2 flex gap-2">
                  <span className="border border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 rounded">
                    CSV
                  </span>
                  <span className="border border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 rounded">
                    XLSX
                  </span>
                  <span className="border border-zinc-700 text-zinc-400 text-xs px-2 py-0.5 rounded">
                    PARQUET
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields - 2 Column Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nickname" className="text-xs text-zinc-400">
                Dataset Nickname
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Optional"
                className="h-8 bg-black border-zinc-800 text-sm mt-1"
              />
            </div>
            <div>
              <Label htmlFor="insurance-company" className="text-xs text-zinc-400">
                Insurance Company *
              </Label>
              <Input
                id="insurance-company"
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value)}
                placeholder="e.g., GIG, AXA"
                className="h-8 bg-black border-zinc-800 text-sm mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-xs text-zinc-400">
                Country/Region *
              </Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Egypt, UAE"
                className="h-8 bg-black border-zinc-800 text-sm mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs text-zinc-400">
                Uploader Email
              </Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="h-8 bg-zinc-900 border-zinc-800 text-sm mt-1 text-zinc-500"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={uploadStatus !== 'idle'}
            className="h-9"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !insuranceCompany || !country || uploadStatus !== 'idle'}
            className="h-9"
          >
            {uploadStatus === 'uploading' && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            )}
            {uploadStatus === 'success' && (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Uploaded!
              </>
            )}
            {uploadStatus === 'idle' && 'Begin Ingestion'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
