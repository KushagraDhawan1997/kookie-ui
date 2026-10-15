// The real stylesheet, so browser tests measure what an app renders.
import '../src/styles/index.css';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
