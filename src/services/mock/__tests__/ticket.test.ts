import { describe, it, expect } from 'vitest';
import { MockTicketService } from '../ticket.mock';

describe('MockTicketService', () => {
  it('creates ticket with TKT- followed by 6 digits', async () => {
    const service = new MockTicketService();
    const result = await service.createContactTicket({
      name: 'Tariq Mehmood',
      phone: '0300 1234567',
      email: 'tariq@example.pk',
      message: 'Need corporate rates for inter-city parcel dispatch.',
    });

    expect(result.ticketNo).toMatch(/^TKT-\d{6}$/);
    expect(result.createdAt).toBeDefined();
    expect(service.getTicketsCount()).toBe(1);
  });

  it('rejects invalid phone numbers during ticket submission', async () => {
    const service = new MockTicketService();
    await expect(
      service.createContactTicket({
        name: 'Tariq Mehmood',
        phone: '12345',
        message: 'Valid message content of sufficient length.',
      })
    ).rejects.toThrow();
  });

  it('rejects short messages (< 10 chars)', async () => {
    const service = new MockTicketService();
    await expect(
      service.createContactTicket({
        name: 'Tariq Mehmood',
        phone: '0300 1234567',
        message: 'Short',
      })
    ).rejects.toThrow('at least 10 characters');
  });
});
