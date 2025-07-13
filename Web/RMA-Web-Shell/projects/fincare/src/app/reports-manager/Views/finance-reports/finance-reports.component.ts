import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { PaymentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/payment-type-enum';

@Component({
  selector: 'finance-reports',
  templateUrl: './finance-reports.component.html',
  styleUrls: ['./finance-reports.component.css']
})
export class FinanceReportsComponent {

  reports = [
    { key: 'Age Analysis Report', value: 'RMA.Reports.FinCare/RMAFinanceAgeAnalysisReport'  },
    { key: 'Audit Trail Report', value: 'RMA.Reports.FinCare/RMAFinanceAuditTrailReport' },
    { key: 'Bank Statement Report', value: 'RMA.Reports.FinCare/RMAFinanceBankStatement' },
    { key: 'Bank Recon Report', value: 'RMA.Reports.FinCare/RMAFinanceBankReconReport' },
    { key: 'Commission Report', value: 'RMA.Reports.FinCare/RMAFinanceCommissionReport' },
    { key: 'Compliance Commission Report', value: 'RMA.Reports.FinCare/RMAFinanceComplianceCommissionReport' },
    { key: 'Claim Debtor Recon Report', value: 'RMA.Reports.FinCare/RMAFinanceClaimDebtorReconReport' },
    { key: 'Detailed Payment Report', value: 'RMA.Reports.FinCare/RMADetailedPaymentList' },
    { key: 'Detailed Payment Report By Group', value: 'RMA.Reports.FinCare/RMADetailedPaymentListByGroup' },
    { key: 'Discount Report', value: 'RMA.Reports.FinCare/RMAFinanceDiscountsReport' },
    { key: 'GL Posting Report', value: 'RMA.Reports.FinCare/RMAFinanceGLPostingReport' },
    { key: 'Payment Recon Report', value: 'RMA.Reports.FinCare/RMAFinancePaymentRecon' },
    { key: 'Payment Reversal Report', value: 'RMA.Reports.FinCare/RMAFinancePaymentReversalReport' },
    { key: 'Partner Commissions Report', value: 'RMA.Reports.FinCare/RMAFinancePartnerCommissionsReport' },
    { key: 'Processing Payment Report', value: 'RMA.Reports.FinCare/RMAFinanceProcessingPaymentReport' },
    { key: 'Refunds Report', value: 'RMA.Reports.FinCare/RMAFinanceRefundsReport' },
    { key: 'Remittance Exception Report', value: 'RMA.Reports.FinCare/RMAFinanceRemittanceException' },
    { key: 'Risk Key Indicator Report', value: 'RMA.Reports.FinCare/RMAFinanceRiskKeyIndicatorReport' },
    { key: 'Unallocated Report', value: 'RMA.Reports.FinCare/RMAFinanceUnallocatedReport' },
    { key: 'Future Dated Payments Recon Report', value: 'RMA.Reports.FinCare/RMAFinanceFutureDatedBankReconReport' },   
    { key: 'Tribunal Payments Report', value: 'RMA.Reports.FinCare/RMATribunalPayments' },   
    { key: 'Claim Rejection Report', value: 'RMA.Reports.FinCare/RejectionReportClaims' },  
    { key: 'Rejection', value: 'RMA.Reports.FinCare/RMARejectionReport'},       
    { key: 'Pensions Rejection Report', value: 'RMA.Reports.FinCare/RejectionReportPensions' },       
    { key: 'Unclaimed Benefits Report', value: 'RMA.Reports.FinCare/RMAFinanceUnclaimedBenefitsReport' },  
    { key: 'Query Report', value: 'RMA.Reports.FinCare/RMAFinanceQueryReport' },       
    { key: 'Under Payment Report', value: 'RMA.Reports.FinCare/RMAFinanceUnderPaymentReport' },  
    { key: 'Non-Payment Report', value: 'RMA.Reports.FinCare/RMAFinanceNonPaymentReport' },  
    { key: 'Pension Paid By Period and Type', value: 'RMA.Reports.FinCare/PensionPaidByPeriodAndType' },  

  ];

  standardFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  isSearchCriteriaEntered = false;
  isShowClaimTypes = false;

  constructor() { }

  reportSelected($event: any) {
    this.selectedReport = $event;
    this.reportUrl = this.selectedReport.value;
    this.reset();
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {

      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
    if ((this.parameters.find(s => s.key === 'SearchCriteria') && this.checkForDetailedPaymentSelected())
      ||(this.checkForDetailedPaymentByGroupSelected() && this.parameters.find(s => s.key === 'mspGroupName' && s.value !== ''))) {
      this.isSearchCriteriaEntered = true;
    } else {
      this.isSearchCriteriaEntered = false;
    }

    if (this.parameters.find(s => s.key === 'PaymentTypeId') && parseInt(this.parameters.find(s => s.key === 'PaymentTypeId').value) === PaymentTypeEnum.Claim) {
      this.isShowClaimTypes = true;
    } else {
      this.isShowClaimTypes = false;

      const index = this.parameters.find(s => s.key === 'claimTypeId') ? this.parameters.indexOf(this.parameters.find(s => s.key === 'claimTypeId')) : -1;

      if (index > -1) {
        this.parameters.splice(index, 1);
      }

    }
  }

  reset() {
    if (this.checkForDetailedPaymentSelected() || this.checkForDetailedPaymentByGroupSelected()) {
      this.standardFiltersExpanded = true;
    } else {
      this.standardFiltersExpanded = false;
    }
    this.parameters = null;
    this.triggerReset = !this.triggerReset;
  }

  checkForDetailedPaymentSelected() {
    return (this.selectedReport.key === 'Detailed Payment Report')
  }

  checkForDetailedPaymentByGroupSelected() {
    return (this.selectedReport.key === 'Detailed Payment Report By Group')
  }
}
