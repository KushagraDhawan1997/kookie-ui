import * as React from 'react';

// How many overlays currently use the hook. The listeners are shared: the first mount installs
// them and the last unmount removes them, so closing one overlay never strips the fallback from
// another that is still mounted.
let mountCount = 0;
let teardown: (() => void) | null = null;

const devLog = (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message);
  }
};

function install(): () => void {
  // Deferred cleanups are tracked so teardown can cancel the ones still queued. A timer that
  // outlives the document reaches for `document.body` after it is gone; under jsdom that surfaces
  // as an unhandled ReferenceError attributed to whichever test happened to be running.
  const pending = new Set<ReturnType<typeof setTimeout>>();

  const defer = (fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      pending.delete(id);
      fn();
    }, delay);
    pending.add(id);
  };

  const isStuck = () => document.body.style.pointerEvents === 'none';

  const hasOpenModal = (): boolean => {
    // Open dialogs and alert dialogs
    const hasDialogs = Boolean(
      document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]'),
    );

    // Any Radix overlay that is still mounted. Only overlays count: an open Accordion or
    // Collapsible also carries data-state="open" and must not keep a stuck page blocked.
    const hasRadixOverlays = Boolean(
      document.querySelector(
        '[data-radix-popper-content-wrapper], [role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      ),
    );

    return hasDialogs || hasRadixOverlays;
  };

  // Only clears pointer-events when no modal is open. Scroll-lock attributes belong to
  // react-remove-scroll and are never touched here.
  const safeCleanup = () => {
    if (isStuck() && !hasOpenModal()) {
      devLog('[KookieUI] Cleaning stuck pointer-events: none from body');
      document.body.style.pointerEvents = '';
    }
  };

  // Every trigger queues a check only while the body is actually blocked.
  const scheduleCleanup = (delay: number) => {
    if (isStuck()) defer(safeCleanup, delay);
  };

  const onDocumentClick = (event: Event) => {
    const target = event.target as Element;
    if (target && !target.closest('[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper]')) {
      scheduleCleanup(100);
    }
  };

  const onEscapeKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      scheduleCleanup(200);
    }
  };

  const onInteraction = () => {
    scheduleCleanup(50);
  };

  document.addEventListener('click', onDocumentClick, true);
  document.addEventListener('keydown', onEscapeKey, true);
  document.addEventListener('pointerup', onInteraction, true);
  document.addEventListener('transitionend', onInteraction, true);
  document.addEventListener('animationend', onInteraction, true);

  // Portals mount and unmount as direct children of body, and the stuck value lives in body's
  // style, so body's own children and style are all that need watching.
  const observer = new MutationObserver(() => {
    scheduleCleanup(0);
  });
  observer.observe(document.body, { childList: true, attributes: true, attributeFilter: ['style'] });

  // Fallback periodic cleanup
  const intervalId = setInterval(safeCleanup, 1000);

  // Initial cleanup
  scheduleCleanup(100);

  // Tear everything down together. The observer is the important one: it fires while React
  // unmounts the tree, so leaving it connected keeps queueing work against a document that is
  // about to go away.
  return () => {
    clearInterval(intervalId);

    pending.forEach(clearTimeout);
    pending.clear();

    observer.disconnect();

    document.removeEventListener('click', onDocumentClick, true);
    document.removeEventListener('keydown', onEscapeKey, true);
    document.removeEventListener('pointerup', onInteraction, true);
    document.removeEventListener('transitionend', onInteraction, true);
    document.removeEventListener('animationend', onInteraction, true);
  };
}

/**
 * Hook to cleanup stuck pointer-events: none on document.body
 *
 * This addresses an issue where react-remove-scroll (used by Radix UI Dialog)
 * sometimes fails to restore body pointer-events after dialog closes,
 * leaving the page unclickable. It never clears the value while a modal is open.
 */
export function useBodyPointerEventsCleanup() {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    mountCount += 1;
    if (mountCount === 1) {
      teardown = install();
    }

    return () => {
      mountCount -= 1;
      if (mountCount === 0) {
        teardown?.();
        teardown = null;
      }
    };
  }, []);
}
