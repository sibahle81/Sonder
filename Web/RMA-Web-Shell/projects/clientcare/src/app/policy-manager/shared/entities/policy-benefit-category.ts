export class PolicyBenefitCategory {
  benefitCategoryId: number; // BenefitCategoryId (Primary key)
  benefitDetailId: number; // BenefitDetailId
  name: string; // Name (length: 50)
  description: string; // Description (length: 100)
  startDate: Date; // StartDate
  endDate : Date | null; // EndDate
  isDeleted: boolean; // IsDeleted
  createdBy: string; // CreatedBy (length: 50)
  createdDate: Date; // CreatedDate
  modifiedBy: string; // ModifiedBy (length: 50)
  modifiedDate: Date; // ModifiedDate
}

