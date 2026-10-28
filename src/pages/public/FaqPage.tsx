import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePublicContent } from '@/hooks/usePublicContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Accordion } from '@/components/ui/Accordion';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Search, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react';

const CATEGORIES = ['All', 'General', 'Booking', 'Tracking', 'COD', 'Exceptions'] as const;
type Category = (typeof CATEGORIES)[number];

export function FaqPage() {
  useDocumentTitle('FAQ');
  const { data: content, isLoading } = usePublicContent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const filteredFaqs = useMemo(() => {
    if (!content?.faqs) return [];
    let items = content.faqs;

    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      );
    }

    return items;
  }, [content?.faqs, selectedCategory, searchQuery]);

  const accordionItems = useMemo(() => {
    return filteredFaqs.map((faq) => ({
      id: faq.id,
      title: (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ink-100 text-ink-600 font-mono">
            {faq.category}
          </span>
          <span className="text-ink-900">{faq.question}</span>
        </div>
      ),
      content: (
        <div className="pt-2 text-xs leading-relaxed text-ink-600">
          <p>{faq.answer}</p>
        </div>
      ),
    }));
  }, [filteredFaqs]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-ink-600">
          Find fast answers regarding parcel dispatches, transit tracking, and COD remittances.
        </p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
        <span>SAMPLE FAQ CONTENT — Policy-dependent answers are samples to be confirmed by ABC.</span>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords (e.g. COD, tracking, pickup)..."
            aria-label="Search FAQs"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-surface border border-ink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 text-ink-900 placeholder:text-ink-400 shadow-2xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="FAQ Categories">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                    : 'bg-surface text-ink-700 border-ink-200 hover:bg-surface-muted'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Content or Loading / Empty */}
      <div>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {!isLoading && filteredFaqs.length === 0 && (
          <EmptyState
            icon={<HelpCircle className="w-6 h-6" />}
            title="No Matching Questions Found"
            description={
              searchQuery
                ? `No questions matching "${searchQuery}" were found under "${selectedCategory}".`
                : 'No FAQs available in this category.'
            }
            action={
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Reset filters
              </button>
            }
          />
        )}

        {!isLoading && filteredFaqs.length > 0 && (
          <Accordion items={accordionItems} allowMultiple />
        )}
      </div>

      {/* Contact Link at Bottom */}
      <div className="p-6 bg-surface-muted border border-ink-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="font-semibold text-ink-900 text-sm">Still have a question?</div>
          <p className="text-ink-600 mt-0.5">
            Can't find the answer you're looking for? Reach out directly to our support desk.
          </p>
        </div>
        <Link to="/contact" className="shrink-0">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Contact Support Desk
          </Button>
        </Link>
      </div>
    </div>
  );
}
