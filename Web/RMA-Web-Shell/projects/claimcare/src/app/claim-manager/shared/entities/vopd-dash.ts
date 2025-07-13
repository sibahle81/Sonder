import { VopdOverview } from './vopd-overview';

export class VopdDash {
  vopdOverviews: VopdOverview[];
  successfulCount: number;
  unsuccessfulCount: number;
  processingCount: number;
  processedCount: number;
  submitted: number;
}
