import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class CityRetrieval extends BaseClass {
    public cityId: number;
    public code: string;
    public city: string;
    public suburb: string;
    public province: string;
}
