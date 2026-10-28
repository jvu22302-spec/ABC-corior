import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);
  const baseId = useId();

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-ink-200/80 rounded-xl border border-ink-200 bg-surface overflow-hidden', className)}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const headerId = `${baseId}-header-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.id} className="transition-colors">
            <h3>
              <button
                type="button"
                id={headerId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => toggleItem(item.id)}
                className="w-full py-4 px-5 text-left text-sm font-semibold text-ink-900 flex items-center justify-between gap-4 hover:bg-surface-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
              >
                <span>{item.title}</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-ink-400 shrink-0 transition-transform duration-150',
                    isOpen && 'rotate-180 text-brand-600'
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className={cn(
                'px-5 pb-5 text-xs text-ink-600 leading-relaxed transition-all duration-150',
                !isOpen && 'hidden'
              )}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
