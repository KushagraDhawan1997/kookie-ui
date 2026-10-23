import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from 'radix-ui/internal';
import { useDropzone } from 'react-dropzone';

import { Button } from './button.js';
import { CloseIcon, FileTextIcon } from './icons.js';
import { Flex } from './flex.js';
import { ScrollArea } from './scroll-area.js';
import { Slot } from './slot.js';
import { NoticeSizeContext } from './notice.js';
import { useThemeSize } from '../helpers/theme-size.js';
import { Spinner } from './spinner.js';
import { Text } from './text.js';
import { VisuallyHidden } from './visually-hidden.js';
import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { accentColors } from '../props/color.prop.js';
import type { radii } from '../props/radius.prop.js';
import type { ButtonProps, ButtonRankProps } from './button.js';

// Avoid SSR warnings by using an isomorphic layout effect
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/**
 * Runs `measure` with the placeholder taken out of layout, so a height read
 * reflects the value alone.
 *
 * A textarea with an empty value lays its placeholder out as real text, so
 * `scrollHeight` reports the placeholder wrapped at whatever width the field
 * has at that instant. That sizes an empty bar to the suggestion showing in it
 * rather than to `minLines`, and when the read lands before the field has its
 * final width -- a panel still animating open, a flex parent whose basis is 0
 * -- it wraps that text at a fraction of the real width and opens the bar at
 * `maxLines`. The first keystroke takes the placeholder out of layout and the
 * height snaps back, which is what made the bug look intermittent rather than
 * simply wrong.
 *
 * The reset to 'auto' and the `scrollHeight` read sit in different functions
 * here, so the whole measurement window is wrapped rather than a single read.
 * Costs one extra style recalc on a path that is already forcing a reflow.
 */
function withoutPlaceholder(el: HTMLTextAreaElement, measure: () => void): void {
  const { placeholder } = el;
  if (!placeholder) {
    measure();
    return;
  }
  el.placeholder = '';
  try {
    measure();
  } finally {
    el.placeholder = placeholder;
  }
}

type ExpandOn = 'none' | 'focus' | 'overflow' | 'both';
type SendMode = 'always' | 'whenDirty' | 'never';

// Attachments
/** Status flag for attachment lifecycle. */
type AttachmentStatus = 'idle' | 'uploading' | 'error' | 'done';
/**
 * Attachment data model used by Chatbar.
 * - `file` exposes the original File object for uploads and processing.
 * - `url` is an object URL used for image previews. Chatbar revokes it when the
 *   attachment is removed; once an attachment is handed to `onSubmit`, the
 *   consumer owns the URL and is responsible for revoking it.
 */
interface ChatbarAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  /** Original File object for uploads and processing */
  file: File;
  url?: string;
  status?: AttachmentStatus;
  progress?: number;
  meta?: Record<string, unknown>;
}

type ChatbarRejectReason = 'type' | 'size' | 'count';
interface ChatbarAttachmentRejection {
  file: File;
  reason: ChatbarRejectReason;
}

interface ChatbarSubmitPayload {
  value: string;
  attachments: ChatbarAttachment[];
}

interface FilePickerOptions {
  accept?: string | string[];
  multiple?: boolean;
}

interface ChatbarContextValue {
  open: boolean;
  setOpen(next: boolean): void;

  setValue(next: string): void;

  size: '1' | '2' | '3';
  expandOn: ExpandOn;
  minLines: number;
  maxLines: number;
  sendMode: SendMode;
  disabled?: boolean;
  readOnly?: boolean;
  paste: boolean;
  clearOnSubmit: boolean;
  multiple: boolean;

  textareaRef: React.RefObject<HTMLTextAreaElement | null>;

  attachments: ChatbarAttachment[];
  removeAttachment(id: string): void;

  /** Validates and submits; returns false when there was nothing to submit */
  submit(clear: boolean): boolean;
  appendFiles(files: File[]): number;
  appendFilesFromPaste(files: File[]): number;
  openFilePicker(options?: FilePickerOptions): void;
  /** Guards blur-collapse between pointerdown on a picker trigger and its click */
  beginFilePickerPress(): void;
}

/** Chatbar's own range; a Theme size of 4 maps to 3. */
const chatbarSizePropDef = { values: ['1', '2', '3'] as const };

const ChatbarContext = React.createContext<ChatbarContextValue | null>(null);
// Value lives in its own context so keystrokes only re-render parts that read it
const ChatbarValueContext = React.createContext<string>('');

const useChatbarContext = () => {
  const ctx = React.useContext(ChatbarContext);
  if (!ctx) throw new Error('Chatbar context not found. Wrap parts in <Chatbar.Root>.');
  return ctx;
};

const toArray = (val: string | string[] | undefined) =>
  Array.isArray(val) ? val : typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : [];

const matchesAccept = (file: File, patterns: string[]) => {
  if (patterns.length === 0) return true;
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  for (const patRaw of patterns) {
    const pat = patRaw.toLowerCase();
    if (pat.includes('/')) {
      const [type, subtype] = pat.split('/');
      const [fmType, fmSubtype] = mime.split('/');
      if (type === '*' || (type === fmType && (subtype === '*' || subtype === fmSubtype))) return true;
    } else if (pat.startsWith('.')) {
      if (name.endsWith(pat)) return true;
    }
  }
  return false;
};

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i;
const isImageLike = (name: string, type: string) => (type || '').toLowerCase().startsWith('image/') || IMAGE_EXT_RE.test(name);

const hasText = (value: string) => value.trim().length > 0;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

let attachmentCounter = 0;
const createAttachmentId = () => `chatbar-attachment-${Date.now()}-${++attachmentCounter}`;

/**
 * Chatbar container and state provider.
 *
 * Value & Open
 * - Supports controlled/uncontrolled `value` and `open`.
 *
 * Attachments
 * - Controlled/uncontrolled attachments with client-side filtering.
 * - Filters by `accept`/`pasteAccept`, `multiple`, `maxAttachments`, and `maxFileSize`.
 * - Rejections are reported via `onAttachmentReject`.
 *
 * Submit
 * - `onSubmit({ value, attachments })` emits both message and attachments.
 * - Submitting requires text or at least one attachment.
 * - `clearOnSubmit` clears message and attachments by default.
 */
interface ChatbarRootBaseProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** When the chatbar expands on its own. `none` leaves open state entirely to the consumer. */
  expandOn?: ExpandOn;

  /** Minimum visible lines when expanded (default: 3). The compact state is always one line. */
  minLines?: number;
  /** Maximum number of lines before scrolling (default: 6) */
  maxLines?: number;

  /** Controls Send button visibility only. Enter-to-submit is controlled by `Textarea submitOnEnter`. */
  sendMode?: SendMode;

  /** Disables text input, submission and every way of adding attachments */
  disabled?: boolean;
  /** Prevents editing, submission and adding attachments */
  readOnly?: boolean;

  /** Combined submit payload */
  onSubmit?: (payload: ChatbarSubmitPayload) => void;

  size?: '1' | '2' | '3';
  variant?: 'raised' | 'surface' | 'outline' | 'ghost' | 'soft';
  /** Accent color for the control (matches TextArea) */
  color?: (typeof accentColors)[number];
  /** Optional radius override (matches TextArea) */
  radius?: (typeof radii)[number];

  width?: React.CSSProperties['width'];
  maxWidth?: React.CSSProperties['maxWidth'];

  // Attachments API
  attachments?: ChatbarAttachment[];
  defaultAttachments?: ChatbarAttachment[];
  onAttachmentsChange?: (attachments: ChatbarAttachment[]) => void;
  accept?: string | string[];
  /** Allow more than one file per pick, paste or drop */
  multiple?: boolean;
  maxAttachments?: number;
  maxFileSize?: number;
  paste?: boolean;
  /** Accepted types for pasted files. Replaces `accept` for paste when set. */
  pasteAccept?: string | string[];
  /** Clear message and attachments after submit */
  clearOnSubmit?: boolean;
  onAttachmentReject?: (rejections: ChatbarAttachmentRejection[]) => void;

  /**
   * Enables drag-and-drop file uploads when true.
   *
   * When enabled:
   * - Files can be dropped anywhere on the chatbar
   * - Same validation rules apply (accept, multiple, maxFileSize, maxAttachments)
   * - Visual feedback shows during drag operations
   * - Rejected files trigger onAttachmentReject
   *
   * @default true
   */
  dropzone?: boolean;

  /**
   * Optional API ref to control Chatbar imperatively without relying on DOM refs.
   * Provides methods to focus the textarea and open the file picker.
   */
  apiRef?: React.Ref<ChatbarApi>;

  /**
   * Messages that need an answer before the next message, such as `Notice` and `Confirmation`.
   * They stack in a column above the chatbar, in the order given, so put the one the next
   * message answers last, nearest the text. They sit outside the box: a button in a notice never
   * submits the message, and pressing one never collapses the chatbar.
   */
  notices?: React.ReactNode;
  /**
   * Short facts that stay true about the conversation, such as the model or the context left.
   * They sit below the chatbar, inset from its sides.
   */
  context?: React.ReactNode;
}

type RootElement = React.ElementRef<'div'>;
/** Imperative API for Chatbar.Root */
export interface ChatbarApi {
  /** Focus the textarea input */
  focusTextarea: () => void;
  /** Open the file picker dialog (respects accept/multiple). No-op when disabled or read-only. */
  openFilePicker: () => void;
}
/**
 * Chatbar container and state provider.
 *
 * Behavior
 * - Supports controlled and uncontrolled `value` and `open` states via props.
 * - Provides context to subcomponents like `Textarea`, `Row`, and `Send`.
 * - Exposes `data-state`, `data-disabled`, and `data-readonly` attributes for styling.
 *
 * Attachments
 * - Paste-to-attach: when `paste` is enabled, pasting files adds attachments.
 * - Additions and rejections are announced through a polite live region.
 *
 * Dropzone
 * - When `dropzone` is true, enables drag-and-drop file uploads.
 * - Visual feedback via `data-drop-active` attribute during drag operations.
 *
 * Accessibility
 * - Consumers should label the `Textarea` via `aria-label`/`aria-labelledby`.
 */
interface RootProps extends ComponentPropsWithout<'div', RemovedProps | 'onSubmit' | 'color'>, ChatbarRootBaseProps {}

const Root = React.forwardRef<RootElement, RootProps>((props, forwardedRef) => {
  const {
    className,
    style,
    children,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    expandOn = 'both',
    minLines = 3,
    maxLines = 6,
    sendMode = 'whenDirty',
    disabled,
    readOnly,
    onSubmit,
    size: sizeProp,
    variant,
    color,
    radius,
    width,
    maxWidth,
    attachments: attachmentsProp,
    defaultAttachments,
    onAttachmentsChange,
    accept,
    multiple = true,
    maxAttachments,
    maxFileSize,
    paste = true,
    pasteAccept,
    clearOnSubmit = true,
    onAttachmentReject,
    dropzone = true,
    apiRef,
    onBlurCapture,
    notices,
    context,
    ...divProps
  } = props;
  const size = useThemeSize(sizeProp, chatbarSizePropDef);

  const isValueControlled = valueProp != null;
  const [valueUncontrolled, setValueUncontrolled] = React.useState<string>(defaultValue);
  const value = isValueControlled ? valueProp : valueUncontrolled;

  const isOpenControlled = openProp != null;
  const [openUncontrolled, setOpenUncontrolled] = React.useState<boolean>(defaultOpen);
  const open = isOpenControlled ? openProp : openUncontrolled;

  // Treat `attachments` as controlled if the prop is provided, even if its value is `undefined`.
  // This avoids switching between controlled and uncontrolled when a consumer sets
  // `attachments={undefined}` to clear attachments. In that case we normalize to an empty array.
  const isAttachmentsControlled = 'attachments' in props;
  const [attachmentsUncontrolled, setAttachmentsUncontrolled] = React.useState<ChatbarAttachment[]>(() => defaultAttachments ?? []);
  const attachments = React.useMemo(
    () => (isAttachmentsControlled ? (attachmentsProp ?? []) : attachmentsUncontrolled),
    [isAttachmentsControlled, attachmentsProp, attachmentsUncontrolled],
  );

  // `id` changes on every announcement so identical messages still update the live region
  const [announcement, setAnnouncementState] = React.useState({ text: '', id: 0 });
  const announce = React.useCallback((text: string) => setAnnouncementState((prev) => ({ text, id: prev.id + 1 })), []);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const composedRootRef = useComposedRefs(forwardedRef, rootRef);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Blur-collapse guards: `pickerOpenRef` is true while the native dialog is open,
  // `pressGuardRef` covers the gap between pointerdown on a trigger and its click
  // (Safari blurs the textarea before the click fires).
  const pickerOpenRef = React.useRef(false);
  const pressGuardRef = React.useRef(false);
  const pressGuardTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pickerRef = React.useRef<{ patterns: string[]; multiple: boolean } | null>(null);

  const acceptKey = toArray(accept).join(',');
  const pasteAcceptKey = toArray(pasteAccept).join(',');
  const accepts = React.useMemo(() => toArray(acceptKey), [acceptKey]);
  const pasteAccepts = React.useMemo(() => (pasteAcceptKey ? toArray(pasteAcceptKey) : accepts), [pasteAcceptKey, accepts]);

  // Latest props/state for stable callbacks. Synced during render (not in an effect) so
  // child layout effects that call setOpen/setValue see this render's handlers.
  const snapshot = {
    value,
    attachments,
    accepts,
    pasteAccepts,
    multiple,
    maxAttachments,
    maxFileSize,
    disabled,
    readOnly,
    expandOn,
    isValueControlled,
    isOpenControlled,
    isAttachmentsControlled,
    onValueChange,
    onOpenChange,
    onAttachmentsChange,
    onAttachmentReject,
    onSubmit,
  };
  const latest = React.useRef(snapshot);
  // eslint-disable-next-line react-hooks/refs -- read only in callbacks/effects; see comment above
  latest.current = snapshot;

  // Attachments set during the current event, before Root re-renders. Cleared at the end
  // of the task so a controlled parent that rejects the change is not overridden.
  const pendingAttachmentsRef = React.useRef<ChatbarAttachment[] | null>(null);
  const getAttachments = React.useCallback(() => pendingAttachmentsRef.current ?? latest.current.attachments, []);

  const setOpen = React.useCallback((next: boolean) => {
    if (!latest.current.isOpenControlled) setOpenUncontrolled(next);
    latest.current.onOpenChange?.(next);
  }, []);

  const setValue = React.useCallback((next: string) => {
    if (!latest.current.isValueControlled) setValueUncontrolled(next);
    latest.current.onValueChange?.(next);
  }, []);

  const setAttachments = React.useCallback((next: ChatbarAttachment[]) => {
    // Back-to-back updates in one event must see each other
    pendingAttachmentsRef.current = next;
    queueMicrotask(() => {
      pendingAttachmentsRef.current = null;
    });
    if (!latest.current.isAttachmentsControlled) setAttachmentsUncontrolled(next);
    latest.current.onAttachmentsChange?.(next);
  }, []);

  // Object URLs Chatbar created and still owns
  const ownedUrlsRef = React.useRef<Set<string>>(new Set());

  const addFiles = React.useCallback(
    (files: File[], patterns: string[], multiple: boolean = latest.current.multiple): number => {
      const cfg = latest.current;
      if (cfg.disabled || cfg.readOnly || files.length === 0) return 0;

      const current = getAttachments();
      const next: ChatbarAttachment[] = [];
      const rejected: ChatbarAttachmentRejection[] = [];
      const remainingSlots = typeof cfg.maxAttachments === 'number' ? Math.max(cfg.maxAttachments - current.length, 0) : Infinity;
      const perActionLimit = multiple ? Infinity : 1;

      for (const file of files) {
        if (next.length >= remainingSlots || next.length >= perActionLimit) {
          rejected.push({ file, reason: 'count' });
          continue;
        }
        if (typeof cfg.maxFileSize === 'number' && file.size > cfg.maxFileSize) {
          rejected.push({ file, reason: 'size' });
          continue;
        }
        if (!matchesAccept(file, patterns)) {
          rejected.push({ file, reason: 'type' });
          continue;
        }
        const url = isImageLike(file.name, file.type) ? URL.createObjectURL(file) : undefined;
        if (url) ownedUrlsRef.current.add(url);
        next.push({ id: createAttachmentId(), name: file.name, size: file.size, type: file.type, file, url, status: 'idle' });
      }

      const messages: string[] = [];
      if (next.length > 0) {
        setAttachments(current.concat(next));
        if (cfg.expandOn !== 'none') setOpen(true);
        messages.push(`${plural(next.length, 'file')} attached.`);
      }
      if (rejected.length > 0) {
        cfg.onAttachmentReject?.(rejected);
        messages.push(`${plural(rejected.length, 'file')} could not be attached.`);
      }
      if (messages.length > 0) announce(messages.join(' '));
      return next.length;
    },
    [getAttachments, setAttachments, setOpen, announce],
  );

  const appendFiles = React.useCallback((files: File[]) => addFiles(files, latest.current.accepts), [addFiles]);
  const appendFilesFromPaste = React.useCallback((files: File[]) => addFiles(files, latest.current.pasteAccepts), [addFiles]);

  const removeAttachment = React.useCallback(
    (id: string) => {
      const current = getAttachments();
      const removed = current.find((a) => a.id === id);
      if (!removed) return;
      setAttachments(current.filter((a) => a.id !== id));
      announce(`Removed ${removed.name}.`);
    },
    [getAttachments, setAttachments, announce],
  );

  const submit = React.useCallback(
    (clear: boolean) => {
      const cfg = latest.current;
      if (cfg.disabled || cfg.readOnly) return false;
      const current = getAttachments();
      if (!hasText(cfg.value) && current.length === 0) return false;
      const payload = { value: cfg.value, attachments: current };
      // Hand preview URLs to the consumer only when they leave the chatbar; URLs still
      // rendered here stay owned so removing them later revokes them
      if (clear && cfg.onSubmit) {
        for (const att of current) if (att.url) ownedUrlsRef.current.delete(att.url);
      }
      cfg.onSubmit?.(payload);
      if (clear) {
        setValue('');
        setAttachments([]);
      }
      return true;
    },
    [getAttachments, setValue, setAttachments],
  );

  // Revoke owned object URLs that are no longer referenced by current attachments
  React.useEffect(() => {
    const owned = ownedUrlsRef.current;
    if (owned.size === 0) return;
    const current = new Set(attachments.map((a) => a.url));
    for (const url of Array.from(owned)) {
      if (!current.has(url)) {
        URL.revokeObjectURL(url);
        owned.delete(url);
      }
    }
  }, [attachments]);

  // On unmount, revoke URLs only when Chatbar owns the attachment list;
  // controlled attachments may still be rendered by the parent.
  React.useEffect(() => {
    const owned = ownedUrlsRef.current;
    return () => {
      if (latest.current.isAttachmentsControlled) return;
      for (const url of Array.from(owned)) URL.revokeObjectURL(url);
      owned.clear();
    };
  }, []);

  const openFilePicker = React.useCallback((options?: FilePickerOptions) => {
    const cfg = latest.current;
    const input = fileInputRef.current;
    // The picker guard takes over from the press guard
    clearTimeout(pressGuardTimerRef.current);
    pressGuardRef.current = false;
    if (!input || cfg.disabled || cfg.readOnly) return;
    const patterns = options?.accept != null ? toArray(options.accept) : cfg.accepts;
    const multiple = options?.multiple ?? cfg.multiple;
    pickerRef.current = { patterns, multiple };
    input.accept = patterns.join(',');
    input.multiple = multiple;
    pickerOpenRef.current = true;
    input.click();
    // Browsers block the dialog outside a user gesture; if the window kept focus,
    // no dialog opened and no focus/cancel/change event will clear the guard
    setTimeout(() => {
      if (document.hasFocus()) pickerOpenRef.current = false;
    }, 1000);
  }, []);

  const beginFilePickerPress = React.useCallback(() => {
    // On touch (notably iOS), the compatibility mousedown, blur and click arrive in later
    // tasks than pointerup, so hold the guard until the click or a timeout
    pressGuardRef.current = true;
    clearTimeout(pressGuardTimerRef.current);
    pressGuardTimerRef.current = setTimeout(() => {
      pressGuardRef.current = false;
    }, 800);
  }, []);

  React.useEffect(() => () => clearTimeout(pressGuardTimerRef.current), []);

  // Clear the picker guard when the dialog closes, whichever way it closes
  React.useEffect(() => {
    const input = fileInputRef.current;
    const reset = () => {
      pickerOpenRef.current = false;
    };
    window.addEventListener('focus', reset);
    input?.addEventListener('cancel', reset);
    return () => {
      window.removeEventListener('focus', reset);
      input?.removeEventListener('cancel', reset);
    };
  }, []);

  const handleFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      const files = Array.from(input.files ?? []);
      const picker = pickerRef.current;
      addFiles(files, picker?.patterns ?? latest.current.accepts, picker?.multiple);
      pickerOpenRef.current = false;
      pickerRef.current = null;
      // Reset so selecting the same file again still fires change
      input.value = '';
    },
    [addFiles],
  );

  const handleBlurCapture = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      onBlurCapture?.(event);
      const cfg = latest.current;
      const rootEl = rootRef.current;
      if (!rootEl || cfg.expandOn === 'none') return;
      const nextTarget = event.relatedTarget as Node | null;
      if (nextTarget && rootEl.contains(nextTarget)) return;
      if (pickerOpenRef.current || pressGuardRef.current) return;
      if (!hasText(cfg.value) && getAttachments().length === 0) setOpen(false);
    },
    [onBlurCapture, setOpen, getAttachments],
  );

  const handleDrop = React.useCallback((files: File[]) => {
    appendFiles(files);
  }, [appendFiles]);

  // Validation happens in addFiles so drop, paste and picker share one rule set
  const { getRootProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    // Drop any earlier message so it is not re-announced when the drag hint goes away
    onDragEnter: () => announce(''),
    noClick: true,
    noKeyboard: true,
    // Textarea handles paste itself; letting the dropzone see it attaches twice
    noPaste: true,
    disabled: !dropzone || disabled || readOnly,
  });
  const dragActive = dropzone && isDragActive;

  React.useImperativeHandle(
    apiRef,
    () => ({
      focusTextarea: () => textareaRef.current?.focus({ preventScroll: true }),
      openFilePicker: () => openFilePicker(),
    }),
    [openFilePicker],
  );

  // Click-to-focus: focus textarea when clicking non-interactive areas inside the container
  const handleContainerPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (disabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const target = event.target;
      if (target instanceof Element && target.closest('button, [role="button"], a[href], input, textarea, select, [contenteditable], [tabindex]:not([tabindex="-1"])')) return;
      event.preventDefault();
      textareaRef.current?.focus({ preventScroll: true });
    },
    [disabled],
  );

  const contextValue = React.useMemo<ChatbarContextValue>(
    () => ({
      open,
      setOpen,
      setValue,
      size,
      expandOn,
      minLines,
      maxLines,
      sendMode,
      disabled,
      readOnly,
      paste,
      clearOnSubmit,
      multiple,
      textareaRef,
      attachments,
      removeAttachment,
      submit,
      appendFiles,
      appendFilesFromPaste,
      openFilePicker,
      beginFilePickerPress,
    }),
    [
      open, setOpen, setValue, size, expandOn, minLines, maxLines, sendMode, disabled, readOnly, paste,
      clearOnSubmit, multiple, attachments, removeAttachment, submit, appendFiles, appendFilesFromPaste,
      openFilePicker, beginFilePickerPress,
    ],
  );

  return (
    <ChatbarContext.Provider value={contextValue}>
      <ChatbarValueContext.Provider value={value}>
        <>
            <div
              {...divProps}
              ref={composedRootRef}
              className={classNames('rt-ChatbarRoot', `rt-r-size-${size}`, className)}
              style={{ position: 'relative', width, maxWidth, ...style }}
              data-state={open ? 'open' : 'closed'}
              data-disabled={disabled ? '' : undefined}
              data-readonly={readOnly ? '' : undefined}
              data-drop-active={dragActive ? '' : undefined}
              data-accent-color={color}
              data-radius={radius}
              onBlurCapture={handleBlurCapture}
            >
              <input
                ref={fileInputRef}
                type="file"
                tabIndex={-1}
                aria-hidden
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              {notices ? (
                <div className="rt-ChatbarNotices">
                  <NoticeSizeContext.Provider value={size}>{notices}</NoticeSizeContext.Provider>
                </div>
              ) : null}
              <div {...(dropzone ? getRootProps() : {})} style={{ width: '100%', flex: '1 1 auto', minHeight: 0 }} onPointerDown={handleContainerPointerDown}>
                <div
                  className={classNames('rt-ChatbarBox', `rt-variant-${variant ?? 'raised'}`)}
                  style={{ position: 'relative' }}
                  data-accent-color={color}
                  data-radius={radius}
                >
                  <div className="rt-ChatbarGrid">
                    {children}
                  </div>
                  {dragActive && (
                    <div className="rt-ChatbarDropOverlay" aria-hidden>
                      <div className="rt-ChatbarDropContent">
                        <Text emphasis="medium" size={size} weight="medium">
                          Drop files here to attach
                        </Text>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {context ? (
                <Text as="div" size={size === '3' ? '2' : '1'} emphasis="medium" className="rt-ChatbarContext">
                  {context}
                </Text>
              ) : null}
              <VisuallyHidden role="status" aria-live="polite">
                {dragActive ? 'Drop files here to attach.' : <span key={announcement.id}>{announcement.text}</span>}
              </VisuallyHidden>
            </div>
        </>
      </ChatbarValueContext.Provider>
    </ChatbarContext.Provider>
  );
});
Root.displayName = 'Chatbar.Root';

/**
 * Multi-line text input for Chatbar.
 * - Uses onChange to control value and avoid duplicate updates.
 * - Auto-resizes between minLines and maxLines.
 * - Expands on focus/overflow per `expandOn`.
 * - Paste-to-attach: when `paste` is enabled on Root, pasting files adds attachments.
 * - Provide `aria-label` or `aria-labelledby` for an accessible name.
 */
interface TextareaProps extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'size' | 'rows' | 'value' | 'defaultValue'> {
  asChild?: boolean;
  /**
   * When true, pressing Enter submits (Shift+Enter inserts a newline).
   * Works with every `sendMode`. Defaults to false.
   */
  submitOnEnter?: boolean;
}

/**
 * Chatbar multi-line text input.
 *
 * Behavior
 * - Controls the Chatbar value via React onChange.
 * - Auto-resizes between minLines and maxLines in a single layout effect, which
 *   also opens the Chatbar when content overflows the compact height and
 *   `expandOn` is `overflow` or `both`.
 * - Consumer handlers run first; calling `preventDefault` in `onKeyDown` or
 *   `onPaste` skips the built-in submit or attach behavior.
 *
 * Accessibility
 * - Consumers should provide labeling via aria-label or aria-labelledby
 *   on this component, as no implicit label is rendered.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((props, forwardedRef) => {
  const {
    className,
    style,
    asChild,
    onFocus,
    onChange,
    onPaste,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    submitOnEnter = false,
    ...textareaProps
  } = props;
  const ctx = useChatbarContext();
  const value = React.useContext(ChatbarValueContext);
  const { open, minLines, maxLines, expandOn, disabled, readOnly, setOpen, setValue, textareaRef, paste, appendFilesFromPaste, size, submit, clearOnSubmit } = ctx;
  const composedRef = useComposedRefs(forwardedRef, textareaRef);

  // Cached metrics to avoid repeated getComputedStyle calls
  const lineHeightRef = React.useRef(0);
  const paddingRef = React.useRef(0);
  const composingRef = React.useRef(false);

  const sizingRef = React.useRef({ open, minLines, maxLines });
  // Declared before the sizing effect so it runs first in the same commit
  useIsomorphicLayoutEffect(() => {
    sizingRef.current = { open, minLines, maxLines };
  }, [open, minLines, maxLines]);

  const recomputeMetrics = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const computedStyle = window.getComputedStyle(el);
    lineHeightRef.current = parseFloat(computedStyle.lineHeight) || 20;
    paddingRef.current = (parseFloat(computedStyle.paddingTop) || 0) + (parseFloat(computedStyle.paddingBottom) || 0);
  }, [textareaRef]);

  // Sizes `el` for the given open state; caller must have set height to 'auto' first
  const applyHeight = React.useCallback((el: HTMLTextAreaElement, isOpen: boolean) => {
    const { minLines: min, maxLines: max } = sizingRef.current;
    const lineHeight = lineHeightRef.current;
    const padding = paddingRef.current;
    const minHeight = Math.ceil((isOpen ? min : 1) * lineHeight) + padding;
    const maxHeight = Math.ceil((isOpen ? max : 1) * lineHeight) + padding;
    const contentHeight = Math.max(el.scrollHeight, minHeight);
    el.style.height = `${Math.min(contentHeight, maxHeight)}px`;
    const overflowing = contentHeight > maxHeight;
    el.style.overflowY = overflowing ? 'auto' : 'hidden';
    el.style.maxHeight = overflowing ? `${maxHeight}px` : 'none';
  }, []);

  // Typography depends on size
  useIsomorphicLayoutEffect(() => {
    recomputeMetrics();
  }, [recomputeMetrics, size]);

  // Single place for sizing and overflow auto-open: one height reset, one scrollHeight read
  useIsomorphicLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (lineHeightRef.current === 0) recomputeMetrics();
    withoutPlaceholder(el, () => {
      el.style.height = 'auto';
      let isOpen = open;
      if (!open && (expandOn === 'overflow' || expandOn === 'both')) {
        const compactHeight = Math.ceil(lineHeightRef.current) + paddingRef.current;
        if (el.scrollHeight > compactHeight + 1) {
          isOpen = true;
          setOpen(true);
        }
      }
      applyHeight(el, isOpen);
    });
  }, [value, open, expandOn, minLines, maxLines, size, setOpen, textareaRef, recomputeMetrics, applyHeight]);

  // Width changes re-wrap text; re-measure only when the width actually changes
  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let prevWidth = -1;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width === prevWidth) return;
      const first = prevWidth === -1;
      prevWidth = width;
      if (first) return;
      recomputeMetrics();
      withoutPlaceholder(el, () => {
        el.style.height = 'auto';
        applyHeight(el, sizingRef.current.open);
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [textareaRef, recomputeMetrics, applyHeight]);

  // Dev-only warning if no accessible name is provided
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const hasLabel = textareaProps['aria-label'] != null || textareaProps['aria-labelledby'] != null;
    if (!hasLabel) {
      console.warn('[Chatbar.Textarea] Provide aria-label or aria-labelledby to ensure the control has an accessible name.');
    }
    // warn only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFocus = React.useCallback<React.FocusEventHandler<HTMLTextAreaElement>>(
    (event) => {
      onFocus?.(event);
      if (disabled || readOnly) return;
      if ((expandOn === 'focus' || expandOn === 'both') && !open) setOpen(true);
    },
    [disabled, readOnly, expandOn, open, setOpen, onFocus],
  );

  const handleChange = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (event) => {
      setValue(event.currentTarget.value);
      onChange?.(event);
    },
    [setValue, onChange],
  );

  const handlePaste = React.useCallback<React.ClipboardEventHandler<HTMLTextAreaElement>>(
    (event) => {
      onPaste?.(event);
      if (event.defaultPrevented || !paste || disabled || readOnly) return;
      const files = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.kind === 'file')
        .map((item) => item.getAsFile())
        .filter((f): f is File => !!f);
      if (files.length === 0) return;
      // Suppress the filename/text representation only when a file was actually attached
      if (appendFilesFromPaste(files) > 0) event.preventDefault();
    },
    [paste, disabled, readOnly, onPaste, appendFilesFromPaste],
  );

  const handleCompositionStart = React.useCallback<React.CompositionEventHandler<HTMLTextAreaElement>>(
    (event) => {
      composingRef.current = true;
      onCompositionStart?.(event);
    },
    [onCompositionStart],
  );

  const handleCompositionEnd = React.useCallback<React.CompositionEventHandler<HTMLTextAreaElement>>(
    (event) => {
      composingRef.current = false;
      onCompositionEnd?.(event);
    },
    [onCompositionEnd],
  );

  const handleKeyDown = React.useCallback<React.KeyboardEventHandler<HTMLTextAreaElement>>(
    (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !submitOnEnter) return;
      if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
      // Safari fires the IME-confirming Enter after compositionend with keyCode 229
      if (composingRef.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
      // Plain Enter never inserts a newline when submitOnEnter is on, even with nothing to send
      event.preventDefault();
      submit(clearOnSubmit);
    },
    [submitOnEnter, onKeyDown, submit, clearOnSubmit],
  );

  const Comp = asChild ? Slot : 'textarea';
  return (
    <div className={classNames('rt-ChatbarField', 'rt-ChatbarTextarea', className)}>
      <Comp
        {...textareaProps}
        ref={composedRef}
        className="rt-ChatbarInput"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        disabled={disabled}
        readOnly={readOnly}
        rows={open ? minLines : 1}
        spellCheck={textareaProps.spellCheck ?? true}
        autoCorrect={textareaProps.autoCorrect ?? 'on'}
        style={style}
      />
    </div>
  );
});
Textarea.displayName = 'Chatbar.Textarea';

interface InlineSlotProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const InlineStart = React.forwardRef<HTMLDivElement, InlineSlotProps>((props, forwardedRef) => {
  const { children, asChild, className, ...divProps } = props;
  const ctx = useChatbarContext();
  if (ctx.open) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...divProps} ref={forwardedRef} className={classNames('rt-ChatbarInlineStart', className)}>
      {children}
    </Comp>
  );
});
InlineStart.displayName = 'Chatbar.InlineStart';

const InlineEnd = React.forwardRef<HTMLDivElement, InlineSlotProps>((props, forwardedRef) => {
  const { children, asChild, className, ...divProps } = props;
  const ctx = useChatbarContext();
  if (ctx.open) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp {...divProps} ref={forwardedRef} className={classNames('rt-ChatbarInlineEnd', className)}>
      {children}
    </Comp>
  );
});
InlineEnd.displayName = 'Chatbar.InlineEnd';

/**
 * Renders a horizontally scrollable list of attachments above the inline row.
 * Hidden when empty unless `forceMount`. Override per-item with `renderAttachment`.
 * `Chatbar.Item`s passed as children follow the attachments in the same row.
 */
interface AttachmentsRowProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  asChild?: boolean;
  forceMount?: boolean;
  /** If provided, custom-render a tile; otherwise default tile is used */
  renderAttachment?: (attachment: ChatbarAttachment) => React.ReactNode;
  /** `Chatbar.Item`s: things the message refers to that are not files. */
  children?: React.ReactNode;
}

const AttachmentsRow = React.forwardRef<HTMLDivElement, AttachmentsRowProps>((props, forwardedRef) => {
  const { asChild, forceMount, renderAttachment, className, children, ...divProps } = props;
  const ctx = useChatbarContext();
  const hasItems = React.Children.toArray(children).length > 0;
  if (ctx.attachments.length === 0 && !hasItems && !forceMount) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <div>
      <Comp {...divProps} ref={forwardedRef} className={classNames('rt-ChatbarAttachmentsRow', className)} role="list" aria-label={divProps['aria-label'] ?? 'Attachments'}>
        <ScrollArea className="rt-ChatbarScrollArea" scrollbars="horizontal">
          <Flex align="center" gap="3" minWidth="fit-content">
            {ctx.attachments.map((att) => (
              <Attachment key={att.id} attachment={att} asChild={!!renderAttachment}>
                {renderAttachment?.(att)}
              </Attachment>
            ))}
            {children}
          </Flex>
        </ScrollArea>
      </Comp>
    </div>
  );
});
AttachmentsRow.displayName = 'Chatbar.AttachmentsRow';

/**
 * Moves focus off a pill that is about to unmount, to the next pill's remove
 * button, the previous one's, or the text, so keyboard users are not dropped
 * to <body>.
 */
function moveFocusOffPill(button: HTMLButtonElement, textareaRef: React.RefObject<HTMLTextAreaElement | null>) {
  const pill = button.closest('[role="listitem"]');
  const pills = pill?.parentElement ? Array.from(pill.parentElement.children) : [];
  const index = pill ? pills.indexOf(pill) : -1;
  const neighbour = pills[index + 1] ?? pills[index - 1];
  const nextButton = neighbour?.querySelector<HTMLButtonElement>('.rt-ChatbarItemRemove');
  if (nextButton) nextButton.focus();
  else textareaRef.current?.focus({ preventScroll: true });
}

/** The pill an attachment and an item share: a lead tile, a label and ×. */
const Pill: React.FC<{
  lead: React.ReactNode;
  leadKind: 'image' | 'icon';
  label: React.ReactNode;
  /** Read after the label by screen readers only, e.g. a file's size. */
  detail?: string;
  removeLabel: string;
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ lead, leadKind, label, detail, removeLabel, onRemove }) => {
  const ctx = useChatbarContext();
  return (
    <>
      <span className="rt-ChatbarItemLead" data-kind={leadKind} aria-hidden>
        {lead}
      </span>
      <Text className="rt-ChatbarItemLabel" size={ctx.size} truncate>
        {label}
        {detail ? <VisuallyHidden>, {detail}</VisuallyHidden> : null}
      </Text>
      {onRemove && (
        <Button iconOnly className="rt-ChatbarItemRemove" aria-label={removeLabel} size="1" variant="ghost" color="gray" onClick={onRemove}>
          <CloseIcon />
        </Button>
      )}
    </>
  );
};

/** Default tile renderer for a single attachment. */
interface AttachmentProps extends React.ComponentPropsWithoutRef<'div'> {
  attachment: ChatbarAttachment;
  asChild?: boolean;
}

const STATUS_LABEL: Partial<Record<AttachmentStatus, string>> = { uploading: 'uploading', error: 'failed to upload' };

const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>((props, forwardedRef) => {
  const { attachment, asChild, className, children, ...divProps } = props;
  const ctx = useChatbarContext();
  const Comp = asChild ? Slot : 'div';
  const isImage = !!attachment.url && isImageLike(attachment.name, attachment.type);
  const sizeLabel = `${Math.ceil(attachment.size / 1024)} KB`;
  const statusLabel = attachment.status ? STATUS_LABEL[attachment.status] : undefined;
  const locked = ctx.disabled || ctx.readOnly;

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    moveFocusOffPill(event.currentTarget, ctx.textareaRef);
    ctx.removeAttachment(attachment.id);
  };

  const lead =
    attachment.status === 'uploading' ? (
      <Spinner />
    ) : isImage ? (
      <img className="rt-ChatbarAttachmentImage" src={attachment.url} alt="" />
    ) : (
      <FileTextIcon />
    );

  return (
    <Comp
      {...divProps}
      ref={forwardedRef}
      className={classNames(children ? 'rt-ChatbarAttachment' : 'rt-ChatbarAttachment rt-ChatbarItem', className)}
      role="listitem"
      data-kind={isImage ? 'image' : 'file'}
      data-status={attachment.status}
      title={attachment.name}
    >
      {children ?? (
        <Pill
          lead={lead}
          leadKind={isImage && attachment.status !== 'uploading' ? 'image' : 'icon'}
          label={attachment.name}
          detail={statusLabel ? `${sizeLabel}, ${statusLabel}` : sizeLabel}
          removeLabel={`Remove ${attachment.name}`}
          onRemove={locked ? undefined : handleRemove}
        />
      )}
    </Comp>
  );
});
Attachment.displayName = 'Chatbar.Attachment';

/**
 * Something the message refers to that is not a file: a scene object, a
 * picked mode, a selection. The same pill as an attachment, placed in
 * `Chatbar.AttachmentsRow` as a child. The app owns the list, so removing one
 * calls `onRemove` and nothing else; leave it out for a pill that cannot be
 * removed.
 */
interface ItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children' | 'color'> {
  /** The label. Also names the remove button: "Remove {label}". */
  children: string;
  /** Drawn in the lead tile, tinted with `color`. */
  icon?: React.ReactNode;
  /** A thumbnail for the lead tile, in place of the icon. */
  image?: string;
  /** Tint of the icon tile. Defaults to gray. */
  color?: (typeof accentColors)[number];
  onRemove?: () => void;
  /** Overrides the remove button's label. */
  removeLabel?: string;
}

const Item = React.forwardRef<HTMLDivElement, ItemProps>((props, forwardedRef) => {
  const { children, icon, image, color, onRemove, removeLabel, className, ...divProps } = props;
  const ctx = useChatbarContext();
  const locked = ctx.disabled || ctx.readOnly;

  const handleRemove = onRemove
    ? (event: React.MouseEvent<HTMLButtonElement>) => {
        moveFocusOffPill(event.currentTarget, ctx.textareaRef);
        onRemove();
      }
    : undefined;

  return (
    <div
      {...divProps}
      ref={forwardedRef}
      className={classNames('rt-ChatbarItem', className)}
      role="listitem"
      data-accent-color={image ? undefined : (color ?? 'gray')}
      title={children}
    >
      <Pill
        lead={image ? <img className="rt-ChatbarAttachmentImage" src={image} alt="" /> : icon}
        leadKind={image ? 'image' : 'icon'}
        label={children}
        removeLabel={removeLabel ?? `Remove ${children}`}
        onRemove={locked ? undefined : handleRemove}
      />
    </div>
  );
});
Item.displayName = 'Chatbar.Item';

interface AttachTriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  /** Overrides Root `accept` for files chosen through this trigger */
  accept?: string | string[];
  multiple?: boolean;
}

const AttachTrigger = React.forwardRef<HTMLButtonElement, AttachTriggerProps>((props, forwardedRef) => {
  const { asChild, accept, multiple, disabled: disabledProp, onPointerDown, onClick, ...buttonProps } = props;
  const ctx = useChatbarContext();
  const disabled = disabledProp || ctx.disabled || ctx.readOnly;
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      {...buttonProps}
      ref={forwardedRef}
      className={classNames('rt-ChatbarAttachTrigger', buttonProps.className)}
      type={buttonProps.type ?? 'button'}
      aria-label={buttonProps['aria-label'] ?? 'Add attachments'}
      disabled={disabled}
      onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        if (!disabled && !event.defaultPrevented) ctx.beginFilePickerPress();
      }}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (disabled || event.defaultPrevented) return;
        ctx.openFilePicker({ accept, multiple });
      }}
    />
  );
});
AttachTrigger.displayName = 'Chatbar.AttachTrigger';

interface RowProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const Row = React.forwardRef<HTMLDivElement, RowProps>((props, forwardedRef) => {
  const { asChild, children, className, ...divProps } = props;
  const ctx = useChatbarContext();
  if (!ctx.open) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <div>
      <Comp {...divProps} ref={forwardedRef} className={classNames('rt-ChatbarRow', className)}>
        <Flex align="center" justify="between" width="100%">
          {children}
        </Flex>
      </Comp>
    </div>
  );
});
Row.displayName = 'Chatbar.Row';

type RowSlotProps = React.ComponentPropsWithoutRef<'div'>;

const RowStart = React.forwardRef<HTMLDivElement, RowSlotProps>((props, forwardedRef) => {
  const { className, ...divProps } = props;
  return <div {...divProps} ref={forwardedRef} className={classNames('rt-ChatbarRowStart', className)} />;
});
RowStart.displayName = 'Chatbar.RowStart';

const RowEnd = React.forwardRef<HTMLDivElement, RowSlotProps>((props, forwardedRef) => {
  const { className, ...divProps } = props;
  return <div {...divProps} ref={forwardedRef} className={classNames('rt-ChatbarRowEnd', className)} />;
});
RowEnd.displayName = 'Chatbar.RowEnd';

type SendStatus = 'ready' | 'submitted' | 'streaming' | 'error';

type SendProps = Omit<ButtonProps, 'aria-label' | 'aria-labelledby' | 'variant' | 'emphasis' | 'iconOnly' | 'fullWidth'> &
  ButtonRankProps & {
  /** Optional override for accessible name. Defaults to "Send". */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  asChild?: boolean;
  /** Clear message and attachments after sending. Defaults to Root `clearOnSubmit`. */
  clearOnSend?: boolean;
  /**
   * What the button means. `ready` sends. While a reply is `submitted` or `streaming` and the
   * box is empty, the button STOPS the reply (`onStop`); with a draft in the box it still sends,
   * and the app decides whether sending interrupts the reply. After an `error`, an empty box
   * makes it RETRY (`onRetry`). Default `ready`.
   */
  status?: SendStatus;
  /** Called when the button is pressed to stop a reply. */
  onStop?: () => void;
  /** Called when the button is pressed to retry after an error. */
  onRetry?: () => void;
  /** Accessible name while it stops. Default "Stop". */
  stopLabel?: string;
  /** Accessible name while it retries. Default "Retry". */
  retryLabel?: string;
  /** Glyph while it stops. Defaults to a square, or a spinner while `submitted`. */
  stopIcon?: React.ReactNode;
  /** Glyph while it retries. */
  retryIcon?: React.ReactNode;
};

const Send = React.forwardRef<HTMLButtonElement, SendProps>((props, forwardedRef) => {
  const {
    asChild,
    clearOnSend,
    disabled,
    children,
    style,
    className,
    size: sizeProp,
    variant: variantProp, emphasis,
    tabIndex,
    onClick,
    status = 'ready',
    onStop,
    onRetry,
    stopLabel = 'Stop',
    retryLabel = 'Retry',
    stopIcon,
    retryIcon,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...buttonProps
  } = props;
  const ctx = useChatbarContext();
  const value = React.useContext(ChatbarValueContext);

  const hasContent = hasText(value) || ctx.attachments.length > 0;
  const running = status === 'submitted' || status === 'streaming';
  const mode: 'send' | 'stop' | 'retry' = hasContent ? 'send' : running ? 'stop' : status === 'error' ? 'retry' : 'send';

  if (ctx.sendMode === 'never' && mode === 'send') return null;

  const visible = mode !== 'send' || ctx.sendMode === 'always' || hasContent;
  const inactive = mode === 'send' ? disabled || ctx.disabled || ctx.readOnly || !hasContent : disabled || ctx.disabled;

  const sendName = ariaLabel ?? 'Send';
  const labelProps: { 'aria-label': string } | { 'aria-labelledby': string } =
    mode === 'stop' ? { 'aria-label': stopLabel } : mode === 'retry' ? { 'aria-label': retryLabel } : ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : { 'aria-label': sendName };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || inactive) return;
    if (mode === 'stop') {
      onStop?.();
      return;
    }
    if (mode === 'retry') {
      onRetry?.();
      return;
    }
    const clear = clearOnSend ?? ctx.clearOnSubmit;
    // Clearing hides and disables this button; keep keyboard focus in the composer
    if (ctx.submit(clear) && clear) ctx.textareaRef.current?.focus({ preventScroll: true });
  };

  const glyph =
    mode === 'stop' ? (
      stopIcon ?? (status === 'submitted' ? <Spinner /> : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <rect x="7" y="7" width="10" height="10" rx="2" />
        </svg>
      ))
    ) : mode === 'retry' ? (
      retryIcon ?? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      )
    ) : (
      children ?? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      )
    );

  return (
    <Button
      iconOnly
      {...buttonProps}
      ref={forwardedRef}
      size={sizeProp ?? ctx.size}
      {...(emphasis ? { emphasis } : { variant: variantProp ?? (ctx.open || mode !== 'send' ? 'solid' : 'ghost') })}
      disabled={inactive}
      className={classNames('rt-ChatbarSend', className)}
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? undefined : 'none', ...style }}
      // Hidden Send must not be reachable by keyboard or announced
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? tabIndex : -1}
      asChild={asChild}
      onClick={handleClick}
      data-status={status}
      data-mode={mode}
      {...labelProps}
    >
      {glyph}
    </Button>
  );
});
Send.displayName = 'Chatbar.Send';

export { Root, Textarea, InlineStart, InlineEnd, AttachmentsRow, Attachment, Item, AttachTrigger, Row, RowStart, RowEnd, Send };
export type {
  RootProps as ChatbarRootProps,
  TextareaProps as ChatbarTextareaProps,
  InlineSlotProps as ChatbarInlineSlotProps,
  AttachmentsRowProps as ChatbarAttachmentsRowProps,
  AttachmentProps as ChatbarAttachmentProps,
  ItemProps as ChatbarItemProps,
  AttachTriggerProps as ChatbarAttachTriggerProps,
  RowProps as ChatbarRowProps,
  RowSlotProps as ChatbarRowSlotProps,
  SendProps as ChatbarSendProps,
  ChatbarAttachment,
  ChatbarAttachmentRejection,
  ChatbarRejectReason,
  ChatbarSubmitPayload,
  AttachmentStatus as ChatbarAttachmentStatus,
  ExpandOn as ChatbarExpandOn,
  SendMode as ChatbarSendMode,
  SendStatus as ChatbarSendStatus,
};
