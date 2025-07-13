import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class WizardRequest extends BaseClass {
    constructor(
        public type: string,
        public linkedItemId: number,
        public data: string) {
        super();
    }
}
