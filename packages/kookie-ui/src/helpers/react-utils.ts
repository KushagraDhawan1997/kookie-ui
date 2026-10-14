import * as React from 'react';

/**
 * Local copies of the small React utilities previously imported from
 * `radix-ui/internal`. Behaviour matches the Radix versions so swapping them
 * in is not a visible change.
 */

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    return ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

/** Combines several refs into one callback ref. Supports React 19 ref cleanups. */
export function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === 'function') {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === 'function') {
            cleanup();
          } else {
            setRef(refs[i], null as T);
          }
        }
      };
    }
  };
}

/** `composeRefs`, memoised on the refs themselves. */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // The refs are the dependencies: a new ref re-attaches, like Radix.
  // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs);
}

/**
 * Calls the consumer's handler first, then ours unless the consumer called
 * `event.preventDefault()`.
 */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {},
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

/** `useLayoutEffect` that does not warn during server rendering. */
export const useLayoutEffect: typeof React.useLayoutEffect =
  typeof document !== 'undefined' ? React.useLayoutEffect : () => {};

/** A stable function that always calls the latest `callback`. */
export function useCallbackRef<T extends (...args: any[]) => any>(callback: T | undefined): T {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  });

  return React.useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}

// React 17 has no `useInsertionEffect`; fall back like Radix does.
const useInsertionEffect: typeof React.useLayoutEffect =
  (React as { useInsertionEffect?: typeof React.useLayoutEffect }).useInsertionEffect ?? useLayoutEffect;

type SetStateFn<T> = (prevState?: T) => T;

interface UseControllableStateParams<T> {
  prop?: T | undefined;
  defaultProp: T;
  onChange?: (state: T) => void;
  caller?: string;
}

/**
 * State that is controlled when `prop` is defined and uncontrolled otherwise.
 * `onChange` fires when the value changes, in either mode.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange = () => {},
  caller,
}: UseControllableStateParams<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange,
  });
  const isControlled = prop !== undefined;
  const value = isControlled ? prop : uncontrolledProp;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isControlledRef = React.useRef(prop !== undefined);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? 'controlled' : 'uncontrolled';
        const to = isControlled ? 'controlled' : 'uncontrolled';
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`,
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }

  const setValue = React.useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (nextValue) => {
      if (isControlled) {
        const value = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value !== prop) {
          onChangeRef.current?.(value);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, onChangeRef],
  );

  return [value, setValue];
}

function useUncontrolledState<T>({
  defaultProp,
  onChange,
}: Omit<UseControllableStateParams<T>, 'prop'>): [
  T,
  React.Dispatch<React.SetStateAction<T>>,
  React.RefObject<((state: T) => void) | undefined>,
] {
  const [value, setValue] = React.useState(defaultProp);
  const prevValueRef = React.useRef(value);
  const onChangeRef = React.useRef(onChange);

  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef]);

  return [value, setValue, onChangeRef];
}

function isFunction(value: unknown): value is SetStateFn<any> {
  return typeof value === 'function';
}
