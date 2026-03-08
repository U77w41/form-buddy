import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";

const PdfMerger = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const merge = useCallback(async () => {
    if (files.length < 2) return;
    setProcessing(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "merged.pdf";
      a.click();
    } finally {
      setProcessing(false);
    }
  }, [files]);

  return (
    <Layout title="PDF Merger" description="Combine multiple PDFs into one document.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone
          accept=".pdf"
          multiple
          onFiles={handleFiles}
          label="Drop PDFs here"
          sublabel="Add multiple PDFs — they'll be merged in order"
          files={files}
          onRemoveFile={removeFile}
        />

        {files.length >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button onClick={merge} disabled={processing} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {processing ? "Merging..." : `Merge ${files.length} PDFs`}
            </Button>
          </motion.div>
        )}
        {files.length === 1 && (
          <p className="text-sm text-muted-foreground text-center">Add at least one more PDF to merge.</p>
        )}
      </div>
    </Layout>
  );
};

export default PdfMerger;
