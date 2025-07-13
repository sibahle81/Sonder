import { WizardAction } from '../enums/wizard-action.enum';

export class WizardParameters {
    id: number;
    action: WizardAction;
    type: string;

    constructor(id: any, action: string, type: string) {
        this.id = id;
        this.type = type;
        this.action = action.toLowerCase() === 'new' ? WizardAction.New : WizardAction.Continue;
    }
}
