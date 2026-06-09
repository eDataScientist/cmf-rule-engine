import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp, AlertCircle, Loader2, CheckCircle2, Car, Stethoscope, FileText, Receipt, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { supabase } from '@/lib/db/supabase';
import type { ClaimCategory, DatasetGranularity } from '@/lib/db/types';

type UploadStatus = 'idle' | 'uploading' | 'success';

export default function DatasetUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [country, setCountry] = useState('');
  const [claimCategory, setClaimCategory] = useState<ClaimCategory>('motor');
  const [granularity, setGranularity] = useState<DatasetGranularity>('claim');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    setCompaniesError(null);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      setCompanies(data?.map(c => ({ id: c.id, name: c.name })) ?? []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
      setCompaniesError('Failed to load companies. Please try again.');
    } finally {
      setLoadingCompanies(false);
    }
  };

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
      formData.append('Claim Category', claimCategory);
      formData.append('Granularity', granularity);

      // Call Edge Function and wait for upload status creation
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

      // Show success checkmark
      setUploadStatus('success');

      // Wait 800ms to show checkmark, then navigate
      setTimeout(() => {
        navigate('/datasets');
      }, 800);
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

          {/* Claim Category */}
          <div>
            <Label>Claim Category *</Label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setClaimCategory('motor')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  claimCategory === 'motor'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/25 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                <Car className="h-5 w-5" />
                <span className="font-medium">Motor</span>
              </button>
              <button
                type="button"
                onClick={() => setClaimCategory('medical')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  claimCategory === 'medical'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/25 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                <Stethoscope className="h-5 w-5" />
                <span className="font-medium">Medical</span>
              </button>
            </div>
          </div>

          {/* Granularity */}
          <div>
            <Label>Data Granularity *</Label>
            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setGranularity('claim')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  granularity === 'claim'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/25 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                <FileText className="h-5 w-5" />
                <span className="font-medium">Claim</span>
              </button>
              <button
                type="button"
                onClick={() => setGranularity('invoice')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  granularity === 'invoice'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/25 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                <Receipt className="h-5 w-5" />
                <span className="font-medium">Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setGranularity('item')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  granularity === 'item'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/25 hover:border-primary/50 text-muted-foreground'
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Item</span>
              </button>
            </div>
          </div>

          {/* Insurance Company */}
          <div>
            <Label htmlFor="insurance-company">Insurance Company *</Label>
            {loadingCompanies ? (
              <div className="h-10 flex items-center text-sm text-muted-foreground mt-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading companies...
              </div>
            ) : (
              <Select
                id="insurance-company"
                value={insuranceCompany}
                onChange={(e) => setInsuranceCompany(e.target.value)}
                options={[
                  { value: '', label: '(Select a company)' },
                  ...companies.map(c => ({
                    value: c.name,
                    label: c.name
                  }))
                ]}
                className="mt-2"
              />
            )}
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
          {(error || companiesError) && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error || companiesError}</span>
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
