# ABC Courier Motion System (Phase M1)

A standardized, lightweight, and accessibility-first motion architecture built on `framer-motion` (LazyMotion with `domAnimation`).

---

## 1. Core Principles
1. **Performance & Bundle Size**: Uses `<m.div>` with `LazyMotion` strict mode. Features are loaded synchronously with zero full-library bloat.
2. **Strict Property Discipline**: Only animate `transform` and `opacity` (plus CSS filters / background positions where cheap). Never animate `width`, `height`, `top`, `left`, or `margin`.
3. **Accessibility (WCAG AA)**: Fully adheres to `prefers-reduced-motion: reduce`. When active, animations instantly resolve without spatial translations.
4. **Adaptive / Low-Power Mode**: Detects `saveData`, low core counts ($\le 4$), or low memory ($\le 4\text{GB}$) to automatically disable continuous loops, heavy glow halos, tilt, and magnetic physics.

---

## 2. Exports Overview (`src/motion/`)
- **`tokens.ts`**: Standard durations (`fast: 0.15s`, `base: 0.3s`, `slow: 0.6s`, `hero: 1.0s`), easing curves (`easeOutExpo`, `easeInOut`), and springs (`snappy`, `soft`).
- **`variants.ts`**: Pre-tuned variants (`fadeIn`, `fadeUp`, `scaleIn`, `slideInLeft`, `slideInRight`, `staggerContainer`, `drawLine`, `pulseDot`, `floatY`).
- **`useMotionPreference.ts`**: Hook returning `{ reduced: boolean, lowPower: boolean }`.
- **`MotionProvider.tsx`**: Top-level provider wrapping the app in `LazyMotion` and `MotionConfig reducedMotion="user"`.
- **`Reveal.tsx`**: Viewport scroll-reveal component with `-10%` margin and `once: true`.
- **`Stagger.tsx`**: `<StaggerContainer>` and `<StaggerItem>` for choreographed lists and grids.
- **`CountUp.tsx`**: Number/currency animation using `requestAnimationFrame` with `tabular-nums` formatting.
- **`PageTransition.tsx`**: Route transition wrapper for layouts with presets (`public` vs `admin`/`rider`).

---

## 3. Usage Examples

### Viewport Scroll Reveal
```tsx
import { Reveal } from '@/motion';

<Reveal variant="fadeUp" delay={0.1}>
  <h2>Verified Domestic Network</h2>
</Reveal>
```

### Staggered List
```tsx
import { StaggerContainer, StaggerItem } from '@/motion';

<StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {services.map((svc) => (
    <StaggerItem key={svc.id}>
      <ServiceCard service={svc} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

### Number Counter
```tsx
import { CountUp } from '@/motion';

<CountUp value={99.4} decimals={1} suffix="%" />
<CountUp value={150000} format="pkr" />
```

### Route Transitions
In your layout component:
```tsx
import { PageTransition } from '@/motion';
import { Outlet } from 'react-router-dom';

<main>
  <PageTransition preset="public">
    <Outlet />
  </PageTransition>
</main>
```
