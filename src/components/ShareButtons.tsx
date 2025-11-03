import React from "react";
import { Copy, Facebook, Link2, Share2, Twitter } from "lucide-react";
import { useToast } from "../context/ToastContext";

interface ShareButtonsProps {
  url: string;
  title: string;
  text?: string;
  className?: string;
}

const openWindow = (shareUrl: string) => {
  window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
};

const ShareButtons: React.FC<ShareButtonsProps> = ({
  url,
  title,
  text,
  className,
}) => {
  const { showToast } = useToast();

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast({
        title: "Link copied",
        description: "Shareable link saved to your clipboard.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to copy share link", error);
      showToast({
        title: "Copy failed",
        description: "Unable to copy the link. Please try again.",
        variant: "error",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        if (error && (error as Error).name !== "AbortError") {
          console.error("Share failed", error);
          showToast({
            title: "Share failed",
            description: "We could not open the native share sheet.",
            variant: "error",
          });
        }
      }
    } else {
      await copyLinkToClipboard();
    }
  };

  const copyLink = async () => {
    await copyLinkToClipboard();
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || title);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Share2 className="h-4 w-4" /> Share
      </button>
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Copy className="h-4 w-4" /> Copy Link
      </button>
      <button
        onClick={() =>
          openWindow(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
          )
        }
        className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100"
      >
        <Twitter className="h-4 w-4" /> Tweet
      </button>
      <button
        onClick={() =>
          openWindow(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
          )
        }
        className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
      >
        <Facebook className="h-4 w-4" /> Facebook
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Link2 className="h-4 w-4" /> Open
      </a>
    </div>
  );
};

export default ShareButtons;
