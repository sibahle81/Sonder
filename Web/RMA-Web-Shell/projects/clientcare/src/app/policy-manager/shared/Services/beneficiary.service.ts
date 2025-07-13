import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Beneficiary } from '../entities/beneficiary';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayer } from '../entities/roleplayer';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class BeneficiaryService {

    private apiBeneficiary = 'clc/api/Policy/Beneficiary';
    private apiBeneficiaryType = 'mdm/api/BeneficiaryType';
    private rolePlayerApi = 'clc/api/RolePlayer/RolePlayer';

    constructor(private readonly commonService: CommonService) {
    }

    getBeneficiary(id: number): Observable<Beneficiary> {
        return this.commonService.get<Beneficiary>(id, `${this.apiBeneficiary}`);
    }

    getBeneficiaryTypes(): Observable<Lookup[]> {
        return this.commonService.getAll<Lookup[]>(`${this.apiBeneficiaryType}`);
    }

    getBeneficiaries(): Observable<Beneficiary[]> {
        return this.commonService.getAll<Beneficiary[]>(`${this.apiBeneficiary}`);
    }

    getBeneficiariesByInsuredLife(insuredLifeId: number): Observable<Beneficiary[]> {
        return this.commonService.get<Beneficiary[]>(insuredLifeId, `${this.apiBeneficiary}/ByInsuredLife`);
    }

    getBeneficiariesByPolicy(policyId: number): Observable<Beneficiary[]> {
        return this.commonService.get<Beneficiary[]>(policyId, `${this.apiBeneficiary}/ByPolicy`);
    }

    addBeneficiary(beneficiary: Beneficiary): Observable<number> {
        return this.commonService.postGeneric<Beneficiary, number>(`${this.apiBeneficiary}`, beneficiary);
    }

    editBeneficiary(beneficiary: Beneficiary): Observable<boolean> {
        return this.commonService.edit<Beneficiary>(beneficiary, `${this.apiBeneficiary}`);
    }

    removeBeneficiary(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiBeneficiary}`);
    }

    getPagedBeneficiaries(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayer>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<RolePlayer>>(`${this.rolePlayerApi}/GetPagedBeneficiaries/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }
}
