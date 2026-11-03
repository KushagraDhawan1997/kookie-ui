import * as React from 'react';
import { Button } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon } from '@hugeicons/core-free-icons';

export default function CopyLinkButton() {
  const [copied, setCopied] = React.useState(false);

  function copy() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      iconOnly
      emphasis="quiet"
      done={copied}
      aria-label={copied ? 'Copied' : 'Copy link'}
      onClick={copy}
    >
      <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
    </Button>
  );
}
