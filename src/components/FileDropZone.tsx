import { useCallback, useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  sublabel?: string;
  files?: File[];
  onRemoveFile?: (index: number) => void;
}

const FileDropZone = ({
  accept,
  multiple = false,
  onFiles,
  label = "Drop files here or click to browse",
  sublabel,
  files = [],
  onRemoveFile,
}: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length) onFiles(multiple ? droppedFiles : [droppedFiles[0]]);
    },
    [onFiles, multiple]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length) onFiles(multiple ? selected : [selected[0]]);
      e.target.value = "";
    },
    [onFiles, multiple]
  );

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium text-foreground">{label}</p>
        {sublabel && <p className="mt-1 text-sm text-muted-foreground">{sublabel}</p>}
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 space-y-2"
          >
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 text-sm"
              >
                <span className="truncate text-foreground">{file.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  {onRemoveFile && (
                    <button onClick={() => onRemoveFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileDropZone;
