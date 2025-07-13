import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { MedicalWorkPoolModel } from 'projects/medicare/src/app/medi-manager/models/medical-work-pool.model';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PreAuthWorkpoolDataSource extends PagedDataSource<MedicalWorkPoolModel> {

  workPoolsAndUsersModels: WorkPoolsAndUsersModel[];
  workPoolId: number;
  userId: number;
  isSearching = false;

  constructor(
    private readonly mediCarePreAuthService: MediCarePreAuthService) {
    super();
    this.loadingSubject.next(false);
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }


  getMedicalWorkPoolData(workPoolId: number, userId: number, pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PA.PreAuthId', sortDirection: string = 'asc', query: string = ''): void {
    this.workPoolId = workPoolId;
    this.userId = userId;
    this.getData(pageNumber, pageSize, orderBy, sortDirection, query);
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'PA.PreAuthId', sortDirection: string = 'asc', query: string = ''): PagedRequestResult<MedicalWorkPoolModel> {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'PA.PreAuthId';
    sortDirection = sortDirection ? sortDirection : 'asc';
    this.mediCarePreAuthService.getMedicalWorkPoolForLoggedInUser(this.workPoolId, this.userId, pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<MedicalWorkPoolModel>;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
    });
    return this.data;
  }

  getClaimsForWorkPoolAndUser(workPoolId: number, userId: number, pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Wizard.Id', sortDirection: string = 'desc', query: string = ''): void {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'PA.PreAuthId';
    sortDirection = sortDirection ? sortDirection : 'desc';
  }

  // Returning an empty list from back-end
  getSourceData(query: any): void {
    this.loadingSubject.next(true);
  }

  // Not being implemented in the back-end
  getClaimsForSelectedWorkPool(query: any): void {
    this.loadingSubject.next(true);
  }

  // Populating the Dropdown boxes
  getWorkPoolsForUser(query: any): WorkPoolsAndUsersModel[] {
    return this.workPoolsAndUsersModels;
  }
}
