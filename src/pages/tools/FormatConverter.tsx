import { useState, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

const FORMATS = [
  { label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  { label: "PNG", mime: "image/png", ext: "png" },
  { label: "WebP", mime: "image/webp", ext: "webp" },
];

const FormatConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState(FORMATS[0]);
  const [result, setResult] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const convert = useCallback(async () => {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((res) => (img.onload = res));

    const canvas = canvasRef.current!;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    if (format.mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), format.mime, 0.92));
    setResultSize(blob.size / 1024);
    const reader = new FileReader();
    reader.onload = () => setResult(reader.result as string);
    reader.readAsDataURL(blob);
  }, [file, format]);

  const download = useCallback(() => {
    if (!result) return;
    const name = file?.name.replace(/\.[^.]+$/, "") || "converted";
    const a = document.createElement("a");
    a.href = result;
    a.download = `${name}.${format.ext}`;
    a.click();
  }, [result, file, format]);

  return (
    <Layout title="Format Converter" description="Convert images between JPG, PNG, and WebP.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone accept="image/*" onFiles={handleFiles} files={file ? [file] : []} onRemoveFile={() => { setFile(null); setResult(null); }} />

        {file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.ext}
                  onClick={() => { setFormat(f); setResult(null); }}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    format.ext === f.ext ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button onClick={convert} className="w-full">Convert to {format.label}</Button>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
              <img src={result} alt="Converted" className="mx-auto max-h-64 rounded-lg" />
              <p className="mt-2 text-sm text-muted-foreground">{format.label} — {resultSize.toFixed(1)} KB</p>
            </div>
            <Button onClick={download} className="w-full gap-2"><Download className="h-4 w-4" /> Download</Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default FormatConverter;
