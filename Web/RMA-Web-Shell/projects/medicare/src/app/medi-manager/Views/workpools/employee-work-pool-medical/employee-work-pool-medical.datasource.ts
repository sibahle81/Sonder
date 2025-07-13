import { Injectable } from "@angular/core";
import { ClaimCareService } from "projects/claimcare/src/app/claim-manager/Services/claimcare.service";
import { ClaimPool } from "projects/claimcare/src/app/claim-manager/shared/entities/funeral/ClaimPool";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { PagedDataSource } from "projects/shared-utilities-lib/src/lib/datasource/pagedDataSource";
import { BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { MedicareWorkPool } from "../../../models/medicare-workpool";
import { MediCarePreAuthService } from "projects/medicare/src/app/preauth-manager/services/medicare-preauth.service";

@Injectable({
    providedIn: 'root'
  })
  export class EmployeeWorkPoolMedicalDataSource extends PagedDataSource<MedicareWorkPool> {
  
    isLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    hasMedicareWorkPool: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
    poolName = '';
    loggedInUserId = 0;
    selectedWorkPool = 0;
    selectedUserId: string;
    isUserBox = false;
   poolUserId = 0;
  
    constructor(
        private readonly mediCarePreAuthService: MediCarePreAuthService) {
      super();
    }
  
    getData( pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PreAuthId', sortDirection: string = 'Desc', query: string = '') {
      this.loadingSubject.next(true);
  
      pageNumber = pageNumber ? pageNumber : 1;
      pageSize = pageSize ? pageSize : 5;
      orderBy = orderBy ? orderBy : 'PreAuthId';
      sortDirection = sortDirection ? sortDirection : 'Desc';
      query = query ? query : '';

      this.selectedUserId = !this.selectedUserId || this.selectedUserId == '' || this.selectedUserId == 'Unassigned' ? '-1' : this.selectedUserId == 'MainPool' ? '-2' : this.selectedUserId;

      this.mediCarePreAuthService.getMedicareWorkPool(pageNumber, pageSize, orderBy, sortDirection, query, this.selectedUserId, this.loggedInUserId, this.selectedWorkPool, this.isUserBox).pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      ).subscribe(result => {
        if (result) {
          this.data = result as PagedRequestResult<MedicareWorkPool>;
          this.data.page = pageNumber;
          this.data.pageSize = pageSize;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
          this.isLoaded$.next(true);
          this.loadingSubject.next(false);
          this.hasMedicareWorkPool.next(true);
        }
      });
    }
  }
  