import { BaseClass } from '../../core/models/base-class.model';

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
