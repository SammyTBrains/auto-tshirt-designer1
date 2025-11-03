/**
 * Design Export Utilities
 * Handle PNG and PDF download of custom designs
 */

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface ExportOptions {
  filename?: string;
  format: "png" | "pdf";
  quality?: number;
}

/**
 * Export a design element as PNG
 */
export async function exportToPNG(
  element: HTMLElement,
  filename: string = "design",
  quality: number = 1.0
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error("Failed to create blob");
        }
        downloadBlob(blob, `${filename}.png`);
      },
      "image/png",
      quality
    );
  } catch (error) {
    console.error("PNG export failed:", error);
    throw new Error("Failed to export design as PNG");
  }
}

/**
 * Export a design element as PDF
 */
export async function exportToPDF(
  element: HTMLElement,
  filename: string = "design"
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error("Failed to export design as PDF");
  }
}

/**
 * Export a base64 image string as file
 */
export function exportBase64Image(
  base64Data: string,
  filename: string = "design",
  format: "png" | "pdf" = "png"
): void {
  try {
    if (format === "pdf") {
      // Convert base64 to PDF
      const pdf = new jsPDF();
      pdf.addImage(base64Data, "PNG", 10, 10, 190, 190);
      pdf.save(`${filename}.pdf`);
    } else {
      // Convert base64 to PNG
      const link = document.createElement("a");
      link.href = base64Data;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Base64 export failed:", error);
    throw new Error(`Failed to export design as ${format.toUpperCase()}`);
  }
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
