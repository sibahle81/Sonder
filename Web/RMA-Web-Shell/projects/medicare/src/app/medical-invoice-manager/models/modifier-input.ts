import { InvoiceLineDetails } from "projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-line-details";

export class ModifierInput{
    ModifierCode: string;
    ModifierDescription: string;
    ModifierServiceDate: Date;
    HealthCareProviderId: number;
    PractitionerTypeId: number;
    TariffCode: string;
    TariffServiceDate: Date;
    TariffQuantity: number;
    TariffAmount: number;
    TariffDiscount: number;
    TariffBaseUnitCostTypeId: number;
    TariffTypeId: number;
    PublicationId: number;
    IsModifier: boolean;
    UnitPrice: number;
    PreviousLinesTotalAmount: number;
    PreviousInvoiceLine: InvoiceLineDetails;
    PreviousInvoiceLines: InvoiceLineDetails[];
    TimeUnits: number;
    SectionNo: string;
    RecommendedUnits: number;
    ReductionCodes: string[]
}