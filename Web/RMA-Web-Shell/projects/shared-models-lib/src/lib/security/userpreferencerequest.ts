import { BaseClass } from '../common/base-class';

export class UserPreferenceRequest extends BaseClass {
    userId: number;
    preferences: string;
}
