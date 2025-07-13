import { DeclarationBillingIntegrationStatusEnum } from "../enums/declaration-billing integration-status.enum";
import { DeclarationBillingIntegrationTypeEnum } from "../enums/declaration-billing integration-type.enum";
import { InvoiceStatusEnum } from "../enums/invoice-status-enum";

export class DeclarationBillingIntegration {
  declarationBillingIntegrationId: number;
  declarationId: number;
  amount: number;
  declarationBillingIntegrationStatus: DeclarationBillingIntegrationStatusEnum;
  declarationBillingIntegrationType: DeclarationBillingIntegrationTypeEnum;
  invoiceId: number;
  invoiceStatus: InvoiceStatusEnum;
}
