import { useState } from 'react';
import { LinkIcon, CheckIcon } from '@heroicons/react/20/solid';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy link', e);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy a shareable link to this poll"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {copied ? (
        <>
          <CheckIcon className="h-4 w-4 text-green-600" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <LinkIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
          Copy link
        </>
      )}
    </button>
  );
}
