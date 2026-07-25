'use client';

import Image from 'next/image';

interface FilePreviewProps {
  url: string;
  fileName: string;
  mimeType?: string | null;
  onDelete?: () => void;
}

export function FilePreview({ url, fileName, mimeType, onDelete }: FilePreviewProps) {
  const isImage = mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {isImage ? (
        <div className="relative w-full h-40 bg-gray-100">
          <Image src={url} alt={fileName} fill className="object-cover" />
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center bg-gray-50">
          <span className="text-4xl">{isPdf ? '📄' : '📎'}</span>
        </div>
      )}
      <div className="p-3 flex items-center justify-between">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline truncate max-w-[150px]"
          title={fileName}
        >
          {fileName}
        </a>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 text-xs ml-2 shrink-0"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
