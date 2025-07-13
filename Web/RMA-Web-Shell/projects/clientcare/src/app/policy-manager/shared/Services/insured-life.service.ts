import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InsuredLife } from '../entities/insured-life';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PolicyInsuredLife } from '../entities/policy-insured-life';

@Injectable()
export class InsuredLifeService {

    private apiInsuredLife = 'clc/api/Policy/InsuredLife';

    constructor(private readonly commonService: CommonService) {
    }

    getInsuredLife(id: number): Observable<InsuredLife> {
        return this.commonService.get<InsuredLife>(id, `${this.apiInsuredLife}`);
    }

    getInsuredLives(): Observable<InsuredLife[]> {
        return this.commonService.getAll<InsuredLife[]>(`${this.apiInsuredLife}`);
    }

    addInsuredLife(insuredLife: InsuredLife): Observable<number> {
        return this.commonService.postGeneric<InsuredLife, number>(`${this.apiInsuredLife}`, insuredLife);
    }

    editInsuredLife(insuredLife: InsuredLife): Observable<boolean> {
        return this.commonService.edit<InsuredLife>(insuredLife, `${this.apiInsuredLife}`);
    }

    removeInsuredLife(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiInsuredLife}`);
    }

    getInsuredLivesByPolicy(policyId: number): Observable<InsuredLife[]> {
        return this.commonService.get<InsuredLife[]>(policyId, `${this.apiInsuredLife}/ByPolicy`);
    }

    getPolicyInsuredLives(policyId: number): Observable<PolicyInsuredLife[]> {
        return this.commonService.get<PolicyInsuredLife[]>(policyId, `${this.apiInsuredLife}/GetPolicyInsuredLives`);
    }

    searchInsuredLives(policyId: number, query: string): Observable<InsuredLife[]> {
        return this.commonService.getAll<InsuredLife[]>(`${this.apiInsuredLife}/SearchByPolicyId/${policyId}/${query}`);
    }

    searchInsuredLivesByType(type: string): Observable<InsuredLife[]> {
        return this.commonService.getAll<InsuredLife[]>(`${this.apiInsuredLife}/SearchInsuredLives/${type}`);
    }

    InsuredLifeLastViewed(policyId: number): Observable<InsuredLife[]> {
        return this.commonService.getAll<InsuredLife[]>(`${this.apiInsuredLife}/PolicyLastViewed/${policyId}`);
    }

    generateReferenceNumber(policyId: number): Observable<string> {
        return this.commonService.getString(`${this.apiInsuredLife}/GenerateReference/${policyId}`);
    }

    cancelInsuredLives(): Observable<boolean> {
        return this.commonService.getAll(`${this.apiInsuredLife}/AutoCancel`);
    }

    getCoverAmount(insuredLife: InsuredLife): Observable<number> {
        let apiUrl = 'CoverAmount/';
        if (insuredLife.idNumber) {
            apiUrl += `Idnumber/${insuredLife.idNumber}`;
        } else
            if (insuredLife.passportNumber) {
                apiUrl += `Passport/${insuredLife.passportNumber}`;
            }
        return this.commonService.getAll(`${this.apiInsuredLife}/${apiUrl}`);
    }
}
