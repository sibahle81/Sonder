import { BaseClass } from '../common/base-class';

export class TenantPreferenceRequest extends BaseClass {
    tenantId: number;
    preferences: string;
}
