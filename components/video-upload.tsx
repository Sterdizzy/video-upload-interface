
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Video, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateVideoFile, formatFileSize } from '@/lib/upload-utils';

interface UploadResult {
  fileName: string;
  originalName: string;
  fileSize: number;
  viewableUrl: string;
  senderName?: string | null;
  senderEmail?: string | null;
}

export default function VideoUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = (file: File) => {
    setError(null);
    setUploadResult(null);
    
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file type');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95; // Keep at 95% until actual upload completes
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    return interval;
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);
    // Basic validation for sender email if provided
    if (senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      setError('Please enter a valid email address for Sender Email.');
      setIsUploading(false);
      return;
    }
    
    const progressInterval = simulateProgress();

    try {
      // Step 1: Get presigned upload URL and S3 key
      const presignRes = await fetch('/api/presigned-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          contentType: selectedFile.type || 'application/octet-stream',
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create upload URL');
      }

      const { key, uploadUrl } = await presignRes.json();

      // Step 2: Upload file directly to S3 via presigned URL
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type || 'application/octet-stream',
        },
        body: selectedFile,
      });

      if (!putRes.ok) {
        const text = await putRes.text();
        throw new Error(`S3 upload failed: ${putRes.status} ${text || ''}`.trim());
      }

      // Step 3: Notify server to send email and get viewable URL
      const notifyRes = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          originalName: selectedFile.name,
          fileSize: selectedFile.size,
          senderName: senderName || undefined,
          senderEmail: senderEmail || undefined,
        }),
      });

      if (!notifyRes.ok) {
        const err = await notifyRes.json().catch(() => ({}));
        throw new Error(err.error || 'Upload succeeded but notification failed');
      }

      const result = await notifyRes.json();
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSenderName('');
      setSenderEmail('');

    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const openInBrowser = () => {
    if (uploadResult?.viewableUrl) {
      window.open(uploadResult.viewableUrl, '_blank');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSenderName('');
    setSenderEmail('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Video Upload Interface</h1>
        <p className="text-gray-600">Upload MP4, AVI, and MOV files.</p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Sender info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>
          </div>

          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-gray-400'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="mb-4">
                {isUploading ? (
                  <Video className="w-12 h-12 text-blue-500 animate-pulse" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              {selectedFile ? (
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button onClick={uploadFile} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Video'}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-lg mb-2">
                    Drag and drop your video file here, or{' '}
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-500 underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports MP4, AVI, and MOV files • No size limit
                  </p>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.avi,.mov,video/mp4,video/avi,video/x-msvideo,video/quicktime"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center mb-2">
              <Video className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Uploading video...</span>
            </div>
            <Progress value={uploadProgress} className="mb-2" />
            <p className="text-xs text-gray-500">
              {uploadProgress.toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {uploadResult && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">
                Upload Successful!
              </h3>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium">File:</span> {uploadResult.originalName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Size:</span> {formatFileSize(uploadResult.fileSize)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span> Notification sent
              </p>
              {(uploadResult.senderName || uploadResult.senderEmail) && (
                <p className="text-sm">
                  <span className="font-medium">Sender:</span>{' '}
                  {[uploadResult.senderName, uploadResult.senderEmail]
                    .filter(Boolean)
                    .join(' <') + (uploadResult.senderEmail ? '>' : '')}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={openInBrowser} className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Video
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Upload Another
              </Button>
            </div>

            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">Viewable Link:</p>
              <p className="text-xs font-mono break-all text-gray-800">
                {uploadResult.viewableUrl}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
