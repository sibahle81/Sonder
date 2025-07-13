import { Injectable } from "@angular/core";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { TravelAuthorisation } from "../../models/travel-authorisation";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { MedicareTravelauthService } from "../../services/medicare-travelauth.service";

@Injectable({
  providedIn: 'root'
})

export class TravelAuthListDataSource extends PagedDataSource<TravelAuthorisation> {
  personEventId: number;
    constructor(private readonly medicareTravelAuthService: MedicareTravelauthService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'travelAuthorisationId', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);

      this.personEventId = this.personEventId ? this.personEventId : 0;
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'travelAuthorisationId';
      sortDirection = sortDirection ? sortDirection : 'desc';
      query = query ? query : '';
      
      this.medicareTravelAuthService.getPagedAuthorisations(this.personEventId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.data = result as PagedRequestResult<TravelAuthorisation>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });
    }

    getDataByAuthorisedPartyId(authorisedPartyId: number, pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'travelAuthorisationId', sortDirection: string = 'desc', query: string = '') {
      this.loadingSubject.next(true);

      this.personEventId = this.personEventId ? this.personEventId : 0;
      authorisedPartyId = authorisedPartyId ? authorisedPartyId : 0;
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'travelAuthorisationId';
      sortDirection = sortDirection ? sortDirection : 'desc';
      query = query ? query : '';
      
      this.medicareTravelAuthService.getPagedAuthorisationsByAuthorisedPartyId(this.personEventId, authorisedPartyId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        this.data = result as PagedRequestResult<TravelAuthorisation>;
        this.data.page = pageNumber;
        this.data.pageSize = pageSize;
        this.dataSubject.next(this.data.data);
        this.rowCountSubject.next(this.data.rowCount);
      });
    }

}