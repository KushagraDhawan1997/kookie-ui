import type { textPropDefs } from '../components/text.props.js';
import type { Responsive } from '../props/prop-def.js';

function mapResponsiveProp<Input extends string, Output>(
  propValue: Responsive<Input> | undefined,
  mapValue: (value: Input) => Output
): Responsive<Output> | undefined {
  if (propValue === undefined) return undefined;
  if (typeof propValue === 'string') {
    return mapValue(propValue);
  }
  return Object.fromEntries(
    Object.entries(propValue).map(([key, value]) => [key, mapValue(value)])
  );
}

export { mapResponsiveProp };
