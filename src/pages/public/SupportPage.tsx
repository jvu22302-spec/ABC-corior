import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Phone, Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function SupportPage() {
  useDocumentTitle('Support Helpdesk');
  const { data: settings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
          Customer Support & Help Desk
        </h1>
        <p className="text-sm text-ink-600 mt-2">
          We are available Monday to Saturday, 9:00 AM to 7:00 PM (Asia/Karachi).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <Phone className="w-8 h-8 text-brand-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-ink-900 mb-1">Telephone Helpline</h3>
          <p className="text-xs text-ink-600 mb-3">{settings?.supportPhone}</p>
          <a href="tel:+9221111222333">
            <Button variant="secondary" size="sm">Call Helpline</Button>
          </a>
        </Card>

        <Card className="text-center p-6">
          <Mail className="w-8 h-8 text-brand-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-ink-900 mb-1">Email Dispatch</h3>
          <p className="text-xs text-ink-600 mb-3">{settings?.supportEmail}</p>
          <Link to="/contact">
            <Button variant="secondary" size="sm">Open Ticket</Button>
          </Link>
        </Card>

        <Card className="text-center p-6">
          <FileText className="w-8 h-8 text-brand-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-ink-900 mb-1">Self-Service Help</h3>
          <p className="text-xs text-ink-600 mb-3">Browse common answers</p>
          <Link to="/faq">
            <Button variant="secondary" size="sm">View FAQs</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
