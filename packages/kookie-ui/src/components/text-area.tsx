import * as React from 'react';
import classNames from 'classnames';

import { textAreaPropDefs } from './text-area.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { useThemeSizeProps } from '../helpers/theme-size.js';

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
  const props = useThemeSizeProps(ownProps, textAreaPropDefs.size);
  const { className, color, radius, style, ...textAreaProps } =
    extractProps(props, textAreaPropDefs);

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

  return (
    <div
      data-accent-color={color}
      data-radius={radius}
      className={classNames('kui-TextAreaRoot', className, {
        'kui-error': isInvalid,
      })}
      style={style}
    >
      <textarea
        className="kui-reset kui-TextAreaInput"
        ref={forwardedRef}
        {...nativeTextAreaProps}
        {...ariaProps}
      />
      {textAreaProps.errorMessage && (
        <div id={errorId} className="kui-TextAreaErrorMessage" role="alert">
          {textAreaProps.errorMessage}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export { TextArea };
export type { TextAreaProps };
