import { BaseClass } from 'src/app/core/models/base-class.model';

export class RejectWizardRequest extends BaseClass {
    constructor(
        public readonly wizardId: number,
        public readonly comment: string,
        public readonly rejectedBy: string) {
        super();
    }
}
