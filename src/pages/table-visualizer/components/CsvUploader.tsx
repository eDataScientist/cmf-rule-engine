import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CsvUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  isProcessing?: boolean;
}

export function CsvUploader({ onFileSelect, selectedFile, onClear, isProcessing }: CsvUploaderProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Card className="border-white/60 bg-white/80 p-6 shadow-lg shadow-black/5 backdrop-blur">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="group rounded-3xl border-2 border-dashed border-white/60 bg-white/70 p-10 text-center transition-all duration-300 hover:border-primary/60 hover:bg-white/90"
        >
          <Upload className="mx-auto mb-6 h-12 w-12 text-primary transition-transform duration-300 group-hover:-translate-y-1" />
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Drag and drop your CSV file here, or click to browse
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-upload"
            disabled={isProcessing}
          />
          <Button
            variant="outline"
            disabled={isProcessing}
            type="button"
            onClick={() => document.getElementById('csv-upload')?.click()}
            size="lg"
            className="rounded-full px-8 text-[0.7rem] tracking-[0.25em] uppercase"
          >
            Select CSV File
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-content-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-black/10">
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-1 text-left">
              <p className="font-display text-lg text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            disabled={isProcessing}
            className="h-12 w-12 rounded-full border border-white/50 bg-white/70 text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
