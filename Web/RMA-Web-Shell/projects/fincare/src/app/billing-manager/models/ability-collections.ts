import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class AbilityCollections extends BaseClass{
    id:number;
    companyNo: number;
    branchNo: number;
    transactionType: string;
    transactionDate: Date;
    level1: string;
    level2: string;
    level3: number;
    chartIsNo: number;
    chartBsNo: number;
    ChartISName: string;
    ChartBSName: string;
    benefitCode: string;
    dailyTotal: number;
    isProcessed: boolean;
    sysNo: number;
    reference: string;
    batchReference: string;
    date: string;
    time: string;
    lineCount: number;
    processed: string;
    isExpanded?: boolean;
    bankAccountNumber: string;
  }