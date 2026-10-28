import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useMotionPreference } from '../useMotionPreference';
import { CountUp } from '../CountUp';
import { MotionProvider } from '../MotionProvider';

// Mock IntersectionObserver for JSDOM test runner
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(private callback: IntersectionObserverCallback) {
    setTimeout(() => {
      this.callback(
        [
          {
            isIntersecting: true,
            target: document.body,
          } as unknown as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver
      );
    }, 0);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

if (typeof window !== 'undefined') {
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    MockIntersectionObserver;
}

function PreferenceConsumer() {
  const { reduced, lowPower } = useMotionPreference();
  return (
    <div>
      <span data-testid="reduced">{reduced ? 'true' : 'false'}</span>
      <span data-testid="lowPower">{lowPower ? 'true' : 'false'}</span>
    </div>
  );
}

describe('Motion System: useMotionPreference', () => {
  const originalMatchMedia = window.matchMedia;
  const originalHardwareConcurrency = navigator.hardwareConcurrency;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: originalHardwareConcurrency,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('detects prefers-reduced-motion when media query matches', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<PreferenceConsumer />);
    expect(screen.getByTestId('reduced').textContent).toBe('true');
  });

  it('detects standard motion when media query does not match', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<PreferenceConsumer />);
    expect(screen.getByTestId('reduced').textContent).toBe('false');
  });

  it('detects lowPower when hardwareConcurrency <= 4', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 2,
      configurable: true,
    });

    render(<PreferenceConsumer />);
    expect(screen.getByTestId('lowPower').textContent).toBe('true');
  });

  it('detects lowPower when navigator.connection.saveData is true', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      configurable: true,
    });

    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    });

    render(<PreferenceConsumer />);
    expect(screen.getByTestId('lowPower').textContent).toBe('true');
  });
});

describe('Motion System: CountUp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders final value instantly when reduced motion is preferred', async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <MotionProvider>
        <CountUp value={1500} format="number" />
      </MotionProvider>
    );

    const el = await screen.findByText('1,500');
    expect(el).toBeDefined();
  });

  it('formats PKR values properly with prefix and decimals', async () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true, // test reduced mode instant render
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    render(
      <MotionProvider>
        <CountUp value={2500} format="pkr" />
      </MotionProvider>
    );

    const el = await screen.findByText(/PKR\s*2,500/);
    expect(el).toBeDefined();
  });

  it('renders formatted number when animating', async () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      configurable: true,
    });

    render(
      <MotionProvider>
        <CountUp value={500} from={500} format="number" />
      </MotionProvider>
    );

    const el = await screen.findByText('500');
    expect(el).toBeDefined();
  });
});
