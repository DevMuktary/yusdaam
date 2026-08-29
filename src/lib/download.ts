/**
 * Universal client-side file downloader with real-time stream progress tracking.
 * Streams binary chunks from the download proxy and calculates exact percentage.
 */

export interface DownloadProgress {
  percent: number;
  loaded: number;
  total: number;
  filename: string;
  status: "STARTING" | "DOWNLOADING" | "COMPLETED" | "ERROR";
  error?: string;
}

export async function downloadFileToDevice({
  url,
  filename,
  onProgress,
  onStart,
  onSuccess,
  onError,
}: {
  url: string;
  filename: string;
  onProgress?: (progress: DownloadProgress) => void;
  onStart?: (filename: string) => void;
  onSuccess?: (filename: string) => void;
  onError?: (errorMsg: string) => void;
}) {
  if (!url) {
    const errorMsg = "No file URL available for download";
    onProgress?.({ percent: 0, loaded: 0, total: 0, filename, status: "ERROR", error: errorMsg });
    onError?.(errorMsg);
    return;
  }

  // Ensure file has a proper .pdf extension
  const safeFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  const cleanFilename = safeFilename.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

  onStart?.(cleanFilename);
  onProgress?.({
    percent: 0,
    loaded: 0,
    total: 0,
    filename: cleanFilename,
    status: "STARTING",
  });

  try {
    // 1. Stream from proxy endpoint which returns binary with Content-Disposition: attachment
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanFilename)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok || !response.body) {
      throw new Error(`Download failed (HTTP ${response.status})`);
    }

    const contentLengthHeader = response.headers.get("Content-Length");
    const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
    
    const reader = response.body.getReader();
    let loaded = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        loaded += value.length;
        
        const percent = total > 0 
          ? Math.min(99, Math.round((loaded / total) * 100)) 
          : Math.min(95, Math.round(loaded / 5000));
        
        onProgress?.({
          percent,
          loaded,
          total: total || loaded,
          filename: cleanFilename,
          status: "DOWNLOADING",
        });
      }
    }

    // 2. Combine streamed chunks into Blob
    const contentType = response.headers.get("Content-Type") || "application/pdf";
    const blob = new Blob(chunks, { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);

    // 3. Trigger immediate native browser download
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = cleanFilename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();

    // 4. Send completed progress
    onProgress?.({
      percent: 100,
      loaded,
      total: loaded,
      filename: cleanFilename,
      status: "COMPLETED",
    });

    setTimeout(() => {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 1500);

    onSuccess?.(cleanFilename);
  } catch (error: any) {
    console.warn("Direct stream download error, attempting fallback:", error);
    
    // Fallback: Direct attachment anchor trigger
    try {
      const fallbackUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanFilename)}`;
      const anchor = document.createElement("a");
      anchor.href = fallbackUrl;
      anchor.download = cleanFilename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      
      onProgress?.({
        percent: 100,
        loaded: 0,
        total: 0,
        filename: cleanFilename,
        status: "COMPLETED",
      });
      
      setTimeout(() => document.body.removeChild(anchor), 1000);
      onSuccess?.(cleanFilename);
    } catch (fallbackErr: any) {
      onProgress?.({
        percent: 0,
        loaded: 0,
        total: 0,
        filename: cleanFilename,
        status: "ERROR",
        error: error?.message || "Download failed",
      });
      onError?.(error?.message || "Failed to download document");
    }
  }
}
