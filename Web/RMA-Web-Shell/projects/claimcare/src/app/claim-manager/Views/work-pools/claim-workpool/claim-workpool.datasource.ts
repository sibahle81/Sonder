import { Injectable } from '@angular/core';
import { WorkPoolModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { WorkPoolsAndUsersModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';

@Injectable({
  providedIn: 'root'
})
export class ClaimWorkpoolDataSource extends PagedDataSource<WorkPoolModel> {

  workPoolsAndUsersModels: WorkPoolsAndUsersModel[];
  workPoolId: number;
  userId: number;
  selectedUserId: number;
  isSearching = false;

  constructor(
    private readonly service: ClaimCareService) {
    super();
    this.loadingSubject.next(false);
  }

  clearData(): void {
    this.dataSubject.next(new Array());
  }

  getClaimsWorkPoolDataPaged(workPoolId: number, userId: number,selectedUserId: number, pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'WizardId', sortDirection: string = 'asc', query: string = ''): void {
    this.workPoolId = workPoolId;
    this.userId = userId;
    this.selectedUserId = selectedUserId;
    this.getData(pageNumber, pageSize, orderBy, sortDirection, query);
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'WizardId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'WizardId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    this.selectedUserId = this.selectedUserId  ? this.selectedUserId  : 0;
    this.service.getClaimWorkPoolsPaged(this.workPoolId, this.userId,this.selectedUserId, pageNumber, pageSize, orderBy, sortDirection, query).subscribe(workPools => {
      this.data = workPools
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.loadingSubject.next(false);
      this.isSearching = false;
    });
  }

  // Returning an empty list from back-end
  getSourceData(query: any): void {
    this.loadingSubject.next(true);
    this.service.getFuneralClaimsForLoggedInUser().subscribe(workPools => {
      this.dataSubject.next(workPools);
      this.loadingSubject.next(false);
    });
  }

  // Not being implemented in the back-end
  getClaimsForSelectedWorkPool(query: any): void {
    this.loadingSubject.next(true);
    this.service.getClaimsForWorkPool(query).subscribe(workPools => {
      this.dataSubject.next(workPools);
      this.loadingSubject.next(false);
    });
  }

  // Populating the Dropdown boxes
  getWorkPoolsForUser(query: any): WorkPoolsAndUsersModel[] {
    this.service.getWorkPoolsForUser(query).subscribe(res => {
      this.workPoolsAndUsersModels = res;
    });
    return this.workPoolsAndUsersModels;
  }
}
