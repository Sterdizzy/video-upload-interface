
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/x-msvideo', 'video/quicktime'];
export const ALLOWED_EXTENSIONS = ['.mp4', '.avi', '.mov'];

export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const isValidType = ALLOWED_VIDEO_TYPES.includes(file.type);
  const isValidExtension = ALLOWED_EXTENSIONS.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );

  if (!isValidType && !isValidExtension) {
    return {
      isValid: false,
      error: 'Only MP4, AVI, and MOV video files are allowed.',
    };
  }

  return { isValid: true };
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
  
  return `${baseName}_${timestamp}_${randomId}${extension}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
