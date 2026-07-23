import React, { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Maximize2, X, Image as ImageIcon } from "lucide-react";

/**
 * Resolves relative image URLs (/uploads/...) to absolute Backend Server origin.
 */
export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const cleanPath = url.startsWith("/") ? url : `/${url}`;

  // 1. Try VITE_API_URL environment variable
  const envUrl = import.meta.env.VITE_API_URL || "";
  if (envUrl && envUrl.startsWith("http")) {
    try {
      const origin = new URL(envUrl).origin;
      return `${origin}${cleanPath}`;
    } catch (e) {
      // ignore
    }
  }

  // 2. Local dev environment
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return `http://localhost:5000${cleanPath}`;
  }

  // 3. Fallback for deployed host: resolve against origin
  return typeof window !== "undefined" ? `${window.location.origin}${cleanPath}` : cleanPath;
};

/**
 * MathContent component renders mathematical equations (LaTeX),
 * scientific notation, embedded images, and attached diagram (fileUrl)
 * with a full-screen interactive lightbox zoom feature.
 */
export const MathContent = ({
  content = "",
  fileUrl = null,
  className = "",
  textSize = "text-base",
  showDiagramLabel = true,
}) => {
  const [zoomImage, setZoomImage] = useState(null);
  const resolvedDiagramUrl = resolveImageUrl(fileUrl);

  // Helper to render LaTeX math safely using KaTeX
  const renderFormattedText = (rawText) => {
    if (!rawText) return "";

    // Split text by LaTeX math delimiters: $$...$$, $...$, \(...\), \[...\]
    const parts = [];
    const mathRegex = /(\$\$.*?\$\$|\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/gs;
    let lastIndex = 0;
    let match;

    while ((match = mathRegex.exec(rawText)) !== null) {
      // Plain text before match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          value: rawText.substring(lastIndex, match.index),
        });
      }

      // Math expression
      const rawExpr = match[0];
      const isDisplay = rawExpr.startsWith("$$") || rawExpr.startsWith("\\[");
      const expr = rawExpr
        .replace(/^\$\$|\$\$$/g, "")
        .replace(/^\$|\$$/g, "")
        .replace(/^\\\(|\\\)$/g, "")
        .replace(/^\\\[|\\\]$/g, "")
        .trim();

      parts.push({
        type: "math",
        value: expr,
        display: isDisplay,
      });

      lastIndex = mathRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push({
        type: "text",
        value: rawText.substring(lastIndex),
      });
    }

    return parts.map((part, idx) => {
      if (part.type === "math") {
        try {
          const html = katex.renderToString(part.value, {
            displayMode: part.display,
            throwOnError: false,
          });
          return (
            <span
              key={idx}
              className={`inline-block mx-0.5 ${part.display ? "my-2 text-center w-full" : ""}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <span key={idx} className="font-mono text-violet-400">{part.value}</span>;
        }
      }

      // Check for inline images inside text (e.g. ![alt](url) or <img src="url">)
      const textVal = part.value;
      const trimmedVal = textVal.trim();

      if (
        trimmedVal.startsWith("http://") ||
        trimmedVal.startsWith("https://") ||
        trimmedVal.startsWith("/uploads/") ||
        trimmedVal.startsWith("data:image/") ||
        /\.(jpg|jpeg|png|webp|svg)(\?.*)?$/i.test(trimmedVal)
      ) {
        const resolvedSrc = resolveImageUrl(trimmedVal);
        return (
          <img
            key={idx}
            src={resolvedSrc}
            alt="Option Diagram"
            onClick={(e) => {
              e.stopPropagation();
              setZoomImage(resolvedSrc);
            }}
            className="inline-block max-h-44 w-auto object-contain rounded-lg border border-slate-700 my-1 cursor-pointer hover:scale-[1.02] transition-transform"
          />
        );
      }
      const imgMdRegex = /!\[(.*?)\]\((.*?)\)/g;
      if (imgMdRegex.test(textVal)) {
        const textParts = textVal.split(imgMdRegex);
        return (
          <span key={idx}>
            {textParts.map((sub, sIdx) => {
              if (sIdx % 3 === 1) {
                // alt text
                return null;
              }
              if (sIdx % 3 === 2) {
                // src
                const resolvedSrc = resolveImageUrl(sub);
                return (
                  <img
                    key={sIdx}
                    src={resolvedSrc}
                    alt="Embedded Diagram"
                    onClick={() => setZoomImage(resolvedSrc)}
                    className="inline-block max-h-64 rounded-lg border border-slate-700 my-2 cursor-pointer hover:scale-[1.02] transition-transform"
                  />
                );
              }
              return sub;
            })}
          </span>
        );
      }

      return <span key={idx}>{textVal}</span>;
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Question / Content Text */}
      {content && (
        <div className={`${textSize} font-medium leading-relaxed text-slate-100`}>
          {renderFormattedText(content)}
        </div>
      )}

      {/* Attached Diagram / Image File (fileUrl) */}
      {resolvedDiagramUrl && (
        <div className="relative group my-3 inline-block max-w-full">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-lg space-y-2 inline-block">
            {showDiagramLabel && (
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold px-1">
                <ImageIcon size={14} />
                <span>Question Diagram / Attachment</span>
              </div>
            )}
            <div className="relative rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center max-h-80 min-h-[140px] p-2">
              <img
                src={resolvedDiagramUrl}
                alt="Question Diagram"
                onClick={() => setZoomImage(resolvedDiagramUrl)}
                className="max-h-72 w-auto object-contain rounded-md cursor-pointer group-hover:opacity-95 transition-all"
                onError={(e) => {
                  console.warn("Diagram image load error:", resolvedDiagramUrl);
                }}
              />
              <button
                type="button"
                onClick={() => setZoomImage(resolvedDiagramUrl)}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700"
                title="Expand Diagram"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center pb-3 border-b border-slate-800 text-sm font-semibold text-slate-300">
              <span className="flex items-center gap-2">
                <ImageIcon size={16} className="text-violet-400" />
                High Resolution Diagram Preview
              </span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh] flex justify-center items-center">
              <img
                src={zoomImage}
                alt="Full Size Diagram"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathContent;
