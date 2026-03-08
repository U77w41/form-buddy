import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import imageCompression from "browser-image-compression";

const PdfCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [done, setDone] = useState(false);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setOriginalSize(files[0].size);
    setDone(false);
  }, []);

  const compress = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);

      // Re-create: copies structure, drops some metadata/unused objects
      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(srcPdf, srcPdf.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      setCompressedSize(pdfBytes.length);
      setDone(true);

      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "compressed.pdf";
      a.click();
    } finally {
      setProcessing(false);
    }
  }, [file]);

  const reduction = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

  return (
    <Layout title="PDF Compressor" description="Reduce PDF file size by optimizing internal structure.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone accept=".pdf" onFiles={handleFiles} label="Upload a PDF to compress" files={file ? [file] : []} onRemoveFile={() => { setFile(null); setDone(false); }} />

        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">Original: {(originalSize / 1024).toFixed(1)} KB</p>
            <Button onClick={compress} disabled={processing} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {processing ? "Compressing..." : "Compress & Download"}
            </Button>

            {done && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Compressed: {(compressedSize / 1024).toFixed(1)} KB — <span className="font-medium text-success">{reduction}% reduction</span>
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default PdfCompressor;
