export interface BeneficiaryBankingDetail {
      firstname: string;
      lastname: string;
      idNumber: string;
      passportNumber: string;
      messageText: string;
      beneficiaryTypeId: number;
      beneficiaryId: number;
      insuredLifeId: number;
      nameOfAccountHolder: string;
      bankName: string;
      accountId: number;
      accountNumber: string;
      bankAccountTypeId: number;
      universalBranchCode: string;
      isApproved: boolean | null;
      reason: string;
      haveAllDocumentsAccepted: boolean;
      isWizardCompleted: boolean;
      accountType: string;
}