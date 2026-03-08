import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

const ImageToPdf = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const convert = useCallback(async () => {
    if (!files.length) return;
    setProcessing(true);
    try {
      const pdf = new jsPDF();
      let first = true;

      for (const file of files) {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        await new Promise((res) => (img.onload = res));

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;

        if (!first) pdf.addPage();
        first = false;

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        pdf.addImage(dataUrl, "JPEG", x, y, w, h);
        URL.revokeObjectURL(url);
      }

      pdf.save("images.pdf");
    } finally {
      setProcessing(false);
    }
  }, [files]);

  return (
    <Layout title="Image to PDF" description="Convert scanned images into a single PDF document.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone
          accept="image/*"
          multiple
          onFiles={handleFiles}
          label="Drop images here"
          sublabel="Add multiple images — they'll appear as pages in order"
          files={files}
          onRemoveFile={removeFile}
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button onClick={convert} disabled={processing} className="w-full gap-2">
              <Download className="h-4 w-4" />
              {processing ? "Creating PDF..." : `Create PDF (${files.length} page${files.length > 1 ? "s" : ""})`}
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default ImageToPdf;
