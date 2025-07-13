import { Injectable } from "@angular/core";
import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { Observable, Subject, Subscription, forkJoin } from "rxjs";
import { PensCareResponse } from "../../shared-penscare/models/penscare-response.model";
import { PensIncreaseLookups } from "../models/annual-increase-lookups";
import { AnnualIncreaseNotification } from "../models/annual-increase-notification.model";
import { PensIncreaseResponse } from "../models/pension-increase-response";
import { Pagination } from "projects/shared-models-lib/src/lib/pagination/pagination";
import {IncreaseTypeEnum} from '../lib/enums/increase-type-enum';

@Injectable()
export class AnnualIncreaseService {
  private apiUrl = 'pen/api/PensionIncrease';
  private lookupsLoaded = false;
  private lookupsSubscription: Subscription;
  private pensIncreaseLookupsCache: PensIncreaseLookups;
  private emitChangeSource = new Subject<any>();

  constructor(
    private readonly commonService: CommonService,
    private lookupService: LookupService) {
  }

  setPensIncreaseLookupsCache(pensIncreaseLookupsCache: PensIncreaseLookups) {
    this.pensIncreaseLookupsCache = pensIncreaseLookupsCache;
  }

  emitChange(change: string) {
    this.emitChangeSource.next(change);
  }

  getPensCareLookupsCache(): PensIncreaseLookups {
    return this.pensIncreaseLookupsCache;
  }

  loadLookupsCache() {
    if(!this.pensIncreaseLookupsCache) {
      this.lookupsLoaded = true

      let increaseTypes = this.lookupService.getIncreaseTypes();
      let legislativeValues = this.lookupService.getIncreaseLegislativeValues();

      this.lookupsSubscription = forkJoin([increaseTypes,
        legislativeValues
      ]).subscribe(
        responseList => {
          this.setPensIncreaseLookupsCache({
            increaseTypes: responseList[0],
            legislativeValues : responseList[1]
          });
          this.emitChange('lookupsCacheLoaded');
        }
      );
    } else {
      this.emitChange('lookupsCacheLoaded');
    }
  }

  public getIncreases(sortDirection: string, query: string, pagination: Pagination): Observable<PensIncreaseResponse[]> {
    const searchTerm = encodeURIComponent(query)
    return this.commonService.getAll<PensIncreaseResponse[]>(`${this.apiUrl}/GetIncreases/${pagination.pageNumber}/${pagination.pageSize}/${pagination.orderBy}/${sortDirection}/${searchTerm}`);
  }

  public ProcessPensionIncrease(PensIncreaseRequest: AnnualIncreaseNotification): Observable<PensCareResponse> {
    return this.commonService.postGeneric<AnnualIncreaseNotification, PensCareResponse>(`${this.apiUrl}/ProcessPensionIncrease`, PensIncreaseRequest);
  }

  public ValidateBonusEffectiveDate(effectiveDate: string): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/ValidateBonusEffectiveDate/${effectiveDate}`);
  }

  public getAnnualIncreaseNotificationByGazetteId(gazetteId: number): Observable<AnnualIncreaseNotification> {
    return this.commonService.getAll<AnnualIncreaseNotification>(`${this.apiUrl}/getAnnualIncreaseNotification/${gazetteId}/`);
  }

  public getAnnualIncreaseNotificationByTypeAndEffectiveDate(increaseType: IncreaseTypeEnum , effectiveDate: string): Observable<AnnualIncreaseNotification[]> {
      return this.commonService.getAll<AnnualIncreaseNotification[]>(`${this.apiUrl}/getAnnualIncreaseNotificationByTypeAndEffectiveDate/${increaseType}/${effectiveDate}`);
  }
}
