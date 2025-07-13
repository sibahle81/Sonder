export class EarningDetail {
  earningDetailId: number;
  earningId: number;
  earningTypeId: number;
  otherDescription: string;
  month: string;
  amount: number | null;
  personEventId: number;
  
  isDeleted?: boolean;
  createdBy?: string;
  createdDate?: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
}

interface ICaptureEarningDetail {
  idx: number;
  earningDetailId?: number;
  earningId?: number;
  earningTypeId: number;
  earningTypeName: String;
  earningTypeRequired: boolean,
  otherDescription?: string;
  months?: IEarningMonth[];
  variableAmountTotal?: number,
  nonVariableAmount?: number | null;
}

export { ICaptureEarningDetail, inits };

const inits: ICaptureEarningDetail = {
  idx: 0,
  earningDetailId: 0,
  earningId: 0,
  earningTypeId: 0,
  earningTypeName: '',
  otherDescription: '',
  earningTypeRequired: false,
  months: [],
  variableAmountTotal: 0,
  nonVariableAmount: 0
};

export interface IEarningMonth {
  earningDetailId?: number;
  month: string;
  amount: number;
}
