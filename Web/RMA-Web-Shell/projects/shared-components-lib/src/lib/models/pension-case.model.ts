import { InitiatePensionCaseData } from 'projects/penscare/src/app/shared-penscare/models/initiate-pensioncase-data.model';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { PensionProductOptionsEnum } from 'projects/shared-models-lib/src/lib/enums/pension-product-options-enum';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { Visit } from "projects/medicare/src/app/pmp-manager/models/visit";
import { TebaLocationDetails } from "projects/medicare/src/app/pmp-manager/models/teba-location-details";

    export class PensionCase {
        benefitType?: BenefitTypeEnum;
        pensionCaseNumber?: string;
        pdPercentage?: number;
        caa?: number;
        verifiedCV?: number;
        pensionLumpSum?: number;
    }

    export class PensionClaim {
        claimReferenceNumber: string;
        dateOfAccident: Date;
        dateOfStabilisation: Date;
        earnings: number;
        pensionLumpSum: number;
        foodAndQuarters: number;
        estimatedCV: number;
        verifiedCV: number;
        increaseList: Increase[];
        widowLumpSum: number;
        dos: Date;
        totalCompensations: number;
        productCode: string;
        percentageIncrease: number;
        icD10Driver: string;
        drg: string;
        member: string;
        pensionCaseNumber: string;
        pensionerId: number;
        personEventId: number;
        claimId: number;
        eventId: number;
        serviceName: string;
        scheduleDate: Date;
        isScheduleON: boolean;
        attendedClinic: boolean;
        excludePMPSchedule: boolean;
        pmpLocation: string;
        pmpRegion: string;
        pmpmca: string;
        pmpspa: string;
        tebaLocationId: number;
        tebaBranchName: string;
        tebaAddress: string;
        tebaCity: string;
        tebaProvince: string;
        tebaCountry: string;
        tebaPostalCode: string;
        tebaPMPRegion: string;
        tebaLocationDetails: TebaLocationDetails[];
        visits: Visit[];
    }

export class AvPercentage {
    age: number;
    percentage: number;
}

export class Benefit {
  beneficiaryType: BeneficiaryTypeEnum
  compensation: number
  totalCompensation: number
  cv: number
  av: number
  beneficiaryFirstName:string;
  beneficiarySurname:string;
  beneficiaryDateOfBirth: Date
  recipientFirstName: string;
  recipientSurname: string;
  age: number
  dateOfBirth: Date;
  cvPercentage: number;
  faPercentage: number;
  percentageIncrease: number;
  increase: number;
  beneficiaryTypeDescription: string;
  beneficiaryNameAndSurname: string;
  beneficiaryIdNumber: string;
  year: number;
  claimReferenceNumber: string;
  dateOfAccident: Date;
  dateOfStabilisation: Date;
  productOptionName: string;
  benefitCode: string;
  productCode: string;
  productClass: ProductClassEnum;
  earnings: number;
  paye: number;
  statusName: string;
}

export class PensionProduct {
  productCode : string;
  totalCompensation : number;
  earnings : number;
  benefits: Benefit[];
}

export class VerifyCVCalculationResponse {
  widowLumpSum: number;
  childrenCv: number;
  pensionerCv: number;
  cvTotal: number;
  widowCv: number;
  caaCV: number;
  pensionProducts: PensionProduct[]
}

export class Increase {
  time: number;
  percentage: number;
}

export class BenefitDetail {
  public benefitType: BenefitTypeEnum
  public productClass : ProductClassEnum; // Stat Non Stat... legislative
  public productOptionName: string;   // DPN / Spouse Plus 3... policy
  public productId: number;  // "productId": 3 // AUG, EMP, ...
  public productOptionId: PensionProductOptionsEnum;
  public productName: string // IOD Coid...
  public benefitName: string
}

export class GetBenefitDetailRequest {
  public benefitType: BenefitTypeEnum
}
