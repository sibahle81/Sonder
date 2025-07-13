import { SundryServiceProviderTypeEnum } from "./sundry-service-provider-type-enum";

export class SundryProvider {
    rolePlayerId: number;
    name: string;
    description: string;
    companyNumber: string;
    dateStarted: Date | null;
    dateClosed: Date | null;
    sundryServiceProviderType: SundryServiceProviderTypeEnum;
    isVat: boolean;
    vatRegNumber: string;
    isAuthorised: boolean | null;
    createdDate: Date;
    createdBy: string;
    modifiedDate: Date;
    modifiedBy: string;
}