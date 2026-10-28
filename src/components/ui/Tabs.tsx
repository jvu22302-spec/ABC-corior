import React from 'react';
import { m } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useMotionPreference } from '@/motion/useMotionPreference';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'segmented' | 'underline';
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'segmented',
}: TabsProps) {
  const { reduced } = useMotionPreference();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    if (enabledTabs.length === 0) return;
    const currentIndex = enabledTabs.findIndex((t) => t.id === activeTab);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % enabledTabs.length;
      onChange(enabledTabs[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
      onChange(enabledTabs[prevIndex].id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(enabledTabs[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(enabledTabs[enabledTabs.length - 1].id);
    }
  };

  if (variant === 'underline') {
    return (
      <div
        role="tablist"
        onKeyDown={handleKeyDown}
        className={cn('flex items-center gap-6 border-b border-ink-200', className)}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 py-3 text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-xs',
                isActive
                  ? 'text-brand-600 font-semibold'
                  : 'text-ink-600 hover:text-ink-900',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              {tab.icon && <span className="w-4 h-4" aria-hidden="true">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.2 rounded-full font-medium',
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-600'
                  )}
                >
                  {tab.count}
                </span>
              )}

              {/* Sliding underline indicator via layoutId */}
              {isActive && (
                reduced ? (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 rounded-full" />
                ) : (
                  <m.span
                    layoutId="tab-underline-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center p-1 bg-surface-muted border border-ink-200 rounded-lg gap-1 select-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
              isActive
                ? 'text-ink-900 font-semibold'
                : 'text-ink-600 hover:text-ink-900 hover:bg-surface/50',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {/* Sliding background pill indicator via layoutId */}
            {isActive && (
              reduced ? (
                <span className="absolute inset-0 bg-surface rounded-md shadow-xs border border-ink-200/60 -z-0" />
              ) : (
                <m.span
                  layoutId="tab-pill-indicator"
                  className="absolute inset-0 bg-surface rounded-md shadow-xs border border-ink-200/60 -z-0"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )
            )}

            {tab.icon && (
              <span className="w-3.5 h-3.5 relative z-10" aria-hidden="true">
                {tab.icon}
              </span>
            )}
            <span className="relative z-10">{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-semibold relative z-10',
                  isActive ? 'bg-brand-50 text-brand-700' : 'bg-ink-200 text-ink-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
