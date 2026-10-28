import { describe, it, expect } from 'vitest';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export function filterFaqs(
  items: FaqItem[],
  selectedCategory: string,
  searchQuery: string
): FaqItem[] {
  let filtered = items;

  if (selectedCategory && selectedCategory !== 'All') {
    filtered = filtered.filter((item) => item.category === selectedCategory);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }

  return filtered;
}

describe('FAQ Filter Logic', () => {
  const sampleFaqs: FaqItem[] = [
    { id: '1', category: 'General', question: 'What is ABC?', answer: 'ABC is a courier company.' },
    { id: '2', category: 'COD', question: 'How is Cash on Delivery collected?', answer: 'Courier collects cash at delivery.' },
    { id: '3', category: 'Tracking', question: 'How do I track a parcel?', answer: 'Use the 14-character AWB.' },
    { id: '4', category: 'Exceptions', question: 'What happens on failed delivery?', answer: 'We attempt delivery up to three times.' },
  ];

  it('returns all items when category is "All" and query is empty', () => {
    const result = filterFaqs(sampleFaqs, 'All', '');
    expect(result).toHaveLength(4);
  });

  it('filters items strictly by category', () => {
    const result = filterFaqs(sampleFaqs, 'COD', '');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters case-insensitively across question and answer text', () => {
    const questionMatch = filterFaqs(sampleFaqs, 'All', 'TRACK');
    expect(questionMatch).toHaveLength(1);
    expect(questionMatch[0].id).toBe('3');

    const answerMatch = filterFaqs(sampleFaqs, 'All', 'three times');
    expect(answerMatch).toHaveLength(1);
    expect(answerMatch[0].id).toBe('4');
  });

  it('applies combined category and search filter correctly', () => {
    const combined = filterFaqs(sampleFaqs, 'COD', 'cash');
    expect(combined).toHaveLength(1);

    const nonMatching = filterFaqs(sampleFaqs, 'COD', 'tracking');
    expect(nonMatching).toHaveLength(0);
  });
});
