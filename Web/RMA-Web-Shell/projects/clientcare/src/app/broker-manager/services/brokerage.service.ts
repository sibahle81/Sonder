import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Brokerage } from '../models/brokerage';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { BrokerConsultant } from '../models/broker-consultant';
import { BankAccountTypeEnum } from 'projects/shared-models-lib/src/lib/enums/bank-account-type-enum';
import { RootHyphenVerificationResult } from 'projects/shared-models-lib/src/lib/integrations/root-hyphen-verification-result';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { UserRegistrationDetails } from 'projects/admin/src/app/user-manager/views/member-portal/user-registration-details.model';
import { BrokerageRepresentativeRequest } from '../models/brokerage-representative-request';
import { ProductOptionConfiguration } from '../models/product-option-configuration';

@Injectable()
export class BrokerageService {

    private apiBrokerage = 'clc/api/Broker/Brokerage';
    private apiConfig = 'mdm/api/Configuration/GetModuleSetting';
    private apiHyphen = 'int/api/hyphen';

    constructor(
        private readonly commonService: CommonService) {
    }

    getBrokerages(): Observable<Brokerage[]> {
        return this.commonService.getAll<Brokerage[]>(`${this.apiBrokerage}`);
    }

    getBrokeragesByCoverTypeIds(coverTypes: number[]): Observable<Lookup[]> {
        return this.commonService.postGeneric<number[], Lookup[]>(`${this.apiBrokerage}/getBrokeragesByCoverTypeIds`, coverTypes);
    }

    getFSPNumber(key: string): Observable<string> {
        return this.commonService.get<string>(key, `${this.apiConfig}`);
    }

    getBrokerage(id: number): Observable<Brokerage> {
        return this.commonService.get<Brokerage>(id, `${this.apiBrokerage}`);
    }

    getBrokerageBasicReferenceData(id: number): Observable<Brokerage> {
        return this.commonService.get<Brokerage>(id, `${this.apiBrokerage}/GetBrokerageBasicReferenceData`);
    }

    addBrokerage(brokerage: Brokerage): Observable<number> {
        return this.commonService.postGeneric<Brokerage, number>(`${this.apiBrokerage}`, brokerage);
    }

    editBrokerage(brokerage: Brokerage): Observable<boolean> {
        return this.commonService.edit<Brokerage>(brokerage, `${this.apiBrokerage}`);
    }

    getLastViewedBrokerages(isBinderPartner : boolean = false): Observable<Brokerage[]> {
        return this.commonService.getAll<Brokerage[]>(`${this.apiBrokerage}/LastViewed/${isBinderPartner}`);
    }

    search(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string, isBinderPartnerSearch: boolean): Observable<PagedRequestResult<Brokerage>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<Brokerage>>(`${this.apiBrokerage}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}/${isBinderPartnerSearch}`);
    }

    getFSPNumberFromFsb(fpsNumber: string, brokercode: string): Observable<Brokerage> {
        return this.commonService.getAll<Brokerage>(`${this.apiBrokerage}/GetBrokerageFromFsb/${fpsNumber}/${brokercode}`);
    }

    getAllBrokerConsultants(pageNumber: number, pageSize: number = 5, orderBy: string = 'Id', sortDirection: string = 'asc', query: string = 'Broker Consultant'): Observable<PagedRequestResult<BrokerConsultant>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<BrokerConsultant>>(`${this.apiBrokerage}/GetBrokerConsultants/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    verifyBankAccount(accountNo: string, accountType: BankAccountTypeEnum, branchCode: string, initials: string, lastName: string, idNumber: string): Observable<RootHyphenVerificationResult> {
        const urlQuery1 = encodeURIComponent(accountNo);
        const urlQuery2 = encodeURIComponent(accountType.toString());
        const urlQuery3 = encodeURIComponent(branchCode);
        const urlQuery4 = encodeURIComponent(initials);
        const urlQuery5 = encodeURIComponent(lastName);
        const urlQuery6 = encodeURIComponent(idNumber.replace(/\//g, ''));
        return this.commonService.postWithNoData<RootHyphenVerificationResult>(`${this.apiHyphen}/VerifyAccount/${urlQuery1}/${urlQuery2}/${urlQuery3}/${urlQuery4}/${urlQuery5}/${urlQuery6}`);
    }

    checkBrokerLinkedToMemberPortal(brokerEmail: string): Observable<boolean> {
        if (brokerEmail === '') {
            return of(false);
        }
        return this.commonService.getBoolean(`${this.apiBrokerage}/CheckBrokerLinkedToMemberPortal/${brokerEmail}`);
    }

    linkBrokerToMemberPortal(userRegistrationDetails: UserRegistrationDetails): Observable<boolean> {
        return this.commonService.postGeneric<UserRegistrationDetails, boolean>(`${this.apiBrokerage}/LinkBrokerToMemberPortal`, userRegistrationDetails);
    }

    deLinkBrokerToMemberPortal(userRegistrationDetails: UserRegistrationDetails): Observable<boolean> {
        return this.commonService.postGeneric<UserRegistrationDetails, boolean>(`${this.apiBrokerage}/DeLinkBrokerToMemberPortal`, userRegistrationDetails);
    }

    checkIfBrokerHasActivatedLinkCreated(brokerEmail: string): Observable<boolean> {
        return this.commonService.getBoolean(`${this.apiBrokerage}/CheckIfBrokerHasActivatedLinkCreated/${brokerEmail}`);
    }

    getBrokerageImportRequestDetails(fpsNumber: string): Observable<Brokerage> {
        return this.commonService.getAll<Brokerage>(`${this.apiBrokerage}/GetBrokerageImportRequestDetails/${fpsNumber}`);
    }

    submitFSPDataImportRequest(request: BrokerageRepresentativeRequest): Observable<boolean> {
        return this.commonService.postGeneric<BrokerageRepresentativeRequest, boolean>(`${this.apiBrokerage}/SubmitFSPDataImportRequest`, request);
    }

    getBrokeragesWithAllOption(): Observable<string[]> {
        const results = this.commonService.getAll<string[]>(`${this.apiBrokerage}/GetBrokeragesWithAllOption`);
        return results;
    }

    getBrokerageAndRepresentativesByFSPNumber(fpsNumber: string): Observable<Brokerage> {
        return this.commonService.getAll<Brokerage>(`${this.apiBrokerage}/GetBrokerageAndRepresentativesByFSPNumber/${fpsNumber}`);
    }

    resendUserActivation(activateId: string): Observable<boolean> {
        return this.commonService.getAll<boolean>(`${this.apiBrokerage}/ResendUserActivation/${activateId}`);
    }

    getUserActivateId(brokerEmail: string): Observable<string> {
        return this.commonService.getString(`${this.apiBrokerage}/GetUserActivateId/${brokerEmail}`);
    }

    getBrokersLinkedtoClaims(productOptionName: string): Observable<string[]> {
        return this.commonService.getAll<string[]>(`${this.apiBrokerage}/GetBrokersLinkedtoClaims/${productOptionName}`);
    }

    getProductOptionConfigurationsByOptionTypeId(optionTypeId: number, brokerageId: number, effectiveDate: Date): Observable<ProductOptionConfiguration[]> {
         return this.commonService.getAll<ProductOptionConfiguration[]>(`${this.apiBrokerage}/GetProductOptionConfigurationsByOptionTypeId/${optionTypeId}/${brokerageId}/${effectiveDate.toISOString()}`);
    }

    getProductOptionConfigurationsByBrokerageId(brokerageId: number, effectiveDate: Date): Observable<ProductOptionConfiguration[]> {
        return this.commonService.getAll<ProductOptionConfiguration[]>(`${this.apiBrokerage}/GetProductOptionConfigurationsByBrokerageId/${brokerageId}/${effectiveDate.toISOString()}`);
   }

   getProductOptionConfigurationsByProductOptionId(productOptionId: number, effectiveDate: Date): Observable<ProductOptionConfiguration[]> {
    return this.commonService.getAll<ProductOptionConfiguration[]>(`${this.apiBrokerage}/GetProductOptionConfigurationsByProductOptionId/${productOptionId}/${effectiveDate.toISOString()}`);
  }
}
