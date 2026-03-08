import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";

const PdfSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRange, setPageRange] = useState("1");
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    setFile(files[0]);
    const bytes = await files[0].arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    setTotalPages(pdf.getPageCount());
    setPageRange(`1-${pdf.getPageCount()}`);
  }, []);

  const parseRange = (range: string, max: number): number[] => {
    const pages: number[] = [];
    range.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [a, b] = trimmed.split("-").map(Number);
        for (let i = a; i <= Math.min(b, max); i++) if (i >= 1) pages.push(i);
      } else {
        const n = Number(trimmed);
        if (n >= 1 && n <= max) pages.push(n);
      }
    });
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const split = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(bytes);
      const pages = parseRange(pageRange, srcPdf.getPageCount());

      const newPdf = await PDFDocument.create();
      const copied = await newPdf.copyPages(srcPdf, pages.map((p) => p - 1));
      copied.forEach((p) => newPdf.addPage(p));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "split.pdf";
      a.click();
    } finally {
      setProcessing(false);
    }
  }, [file, pageRange]);

  return (
    <Layout title="PDF Splitter" description="Extract specific pages from a PDF document.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone accept=".pdf" onFiles={handleFiles} label="Upload a PDF" sublabel="Select pages to extract" files={file ? [file] : []} onRemoveFile={() => { setFile(null); setTotalPages(0); }} />

        {file && totalPages > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm text-muted-foreground">Total pages: {totalPages}</p>
            <div>
              <Label>Pages to extract (e.g., 1-3, 5, 7-9)</Label>
              <Input value={pageRange} onChange={(e) => setPageRange(e.target.value)} />
            </div>
            <Button onClick={split} disabled={processing} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {processing ? "Splitting..." : "Extract Pages"}
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default PdfSplitter;
