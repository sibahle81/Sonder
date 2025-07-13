import { PensCareNote } from "./penscare-note";

export class ChildToAdultPensionLedger {
  public slaRAGIndicatorId?: number;
  public beneficiaryName?: string;
  public beneficiarySurname?: string;
  public dateOfBirth?: Date;
  public expiryDate?: Date;
  public pensionCaseNumber?: string;
  public pensionCaseId?: number;
  public ledgerId?: number;
  public beneficiaryRolePlayerId?: number;
  public recipientRolePlayerId?: number;
  public notes?: PensCareNote[];
  public beneficiaryId?: number;
}
