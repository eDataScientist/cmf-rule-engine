import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/db/supabase';

type UploadStatus = 'idle' | 'uploading' | 'success';

export default function DatasetUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('Claims_Data', file);
      formData.append('Insurance Company Name', insuranceCompany);
      formData.append('Country', country);
      formData.append('Email', user.email || '');

      // Call Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-dataset-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('Upload result:', result);

      // Show success checkmark for 1 second
      setUploadStatus('success');

      setTimeout(() => {
        navigate('/datasets');
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('idle');
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Dataset
          </CardTitle>
          <CardDescription>
            Upload a claims dataset for processing and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Dropzone */}
          <div>
            <Label>Dataset File (CSV, XLS, XLSX)</Label>
            <div
              {...getRootProps()}
              className={`mt-2 flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <FileUp className={`h-12 w-12 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {file ? (
                  <span className="font-medium text-foreground">{file.name}</span>
                ) : isDragActive ? (
                  'Drop the file here...'
                ) : (
                  'Drag & drop a file here, or click to select'
                )}
              </p>
              {file && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          {/* Insurance Company */}
          <div>
            <Label htmlFor="insurance-company">Insurance Company *</Label>
            <Input
              id="insurance-company"
              value={insuranceCompany}
              onChange={(e) => setInsuranceCompany(e.target.value)}
              placeholder="e.g., AXA, Allianz, etc."
              required
            />
          </div>

          {/* Country */}
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., UAE, Saudi Arabia, etc."
              required
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Using your account email
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || !insuranceCompany || !country || uploadStatus !== 'idle'}
              className="flex-1"
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
              {uploadStatus === 'idle' && 'Upload Dataset'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/datasets')}
              disabled={uploadStatus !== 'idle'}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            * Required fields. Your dataset will be processed in the background. You can navigate
            away and check the status on the Datasets page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
