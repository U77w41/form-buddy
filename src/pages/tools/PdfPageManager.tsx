import { useState, useCallback, useEffect } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";

const PdfPageManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ index: number; thumb: string; included: boolean }[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const count = pdf.getPageCount();

      // Generate simple page placeholders (real thumbnails would need pdf.js)
      const thumbs = Array.from({ length: count }, (_, i) => ({
        index: i,
        thumb: "",
        included: true,
      }));
      setPages(thumbs);
    } finally {
      setProcessing(false);
    }
  }, []);

  const togglePage = (index: number) => {
    setPages((prev) => prev.map((p) => (p.index === index ? { ...p, included: !p.included } : p)));
  };

  const exportPdf = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();
      const includedIndices = pages.filter((p) => p.included).map((p) => p.index);
      const copied = await newPdf.copyPages(srcPdf, includedIndices);
      copied.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "managed.pdf";
      a.click();
    } finally {
      setProcessing(false);
    }
  }, [file, pages]);

  const includedCount = pages.filter((p) => p.included).length;

  return (
    <Layout title="PDF Page Manager" description="View and manage individual pages — remove unwanted ones before exporting.">
      <div className="mx-auto max-w-3xl space-y-6">
        <FileDropZone accept=".pdf" onFiles={handleFiles} label="Upload a PDF" files={file ? [file] : []} onRemoveFile={() => { setFile(null); setPages([]); }} />

        {pages.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {includedCount} of {pages.length} pages selected. Click to toggle.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {pages.map((page) => (
                <button
                  key={page.index}
                  onClick={() => togglePage(page.index)}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-4 text-sm font-medium transition-all ${
                    page.included
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground opacity-50"
                  }`}
                >
                  {!page.included && (
                    <Trash2 className="absolute top-1 right-1 h-3 w-3 text-destructive" />
                  )}
                  <span className="text-lg font-bold">{page.index + 1}</span>
                </button>
              ))}
            </div>
            <Button onClick={exportPdf} disabled={processing || includedCount === 0} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {processing ? "Exporting..." : `Export ${includedCount} Pages`}
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default PdfPageManager;
