import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { imagePropDefs } from './image.props.js';
import { extractProps } from '../helpers/extract-props.js';
import { widthPropDefs } from '../props/width.props.js';
import { heightPropDefs } from '../props/height.props.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { WidthProps } from '../props/width.props.js';
import type { HeightProps } from '../props/height.props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type ImageElement = React.ElementRef<'img'>;
type ImageOwnProps = GetPropDefTypes<typeof imagePropDefs>;
type ImageStatus = 'loading' | 'loaded' | 'error';

interface ImageProps extends ComponentPropsWithout<'img', RemovedProps | 'width' | 'height' | 'src' | 'alt'>, WidthProps, HeightProps, ImageOwnProps {
  src: string;
  /** Required. Pass `""` for a decorative picture. */
  alt: string;
}

/**
 * A plain `<img>` that loads lazily, fills its box by `fit` and takes the theme's corner.
 * One element and no wrapper: `width`, `height`, `className` and `style` all land on the
 * `<img>` itself.
 *
 * Until it loads it rests on a quiet neutral fill, which is also what stays if it fails.
 */
const Image = React.forwardRef<ImageElement, ImageProps>((props, forwardedRef) => {
  const { className, alt, radius, loading = 'lazy', decoding = 'async', onLoad, onError, ...imageProps } = extractProps(props, imagePropDefs, widthPropDefs, heightPropDefs);

  const [status, setStatus] = React.useState<ImageStatus>('loading');
  const ref = React.useRef<HTMLImageElement>(null);

  // A cached image, or one that finished before hydration, never fires onLoad for us.
  useLayoutEffect(() => {
    const img = ref.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    else setStatus('loading');
  }, [props.src]);

  const setRefs = useComposedRefs(ref, forwardedRef);

  return (
    <img
      {...imageProps}
      ref={setRefs}
      alt={alt}
      loading={loading}
      decoding={decoding}
      data-radius={radius}
      data-status={status}
      className={classNames('kui-Image', className)}
      onLoad={(event) => {
        setStatus('loaded');
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus('error');
        onError?.(event);
      }}
    />
  );
});
Image.displayName = 'Image';

export { Image };
export type { ImageProps };
