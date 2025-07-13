import { Injectable } from '@angular/core';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { TravelAuthorisation } from '../models/travel-authorisation';
import { Observable } from 'rxjs';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable({
  providedIn: 'root'
})
export class MedicareTravelauthService {
  private apiUrl = 'med/api/TravelAuthorisation';
  constructor(private readonly commonService: CommonService) { }

  getPagedAuthorisations(personEventId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<TravelAuthorisation>> {
    return this.commonService.getAll<PagedRequestResult<TravelAuthorisation>>(`${this.apiUrl}/GetPagedTravelAuthorisations/${personEventId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${query}`);
  }

  addTravelAuthorisation(travelAuthorisation: TravelAuthorisation): Observable<number> {
    return this.commonService.postGeneric<TravelAuthorisation, number>(`${this.apiUrl}/AddMediCareTravelAuthorisation`, travelAuthorisation);
  }

  editTravelAuthorisation(travelAuthorisation: TravelAuthorisation): Observable<boolean> {
    return this.commonService.edit(travelAuthorisation,`${this.apiUrl}/EditMediCareTravelAuthorisation`);
  }

  deleteTravelAuthorisation(travelAuthorisationId: number) {
    return this.commonService.remove(travelAuthorisationId, `${this.apiUrl}/DeleteTravelAuthorisation`);
  }

  addTravelAuthorisationRejectionComment(travelAuthId: number, comment: string ) {
    return this.commonService.postNonGeneric(`${this.apiUrl}/AddTravelAuthorisationRejectionComment/${travelAuthId}/${comment}`,'');
  }

  getPagedAuthorisationsByAuthorisedPartyId(personEventId: number, authorisedPartyId: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<TravelAuthorisation>> {
    return this.commonService.getAll<PagedRequestResult<TravelAuthorisation>>(`${this.apiUrl}/GetPagedTravelAuthorisationsByAuthorisedParty/${personEventId}/${authorisedPartyId}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${query}`);
  }

  getTebaInvoiceAuthorisations(treatmentFromDate, rolePlayrId: number, personEventId: number): Observable<TravelAuthorisation[]> {
    return this.commonService.getAll<TravelAuthorisation[]>(this.apiUrl + `/GetTebaInvoiceAuthorisations/${treatmentFromDate}/${rolePlayrId}/${personEventId}`);
  }

  getTravelAuthorisation(travelAuthorisationId: number): Observable<TravelAuthorisation> {
    return this.commonService.getAll<TravelAuthorisation>(this.apiUrl + `/GetTravelAuthorisation/${travelAuthorisationId}`);
  }

  isTravelauthInvoiceProcessed(travelAuthorisationId: number, personEventId: number): Observable<boolean> {
    return this.commonService.getAll<boolean>(`${this.apiUrl}/IsTravelauthInvoiceProcessed/${travelAuthorisationId}/${personEventId}`);
  }
}
