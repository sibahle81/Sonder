import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { BenefitImportRequest } from "../../models/benefit-import-request";

@Injectable({
    providedIn: 'root'
})
export class BenefitImportService {

    private apiBenefitUrl = 'clc/api/Product/ProductOption';

    constructor(private readonly commonService: CommonService) { }

    importBenefits(request: BenefitImportRequest): Observable<number> {
        const url = `${this.apiBenefitUrl}/ImportBenefits`;
        return this.commonService.postGeneric<BenefitImportRequest, number>(url, request);
    }
}