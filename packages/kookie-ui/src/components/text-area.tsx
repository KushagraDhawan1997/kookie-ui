import * as React from 'react';
import classNames from 'classnames';

import { textAreaPropDefs } from './text-area.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { mergeStyles } from '../helpers/merge-styles.js';
import { useThemeSizeProps } from '../hooks/theme-size.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type TextAreaElement = React.ElementRef<'textarea'>;
type TextAreaOwnProps = GetPropDefTypes<typeof textAreaPropDefs> & {
  defaultValue?: string;
  value?: string;
};
interface TextAreaProps
  extends ComponentPropsWithout<'textarea', RemovedProps | 'size' | 'value'>,
    TextAreaOwnProps {}

const TextArea = React.forwardRef<TextAreaElement, TextAreaProps>((ownProps, forwardedRef) => {
  // The caller's className and style are kept apart from the size and variant classes: with an
  // error message they go on the wrapper, which is then the one box the parent lays out.
  const { className: ownClassName, style: ownStyle, ...themedProps } = useThemeSizeProps(ownProps, textAreaPropDefs.size);
  const { className, color, radius, style, ...textAreaProps } =
    extractProps(themedProps, textAreaPropDefs);
  const wrapped = Boolean(textAreaProps.errorMessage);

  // Generate unique IDs for accessibility
  const errorId = React.useId();

  const { 'aria-describedby': ariaDescribedby, 'aria-labelledby': ariaLabelledby, 'aria-invalid': ariaInvalid } = textAreaProps;

  // Invalid when `error` is set or the caller passes aria-invalid; the CSS keys on aria-invalid only.
  const isInvalid = Boolean(textAreaProps.error) || ariaInvalid === true || ariaInvalid === 'true';

  // Build aria-describedby string
  const describedBy = React.useMemo(() => {
    const parts = [];
    if (textAreaProps.errorMessage) parts.push(errorId);
    if (ariaDescribedby) parts.push(ariaDescribedby);
    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [textAreaProps.errorMessage, ariaDescribedby, errorId]);

  // Build aria attributes
  const ariaProps = React.useMemo(
    () => ({
      'aria-invalid': isInvalid ? true : ariaInvalid,
      'aria-describedby': describedBy,
      'aria-labelledby': ariaLabelledby,
    }),
    [isInvalid, ariaInvalid, describedBy, ariaLabelledby],
  );

  // Filter out our custom props to avoid DOM warnings
  const {
    error,
    errorMessage,
    required,
    'aria-describedby': _ariaDescribedby,
    'aria-labelledby': _ariaLabelledby,
    ...nativeTextAreaProps
  } = textAreaProps;

  const field = (
    <div
      data-accent-color={color}
      data-radius={radius}
      className={classNames('kui-TextAreaRoot', className, !wrapped && ownClassName, {
        // Not used by the library's CSS (invalid styling keys on aria-invalid); kept as a hook for app styles.
        'kui-error': isInvalid,
      })}
      style={wrapped ? style : mergeStyles(style, ownStyle)}
    >
      <textarea
        className="kui-reset kui-TextAreaInput"
        ref={forwardedRef}
        {...nativeTextAreaProps}
        required={required || undefined}
        {...ariaProps}
      />
    </div>
  );
  if (!wrapped) return field;

  // With a message, one wrapper holds the box and the message below it, so the parent still
  // lays out a single box and the caller's className and style size the pair.
  return (
    <div className={classNames('kui-TextAreaWrapper', ownClassName)} style={ownStyle}>
      {field}
      <div id={errorId} className="kui-TextAreaErrorMessage" role="alert">
        {textAreaProps.errorMessage}
      </div>
    </div>
  );
});

TextArea.displayName = 'TextArea';

export { TextArea };
export type { TextAreaProps };
