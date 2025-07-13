import { BaseClass } from "src/app/core/models/base-class.model";

export class CityRetrieval extends BaseClass {
    public cityId: number;
    public code: string;
    public city: string;
    public suburb: string;
    public province: string;
}
