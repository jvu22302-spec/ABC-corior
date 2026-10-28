import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicContent } from '@/hooks/usePublicContent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppImage } from '@/components/media/AppImage';
import { ShieldAlert, ArrowRight, ShieldCheck, Zap, HeartHandshake, Eye } from 'lucide-react';

export function AboutPage() {
  useDocumentTitle('About Us');
  const { data: content, isLoading } = usePublicContent();

  const valueIcons = [ShieldCheck, Zap, HeartHandshake, Eye];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>SAMPLE CORPORATE OVERVIEW — Replace with official company narrative before launch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 tracking-tight">
          About ABC Logistics
        </h1>
        <p className="text-sm sm:text-base text-ink-600 max-w-2xl leading-relaxed">
          Developing reliable courier infrastructure, regional sorting gateways, and integrated cash management for Pakistani commerce.
        </p>
      </div>

      {/* Main Visual via AppImage IMG-12 */}
      <div>
        <AppImage id="IMG-12" className="w-full shadow-md" />
      </div>

      {/* Narrative Paragraphs from content.aboutText */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-ink-900">Our Operations & Mission</h2>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <div className="space-y-3 text-sm text-ink-700 leading-relaxed">
            {content?.aboutText.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        )}
      </div>

      {/* Values Section */}
      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-bold text-ink-900">Core Operational Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {content?.values.map((val, idx) => {
            const Icon = valueIcons[idx % valueIcons.length];
            return (
              <Card key={idx} className="p-5 border-ink-200">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-ink-900">{val.title}</h3>
                </div>
                <p className="text-xs text-ink-600 leading-relaxed">{val.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA to Contact */}
      <div className="p-8 bg-surface-muted border border-ink-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-ink-900">Explore Partnership Opportunities</h3>
          <p className="text-xs text-ink-600 mt-0.5">
            Discuss corporate tariffs or e-commerce delivery volume with our accounts team.
          </p>
        </div>
        <Link to="/contact" className="shrink-0">
          <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Contact Operations
          </Button>
        </Link>
      </div>
    </div>
  );
}
