import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

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
