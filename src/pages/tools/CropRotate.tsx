import { useState, useCallback, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import FileDropZone from "@/components/FileDropZone";
import { Button } from "@/components/ui/button";
import { Download, RotateCw } from "lucide-react";
import { motion } from "framer-motion";

const CropRotate = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  // Crop state
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
    setRotation(0);
    setCropStart(null);
    setCropEnd(null);
    const url = URL.createObjectURL(files[0]);
    setImgSrc(url);
  }, []);

  const rotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
    setResult(null);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCropStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCropEnd(null);
    setIsCropping(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCropEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => setIsCropping(false);

  const getCropRect = () => {
    if (!cropStart || !cropEnd) return null;
    return {
      x: Math.min(cropStart.x, cropEnd.x),
      y: Math.min(cropStart.y, cropEnd.y),
      w: Math.abs(cropEnd.x - cropStart.x),
      h: Math.abs(cropEnd.y - cropStart.y),
    };
  };

  const apply = useCallback(async () => {
    if (!imgSrc) return;
    const img = new Image();
    img.src = imgSrc;
    await new Promise((res) => (img.onload = res));

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // Get displayed image dimensions for scaling crop
    const displayedImg = imgRef.current;
    const crop = getCropRect();

    let sw = img.width, sh = img.height;
    if (rotation === 90 || rotation === 270) { sw = img.height; sh = img.width; }

    if (crop && displayedImg) {
      const scaleX = sw / displayedImg.clientWidth;
      const scaleY = sh / displayedImg.clientHeight;
      const cx = crop.x * scaleX;
      const cy = crop.y * scaleY;
      const cw = crop.w * scaleX;
      const ch = crop.h * scaleY;

      canvas.width = cw;
      canvas.height = ch;
      ctx.save();
      ctx.translate(-cx, -cy);
      if (rotation !== 0) {
        ctx.translate(sw / 2, sh / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-img.width / 2, -img.height / 2);
      }
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else {
      canvas.width = sw;
      canvas.height = sh;
      ctx.save();
      ctx.translate(sw / 2, sh / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
    }

    setResult(canvas.toDataURL("image/png"));
  }, [imgSrc, rotation, cropStart, cropEnd]);

  const download = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "cropped-rotated.png";
    a.click();
  }, [result]);

  const cropRect = getCropRect();

  return (
    <Layout title="Crop & Rotate" description="Freehand crop and rotate your images.">
      <div className="mx-auto max-w-2xl space-y-6">
        <FileDropZone accept="image/*" onFiles={handleFiles} files={file ? [file] : []} onRemoveFile={() => { setFile(null); setImgSrc(null); setResult(null); }} />

        {imgSrc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={rotate} className="gap-2">
                <RotateCw className="h-4 w-4" /> Rotate 90°
              </Button>
              <Button variant="outline" onClick={() => { setCropStart(null); setCropEnd(null); }}>
                Clear Crop
              </Button>
            </div>

            <div
              className="relative inline-block cursor-crosshair overflow-hidden rounded-xl border border-border"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Source"
                className="max-h-96 w-full object-contain"
                style={{ transform: `rotate(${rotation}deg)` }}
                draggable={false}
              />
              {cropRect && cropRect.w > 5 && (
                <div
                  className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                  style={{ left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h }}
                />
              )}
            </div>

            <Button onClick={apply} className="w-full">Apply Changes</Button>
          </motion.div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <img src={result} alt="Result" className="mx-auto max-h-64 rounded-lg" />
            </div>
            <Button onClick={download} className="w-full gap-2"><Download className="h-4 w-4" /> Download</Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default CropRotate;
