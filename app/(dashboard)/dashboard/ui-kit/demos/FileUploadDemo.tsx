'use client'

import { useState } from 'react'
import { FileUpload, FileUploadContent, FileUploadItem } from '@/components/ui/file-upload'

export default function FileUploadDemo() {
  const [files, setFiles] = useState<File[]>([])

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      accept="image/*"
      multiple
      content={
        files.length ? (
          <FileUploadContent>
            {files.map((f, i) => (
              <FileUploadItem
                key={`${f.name}-${f.size}`}
                file={f}
                onRemove={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
              />
            ))}
          </FileUploadContent>
        ) : null
      }
    />
  )
}
