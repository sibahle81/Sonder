import { BaseClass } from "src/app/core/models/base-class.model";

export class RequiredDocument extends BaseClass {
    name: string;
    module: string;
    moduleId: number;
    documentCategoryId: number;
    documentCategoryName: string;
    fileName: string;
    file: File;
    isLoading: boolean;
}
