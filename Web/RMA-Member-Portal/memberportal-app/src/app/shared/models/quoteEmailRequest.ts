import { Lead } from './lead';
import { LeadContact } from './lead-contact';
import { Quote } from './quote';

export class QuoteEmailRequest {
  lead: Lead;
  quote: Quote;
  leadContacts: LeadContact[] = [];
}
