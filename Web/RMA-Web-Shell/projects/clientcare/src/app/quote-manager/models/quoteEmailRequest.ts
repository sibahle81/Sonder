import { QuoteV2 } from './quoteV2';

export class QuoteEmailRequest {
  quote: QuoteV2;
  emailAddresses: string[];
}
