import { WizardConfiguration } from './wizard-configuration';
import { WizardStatus } from './wizard-status.enum';
import { Router } from '@angular/router';

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
  wizardConfigurationId: string;
  wizardStatus: string;
  wizardStatusId: WizardStatus;
  wizardStatusText: string;
  overAllSLAHours: string;
  slaRAGIndicatorId: number;

  static redirect(router: Router, type: string, itemId: number) {
    const url = this.getRedirectUrl(type);
    router.navigate([url, type, 'continue', itemId]);
  }

  static getRedirectUrl(type: string) {
    switch (type) {
      case 'member-portal-notification': {
        return 'signin-callback';
      }
      default: {
        return 'wizard-manager/wizard-host';
        break;
      }

    }
  }
}
