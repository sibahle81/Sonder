import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';

export class DocumentType extends BaseClass {
   id: number;
   name: string;
   description: string;
   documentTemplateId: string;
   IsActive: boolean;
   IsDeleted: boolean;
   CreatedBy: string;
   CreatedDate: Date;
   ModifiedBy: string;
   ModifiedDate: Date;
}
