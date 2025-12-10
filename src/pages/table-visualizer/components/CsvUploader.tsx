import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div>
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded p-3 text-center transition-colors cursor-pointer"
          style={{ borderColor: '#3f3f46' }}
          onClick={() => document.getElementById('csv-upload')?.click()}
        >
          <Upload className="mx-auto h-6 w-6 text-zinc-500 mb-2" />
          <p className="text-xs text-zinc-400 mb-2">
            Drop CSV or click to browse
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
            size="sm"
            className="h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('csv-upload')?.click();
            }}
          >
            Select File
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 rounded border" style={{ borderColor: '#3f3f46', backgroundColor: '#27272a' }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-100 truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-zinc-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={isProcessing}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
