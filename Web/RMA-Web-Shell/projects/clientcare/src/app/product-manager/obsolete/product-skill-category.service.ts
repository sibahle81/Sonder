import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ProductSkillCategory } from './product-skill-category';

@Injectable()
export class ProductSkillCategoryService {
    private apiUrl = 'clc/api/productskillcategory';
    constructor(
        private readonly commonService: CommonService) {
    }

    getProductSkillCategoryByProductId(productId: any): Observable<ProductSkillCategory[]> {
        return this.commonService.get<ProductSkillCategory[]>(productId, this.apiUrl);
    }

    addProductSkillCategory(productSkillCategory: ProductSkillCategory): Observable<number> {
        return this.commonService.postGeneric<ProductSkillCategory, number>(this.apiUrl, productSkillCategory);
    }

    editProductSkillCategory(productSkillCategory: ProductSkillCategory): Observable<boolean> {
        return this.commonService.edit<ProductSkillCategory>(productSkillCategory, this.apiUrl);
    }
}
