import { WizardConfiguration } from './wizard-configuration';
import { WizardStatus } from './wizard-status.enum';
import { Router } from '@angular/router';
import { WizardPermissionOverride } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-permission-override';

export class Wizard {

  id: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: Date;
  modifiedDate: Date;
  isDeleted: boolean;
  canStart: boolean;
  canApprove: boolean;
  canEdit: boolean;
  cantApproveReason: string;
  currentStep: string;
  currentStepIndex: number;
  customStatus: string;
  data: string;
  hasApproval: boolean;
  linkedItemId: number;
  lockedReason: string;
  lockedToUser: string;
  lockedToUserDisplayName: string;
  modifiedByDisplayName: string;
  createdByDisplayName: string;
  name: string;
  startType: string;
  type: string;
  wizardConfiguration: WizardConfiguration;
  wizardPermissionOverrides: WizardPermissionOverride[];
  wizardConfigurationId: string;
  wizardStatus: string;
  wizardStatusId: WizardStatus;
  wizardStatusText: string;
  overAllSLAHours: string;
  slaRAGIndicatorId: number;
  isExpanded: boolean;
  customRoutingRoleId?: number;

  static redirect(router: Router, type: string, itemId: number) {
    const url = this.getRedirectUrl(type, router.url);
    router.navigate([url, type, 'continue', itemId]);
  }

  static getRedirectUrl(type: string, currentUrl: string = '') {
    switch (type) {
      case 'commission-payment-banking-updated-notification':
      case 'payment-reversal-wizard': {
        return 'fincare/payment-manager';
      }
      case 'benefit':
      case 'benefits':
      case 'product-option':
      case 'product': {
        return 'clientcare/product-manager';
      }
      case 'brokerage':
      case 'brokerage-manager':
      case 'commission-payment-rejected-notification':
      case 'broker-manager':
      case 'link-agent':
      case 'fspe-import-notification':
      case 'binderpartner-manager': {
        return 'clientcare/broker-manager';
      }
      case 'new-client': {
        return 'clientcare/policy-manager/policy-wizard';
      }
      case 'quotation': {
        return 'clientcare/lead-manager';
      }
      case 'rma-quotation':
      case 'rml-quotation': {
        return 'clientcare/quote-manager';
      }
      case 'register-funeral-claim':
      case 'create-beneficiary':
      case 'create-banking-details':
      case 'update-banking-details':
      case 'role-player':
      case 'manage-event':
      case 'disease-claim':
      case 'claims-rejection-notification':
      case 'capture-claim-notification':
      case 'disease-incident-notification':
      case 'CMC-VOPD-notification':
      case 'Section-40-notification':
      case 'accident-claim':
      case 'add-injured-employees':
      case 'cad-document-request-wizard':
      case 'claim-investigation-coid':
      case 'claim-compliance':
      case 'claim-earnings-validate':
      case 'claim-above30percentpd-sca':
      case 'claim-pension-pmca':
      case 'claim-section51':
      case 'claim-medical-advisor-coid':
      case 'claim-sca-validate':
      case 'claim-cca-validate':
      case 'claim-payment-reversal':
      case 'ttd-nearing-18months':
      case 'cad-request-invoice-payment':
      case '1st-medical-report-mismatch':
      case 'invoice-payment-approval':
      case 'capture-earnings':
      case 'capture-earnings-section-51':
      case 'capture-earnings-override' :
      case 'disability-assessment-approval':
      case 'upload-final-medical-report-workflow-cca':
      case 'review-injury-icd10-codes':
      case 'mmi-expiry-extension':
      case 'disability-to-fatal':
      case 'claim-liability-approval':
      case 'upload-section90-review-report':
      case 'payment-authorisation-request':
        return 'claimcare/claim-manager';
      case 'premium-listing':
      case 'premium-listing-documents':
      case 'new-business-individual':
      case 'new-business-group':
      case 'cancel-policy-individual':
      case 'manage-policy-individual':
      case 'manage-policy-group':
      case 'move-broker-policies':
      case 'move-policy-broker':
      case 'maintain-policy-members':
      case 'reinstate-policy':
      case 'continue-policy':
      case 'maintain-group-member':
      case 'cancel-policy-group':
      case 'lapse-policy':
      case 'insured-lives':
      case 'change-policy-status':
      case 'clientcare-notification':
      case 'move-policy-scheme':
      case 'upgrade-downgrade-policy':
      case 'grouprisk-onboarding':
      case 'mvp-onboarding':
      case 'rma-policy':
      case 'rml-policy':
      case 'rma-rml-policy-cancellation':
      case 'rma-rml-policy-reinstatement':
      case 'rma-rml-policy-maintanance':
      case 'policy-premium-payback-errors':
      case 'manage-group-risk-policies':
        return 'clientcare/policy-manager';
      case 'cfp-onboarding':
          if (currentUrl?.toLowerCase().indexOf('onboarding-manager') >= 0) {
            return 'member/onboarding-manager';
          } else {
            return 'clientcare/policy-manager';
          }
      case 'fincare-notification':
      case 'inter-bank-submitted-notification':
      case 'inter-bank-complete-notification':
      case 'adhoc-collection':
      case 'collection-assignment':
      case 'credit-note':
      case 'credit-note-reversal':
      case 'funeral-tracing':
      case 'trace-document':
      case 'claimant-recovery-approval':
      case 'inter-debtor-transfer':
      case 'refund':
      case 'reallocation':
      case 'inter-bank-transfer':
      case 'collection-rejected-notification':
      case 'credit-note-debit-reversal':
      case 'interest-reversal':
      case 'terms-arrangements-inadequate-payment':
      case 'terms-arrangements-missed-payments':
      case 'terms-arrangements-two-missed-payments':
      case 'terms-unsuccessful-notification':
      case 'interest-adjustment':
      case 'debtor-debt-writeoff':
      case 'interest-indicator':
      case 'policy-premium-payback':
      case 'manage-grouprisk-billing':
      case 'grouprisk-policy-billing':
        return 'fincare/billing-manager';
      case 'first-medical-report-form':
      case 'progress-medical-report-form':
      case 'final-medical-report-form':
      case 'first-disease-medical-report-form':
      case 'progress-disease-medical-report-form':
      case 'final-disease-medical-report-form':
        return 'digicare/work-manager';
      case 'user-approval-member-portal':
        return 'user-manager';
      case 'member':
      case 'industry-class-declaration-configuration':
      case 'declaration-variance':
      case 'declaration-assistance':
      case 'rate-adjustment':
      case 'whatsapp-company-list':
      case 'roleplayer-onboarding':
      case 'manage-grouprisk-premium-rates':
        return 'clientcare/member-manager';
      case 'edit-preauth-notification':
        return 'medicare/work-manager/edit-preauth';
      case 'capture-preauth-notification':
      case  'review-preauth-prosthetist-quote':
      case 'review-preauth':
      case 'review-treatment-preauth':
      case 'preauth-capture-form':
      case 'maa-preauth-review-routing':
      case 'review-preauth-hum':
      case 'review-preauth-cca':
      case 'review-preauth-case-management':
        return 'medicare/work-manager';
      case 'edit-preauth':
      case  'capture-preauth-prosthetist':
        return 'medicare/work-manager';
      case 'edit-chronic-preauth':        
        return 'medicare/work-manager';
      case 'review-preauth-notification':
        return 'review-preauth';
      case 'capture-medical-invoice-notification':
      case 'capture-medical-invoice':
      case 'pend-medical-invoice-notification':
      case 'reject-medical-invoice-notification':
      case 'edit-medical-invoice':
      case 'medical-invoice-assessment':
      case 'medical-invoice-query-response':
         return 'medicare/medical-invoice-manager';
      case 'healthcare-provider-registration':    
      case 'update-healthcare-provider-demographics':
      case 'update-healthcare-provider-banking-details':
        return 'medicare/hcp-member-manager';
      case 'pmp-schedule':
          return 'medicare/pmp-manager';
      case 'capture-teba-invoice':
      case 'teba-invoices-pend-reject-process':
        return 'medicare/work-manager';
      case 'terms-arrangement':
        return 'fincare/billing-manager';
      case 'initiate-pension-case':
      case 'initiate-pension-case':
      case 'pension-ledger-status':
      case 'corrective-entry':
      case 'commutation-wizard':
        return 'penscare/pensioncase-manager';
      case 'tax-rebates':
      case 'tax-rates':
      case 'additional-tax-wizard':
        return 'penscare/tax-manager';
      case 'child-extension':
        return 'penscare/child-extension-manager';
      case 'pensions-annual-increase':
      case 'pensions-bonus-payment':
        return 'penscare/annual-increase';
      case 'review-treatment-preauth':
        return 'medicare/work-manager';
      case 'review-chronic-preauth':
        return 'medicare/work-manager';
      case 'review-prosthetic-preauth':
        return 'medicare/work-manager';
      case 'edit-prosthetic-preauth':
        return 'medicare/work-manager';
      case 'overpayment-wizard':
        return 'penscare';
      case 'edit-invoice':
        return 'fincare/billing-manager';
      default: {
        return 'wizard-manager/wizard-host';
      }
    }
  }
}
