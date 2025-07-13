import { ProductCrossRefTranType } from '../models/productCrossRefTranType.model';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class ProductCrossRefTranTypeService {
    private apiUrl = 'fin/api/finance/ProductCrossRefTranType';
    constructor(
        private readonly commonService: CommonService) {
    }

    getProductCrossRefTranType(id: number): Observable<ProductCrossRefTranType> {
        return this.commonService.get<ProductCrossRefTranType>(id, `${this.apiUrl}`);
    }

    getProductCrossRefTranTypes(): Observable<ProductCrossRefTranType[]> {
        return this.commonService.getAll<ProductCrossRefTranType[]>(`${this.apiUrl}`);
    }
    addProductCrossRefTranType(productCrossRefTranType: ProductCrossRefTranType): Observable<number> {
        return this.commonService.postGeneric<ProductCrossRefTranType, number>(`${this.apiUrl}`, productCrossRefTranType);
    }

    editProductCrossRefTranType(productCrossRefTranType: ProductCrossRefTranType): Observable<boolean> {
        return this.commonService.edit(productCrossRefTranType, `${this.apiUrl}`);
    }

    removeProductCrossRefTranType(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiUrl}`);
    }
}
