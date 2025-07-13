import { Injectable } from '@angular/core';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

import { PremiumListingService } from '../shared/Services/premium-listing.service';
import { PremiumListingMember } from '../shared/entities/premium-listing-member';

import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class PremiumListingMemberDatasource extends PagedDataSource<PremiumListingMember> {

  isLoading: boolean = false;

  constructor(
    private readonly premiumListingService: PremiumListingService,
  ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 10, fileIdentifier: string = '') {
    this.isLoading = true;
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 10;
    this.premiumListingService.getPremiumListingMembers(pageNumber, pageSize, fileIdentifier).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      result => {
        if (result) {
          this.data = result as PagedRequestResult<PremiumListingMember>;
          if (this.data.data) {
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
          }
        }
        this.isLoading = false;
      }
    );
  }

  resetData() {
    this.data.data = [];
    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(0);
  }
}
