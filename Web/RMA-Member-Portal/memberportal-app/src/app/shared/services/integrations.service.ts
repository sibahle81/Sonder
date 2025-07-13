import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { BankAccountTypeEnum } from '../enums/bank-account-type-enum';
import { RootHyphenVerificationResult } from '../models/root-hyphen-verification-result';

@Injectable()
export class IntegrationService {


    constructor(
        private readonly commonService: CommonService) {
    }

    verifyBankAccount(accountNo: string, accountType: BankAccountTypeEnum, branchCode: string, initials: string, lastName: string, idNumber: string): Observable<RootHyphenVerificationResult> {
        const urlQuery1 = encodeURIComponent(accountNo);
        const urlQuery2 = encodeURIComponent(accountType.toString());
        const urlQuery3 = encodeURIComponent(branchCode);
        const urlQuery4 = encodeURIComponent(initials);
        const urlQuery5 = encodeURIComponent(lastName);
        let urlQuery6: string;
        idNumber !== null && idNumber !== undefined ? urlQuery6 = encodeURIComponent(idNumber.replace(/\//g, '')) : encodeURIComponent(idNumber);
        return this.commonService.postWithNoData<RootHyphenVerificationResult>(`${ConstantApi.HyphenApi}/VerifyAccount/${urlQuery1}/${urlQuery2}/${urlQuery3}/${urlQuery4}/${urlQuery5}/${urlQuery6}`);
    }
}
