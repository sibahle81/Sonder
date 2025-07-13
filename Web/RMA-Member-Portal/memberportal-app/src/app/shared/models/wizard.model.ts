import { Router } from '@angular/router';
import { WizardStatus } from '../enums/wizard-status.enum';
import { WizardConfiguration } from './wizard-configuration.model';

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
        return ''
      }
      case 'new-business-individual': {
        return ''
      }
      case 'new-business-group': {
        return ''
      }
      case 'manage-policy-individual':
      case 'manage-policy-group':
        {
          return ''
        }
      default: {
        return 'wizard-manager/wizard-host';
        break;
      }
    }
  }
}
