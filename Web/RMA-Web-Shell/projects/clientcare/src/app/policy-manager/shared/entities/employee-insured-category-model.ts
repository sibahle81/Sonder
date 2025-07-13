export class EmployeeInsuredCategoryModel{
    policyId: number;
    benefitId: number;
    policyName: string;
    benefitName: string;

    personId: number;
    personName: string;
    benefitDetailId: number;
    rolePlayerTypeId: number;
    effectiveDate: Date;
    selectedDetailDate: Date | null;

    personInsuredCategoryId: number;
    personInsuredCategoryEffectiveDate: Date;
    benefitCategoryId: number;
    benefitCategoryName: string;
    personEmploymentId: number;
    personInsuredCategoryStatusId: number; 
    dateJoinedPolicy: Date;

    insuredSumAssuredId: number;
    insuredSumAssuredEffectiveDate: Date;
    annualSalary: number;
    premium: number;
    potentialCoverAmount: number;
    potentialWaiverAmount: number;
    actualCoverAmount: number;
    actualWaiverAmount: number;
    medicalPremWaiverAmount: number;
    shareOfFund: number;
}