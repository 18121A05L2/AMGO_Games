import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

interface AssetsTabProps {
  campaignId: string;
}

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export const AssetsTab: React.FC<AssetsTabProps> = ({ campaignId: _campaignId }) => {
  const { addToast } = useUIStore();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [completedModalOpen, setCompletedModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateFileUpload = (fileObj: UploadingFile) => {
    const totalTime = 2000 + Math.random() * 2000; // 2-4 seconds
    const intervalTime = 100;
    const steps = totalTime / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(Math.floor((currentStep / steps) * 100), 100);
      
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, progress } : f
      ));

      if (currentStep >= steps) {
        clearInterval(timer);
        
        // 5% chance of error
        const isError = Math.random() < 0.05;
        
        setFiles(prev => {
          const updated = prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: (isError ? 'error' : 'completed') as 'error' | 'completed', progress: isError ? f.progress : 100 } 
              : f
          );
          
          if (!isError) {
             // Check if this was the last file to complete
             const stillUploading = updated.some(u => u.status === 'uploading');
             if (!stillUploading) {
               setCompletedModalOpen(true);
             }
          } else {
             addToast({ title: 'Upload Failed', description: `${fileObj.name} failed to upload.`, type: 'error' });
          }
          return updated;
        });
      }
    }, intervalTime);
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const newUploads = Array.from(newFiles).map(f => ({
      id: Math.random().toString(36).substring(2, 9),
      name: f.name,
      size: f.size,
      progress: 0,
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newUploads]);

    newUploads.forEach(simulateFileUpload);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in focus:outline-none max-w-4xl mx-auto">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Upload Campaign Assets</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Drag and drop images, videos, or documents here, or click to browse your files.
        </p>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Upload Queue</h4>
          <div className="border border-border rounded-lg divide-y divide-border bg-card">
            {files.map(f => (
              <div key={f.id} className="p-4 flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded shrink-0">
                  <File className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium truncate pr-4">{f.name}</p>
                    {f.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : f.status === 'error' ? (
                      <span className="text-xs text-destructive font-medium shrink-0">Failed</span>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="text-muted-foreground hover:text-foreground shrink-0"><X size={16} /></button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-300 ease-out",
                          f.status === 'completed' ? "bg-emerald-500" : f.status === 'error' ? "bg-destructive" : "bg-primary"
                        )} 
                        style={{ width: `${f.progress}%` }} 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums min-w-[3rem] text-right">
                      {f.progress}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatSize(f.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal 
        isOpen={completedModalOpen} 
        onClose={() => setCompletedModalOpen(false)}
        title="Uploads Complete"
        footer={<Button onClick={() => setCompletedModalOpen(false)}>Done</Button>}
      >
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-lg font-medium">All assets uploaded successfully!</h3>
          <p className="text-muted-foreground text-sm">
            Your files have been attached to this campaign. They will be processed shortly.
          </p>
        </div>
      </Modal>
    </div>
  );
};
