export interface CreateTicketParams {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export interface TicketResult {
  ticketNo: string;
  createdAt: string;
}

export interface TicketService {
  createContactTicket(params: CreateTicketParams): Promise<TicketResult>;
}
