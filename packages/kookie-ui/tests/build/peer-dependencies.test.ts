// @vitest-environment node
import { describe, expect, it } from 'vitest';
import pkg from '../../package.json';

describe('peer dependencies', () => {
  it('require React 19', () => {
    expect(pkg.peerDependencies.react).toBe('^19.0');
    expect(pkg.peerDependencies['react-dom']).toBe('^19.0');
  });
});
