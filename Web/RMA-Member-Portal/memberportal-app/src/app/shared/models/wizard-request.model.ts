import { BaseClass } from '../../core/models/base-class';

export class WizardRequest extends BaseClass {
    constructor(
        public type: string,
        public linkedItemId: number,
        public data: string) {
        super();
    }
}
