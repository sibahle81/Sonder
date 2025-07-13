import { TariffBaseGazettedUnitCost } from "./tariff-base-gazetted-unit-cost";

export class TariffBaseUnitCost{
        tariffBaseUnitCostId: number;
        name: string;
        description: string;
        publicationId: number;
        unitPrice: number;
        unitTypeId: number;
        validFrom: Date;
        validTo: Date;
        tariffTypeId: number;
        tariffBaseUnitCostTypeId: number;
        isCopiedFromNrpl: boolean;
        tariffBaseGazettedUnitCosts: TariffBaseGazettedUnitCost[];
        isDeleted: boolean;
        modifiedBy: string;
        modifiedDate: Date;
        createdBy: string;
        createdDate: Date;
}
