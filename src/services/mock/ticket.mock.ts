import { CreateTicketParams, TicketResult, TicketService } from '../contracts/ticket.contract';
import { validatePkPhone } from '@/lib/phone';
import { AppError } from '@/lib/errors';

const simulateLatency = (min = 200, max = 400) =>
  new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

interface InMemoryTicket {
  ticketNo: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  createdAt: string;
}

export class MockTicketService implements TicketService {
  private inMemoryTickets: InMemoryTicket[] = [];

  async createContactTicket(params: CreateTicketParams): Promise<TicketResult> {
    await simulateLatency();

    if (!params.name || params.name.trim().length === 0) {
      throw AppError.validation('Full name is required.');
    }

    if (!params.phone || params.phone.trim().length === 0) {
      throw AppError.validation('Phone number is required.');
    }

    const phoneValidation = validatePkPhone(params.phone);
    if (!phoneValidation.isValid) {
      throw AppError.validation(
        phoneValidation.error || 'Please enter a valid Pakistani phone number.'
      );
    }

    if (!params.message || params.message.trim().length < 10) {
      throw AppError.validation('Message must be at least 10 characters long.');
    }

    // Generate random 6-digit reference e.g. TKT-489123
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const ticketNo = `TKT-${randomDigits}`;
    const createdAt = new Date().toISOString();

    const record: InMemoryTicket = {
      ticketNo,
      name: params.name.trim(),
      phone: phoneValidation.normalized || params.phone.trim(),
      email: params.email?.trim() || undefined,
      message: params.message.trim(),
      createdAt,
    };

    this.inMemoryTickets.push(record);

    return {
      ticketNo,
      createdAt,
    };
  }

  // Debug helper to inspect in-memory tickets during tests
  getTicketsCount(): number {
    return this.inMemoryTickets.length;
  }
}
