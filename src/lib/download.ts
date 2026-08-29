/**
 * Universal client-side file downloader.
 * Triggers a direct device file download without opening external Cloudinary tabs.
 */
export async function downloadFileToDevice({
  url,
  filename,
  onStart,
  onSuccess,
  onError,
}: {
  url: string;
  filename: string;
  onStart?: (filename: string) => void;
  onSuccess?: (filename: string) => void;
  onError?: (errorMsg: string) => void;
}) {
  if (!url) {
    onError?.("No file URL available for download");
    return;
  }

  // Ensure file has an extension
  const safeFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  const cleanFilename = safeFilename.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

  onStart?.(cleanFilename);

  try {
    // 1. Request file via proxy route which returns binary with Content-Disposition: attachment
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanFilename)}`;
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    // 2. Create invisible anchor tag to trigger native download
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = cleanFilename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();

    // 3. Clean up object URL after a brief delay
    setTimeout(() => {
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 1500);

    onSuccess?.(cleanFilename);
  } catch (error: any) {
    console.warn("Proxy blob download failed, attempting direct link fallback:", error);

    // Fallback: Use direct browser navigation to attachment proxy
    try {
      const fallbackUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanFilename)}`;
      const anchor = document.createElement("a");
      anchor.href = fallbackUrl;
      anchor.download = cleanFilename;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => document.body.removeChild(anchor), 1000);
      onSuccess?.(cleanFilename);
    } catch (fallbackError: any) {
      onError?.(fallbackError?.message || "Failed to download document");
    }
  }
}
