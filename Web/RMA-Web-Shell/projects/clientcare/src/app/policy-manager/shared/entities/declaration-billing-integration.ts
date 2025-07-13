import { DeclarationBillingIntegrationStatusEnum } from '../enums/declaration-billing integration-status.enum';
import { DeclarationBillingIntegrationTypeEnum } from '../enums/declaration-billing integration-type.enum';

export class DeclarationBillingIntegration {
  declarationBillingIntegrationId: number;
  declarationId: number;
  amount: number;
  declarationBillingIntegrationStatus: DeclarationBillingIntegrationStatusEnum;
  declarationBillingIntegrationType: DeclarationBillingIntegrationTypeEnum;
  billingProcessedDate: Date;
}
