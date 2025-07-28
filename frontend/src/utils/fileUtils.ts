// File utility functions

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const getFileTypeFromMime = (mimeType: string): string => {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
    'text/plain': 'Text',
    'text/csv': 'CSV',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'image/gif': 'GIF',
  };
  
  return typeMap[mimeType] || 'Unknown';
};

export const isImageFile = (file: File | string): boolean => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
  
  if (typeof file === 'string') {
    const extension = getFileExtension(file).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  }
  
  return imageTypes.includes(file.type);
};

export const isPDFFile = (file: File | string): boolean => {
  if (typeof file === 'string') {
    return getFileExtension(file).toLowerCase() === 'pdf';
  }
  
  return file.type === 'application/pdf';
};

export const isOfficeFile = (file: File | string): boolean => {
  const officeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  
  if (typeof file === 'string') {
    const extension = getFileExtension(file).toLowerCase();
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
  }
  
  return officeTypes.includes(file.type);
};

export const isTextFile = (file: File | string): boolean => {
  const textTypes = ['text/plain', 'text/csv', 'text/html', 'text/xml'];
  
  if (typeof file === 'string') {
    const extension = getFileExtension(file).toLowerCase();
    return ['txt', 'csv', 'html', 'xml', 'json', 'md'].includes(extension);
  }
  
  return textTypes.includes(file.type) || file.type.startsWith('text/');
};

export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  
  return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
};

export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const compressImage = async (file: File, maxSizeMB: number = 1): Promise<File> => {
  const maxSize = maxSizeMB * 1024 * 1024;
  
  if (file.size <= maxSize || !isImageFile(file)) {
    return file;
  }
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const scaleFactor = Math.sqrt(maxSize / file.size);
        width *= scaleFactor;
        height *= scaleFactor;
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.9
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const createFileFromBlob = (blob: Blob, filename: string): File => {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

export const getFileIcon = (fileType: string): string => {
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    txt: '📃',
    csv: '📋',
    zip: '🗜️',
    rar: '🗜️',
  };
  
  const extension = fileType.toLowerCase();
  return iconMap[extension] || '📎';
};

export const sortFilesByName = (files: File[], ascending = true): File[] => {
  return [...files].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
};

export const sortFilesBySize = (files: File[], ascending = true): File[] => {
  return [...files].sort((a, b) => {
    const comparison = a.size - b.size;
    return ascending ? comparison : -comparison;
  });
};

export const sortFilesByDate = (files: File[], ascending = true): File[] => {
  return [...files].sort((a, b) => {
    const comparison = a.lastModified - b.lastModified;
    return ascending ? comparison : -comparison;
  });
};

export const groupFilesByType = (files: File[]): Record<string, File[]> => {
  return files.reduce((groups, file) => {
    const type = getFileTypeFromMime(file.type);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(file);
    return groups;
  }, {} as Record<string, File[]>);
};
