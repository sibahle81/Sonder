// wiki: http:// bit.ly/2FRzYcN
// The wizard component interface is used for the common interaction between the wizard host and the steps.

import { WizardContext } from '../shared/models/wizard-context';
import { ValidationResult } from '../shared/models/validation-result';

export interface WizardComponentInterface {
    firstName: string;
    displayName: string;
    step: string;
    isWizard: boolean;
    singleDataModel: boolean; // TODO temporary must be removed once all wizards are on a single model

    wizardReadFormData(context: WizardContext): any;
    wizardPopulateForm(context: WizardContext): void;
    wizardValidateForm(context: WizardContext): ValidationResult;

    disable(): void;
    enable(): void;
}
