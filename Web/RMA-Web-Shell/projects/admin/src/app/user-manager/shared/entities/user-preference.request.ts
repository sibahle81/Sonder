import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class UserPreferenceRequest extends BaseClass {
    userId: number;
    preferences: string;
}
