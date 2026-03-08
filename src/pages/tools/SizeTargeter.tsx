import { useState, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";

const SizeTargeter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("200");
  const [height, setHeight] = useState("230");
  const [maxKB, setMaxKB] = useState("50");
  const [result, setResult] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const process = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const targetW = parseInt(width);
      const targetH = parseInt(height);
      const targetKB = parseFloat(maxKB);

      // First resize to exact dimensions via canvas
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((res) => (img.onload = res));

      const canvas = canvasRef.current!;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, targetW, targetH);
      URL.revokeObjectURL(url);

      // Convert to blob at high quality first
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
      );
      const resizedFile = new File([blob], "resized.jpg", { type: "image/jpeg" });

      // Now compress to target KB
      let finalBlob: Blob;
      if (resizedFile.size / 1024 > targetKB) {
        const compressed = await imageCompression(resizedFile, {
          maxSizeMB: targetKB / 1024,
          useWebWorker: true,
          maxWidthOrHeight: Math.max(targetW, targetH),
          initialQuality: 0.9,
        });
        finalBlob = compressed;
      } else {
        finalBlob = resizedFile;
      }

      // Ensure exact pixel dimensions after compression
      const finalImg = new Image();
      const finalUrl = URL.createObjectURL(finalBlob);
      finalImg.src = finalUrl;
      await new Promise((res) => (finalImg.onload = res));

      canvas.width = targetW;
      canvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(finalImg, 0, 0, targetW, targetH);
      URL.revokeObjectURL(finalUrl);

      // Binary search for quality to hit target KB
      let lo = 0.01, hi = 0.95, bestUrl = "";
      for (let i = 0; i < 15; i++) {
        const mid = (lo + hi) / 2;
        const testBlob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), "image/jpeg", mid)
        );
        if (testBlob.size / 1024 <= targetKB) {
          bestUrl = URL.createObjectURL(testBlob);
          lo = mid;
        } else {
          hi = mid;
        }
      }

      if (!bestUrl) {
        // Use lowest quality
        const lastBlob = await new Promise<Blob>((res) =>
          canvas.toBlob((b) => res(b!), "image/jpeg", 0.01)
        );
        bestUrl = URL.createObjectURL(lastBlob);
        setResultSize(lastBlob.size / 1024);
      } else {
        // Get final size
        const resp = await fetch(bestUrl);
        const finalB = await resp.blob();
        setResultSize(finalB.size / 1024);
      }

      // Read as data URL for display
      const resp = await fetch(bestUrl);
      const b = await resp.blob();
      setResultSize(b.size / 1024);
      const reader = new FileReader();
      reader.onload = () => setResult(reader.result as string);
      reader.readAsDataURL(b);
    } finally {
      setProcessing(false);
    }
  }, [file, width, height, maxKB]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `resized-${width}x${height}.jpg`;
    a.click();
  }, [result, width, height]);

  return (
    <Layout title="Exact Size & KB Targeter" description="Resize to exact pixel dimensions and compress to meet strict file size limits.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone
          accept="image/*"
          onFiles={handleFiles}
          label="Upload your image"
          sublabel="JPG, PNG or WebP"
          files={file ? [file] : []}
          onRemoveFile={() => { setFile(null); setResult(null); }}
        />

        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Width (px)</Label>
                <Input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
              </div>
              <div>
                <Label>Height (px)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div>
                <Label>Max Size (KB)</Label>
                <Input type="number" value={maxKB} onChange={(e) => setMaxKB(e.target.value)} />
              </div>
            </div>
            <Button onClick={process} disabled={processing} className="w-full">
              {processing ? "Optimizing..." : "Resize & Compress"}
            </Button>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
              <img src={result} alt="Result" className="mx-auto max-h-64 rounded-lg" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {width}×{height}px — {resultSize.toFixed(1)} KB
                {resultSize <= parseFloat(maxKB) ? (
                  <span className="ml-2 text-success font-medium">✓ Under limit</span>
                ) : (
                  <span className="ml-2 text-destructive font-medium">Over limit</span>
                )}
              </p>
            </div>
            <Button onClick={download} className="w-full gap-2">
              <Download className="h-4 w-4" /> Download
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default SizeTargeter;
