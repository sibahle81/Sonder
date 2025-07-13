export enum RolePlayerQueryItemTypeEnum {
  MedicalInvoice = 1,
}

export enum RolePlayerItemQueryCategoryEnum {
  IncorrectPaymentAmount = 1,
  InvoiceRejected = 2,
  PaymentNotReceived = 3,
  GeneralQuery = 4,
}

export enum RolePlayerItemQueryStatusEnum {
  Submitted = 1,
  UnderReviewbyRMA = 2,
  AwaitingMyResponse = 3,
  Resolved = 4,
  Closed = 5,
}

export enum RolePlayerItemQueryTypeEnum {
  Query = 1,
  Complaint = 2,
}