import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class RejectWizardRequest extends BaseClass {
    constructor(
        public readonly wizardId: number,
        public readonly comment: string,
        public readonly rejectedBy: string) {
        super();
    }
}
