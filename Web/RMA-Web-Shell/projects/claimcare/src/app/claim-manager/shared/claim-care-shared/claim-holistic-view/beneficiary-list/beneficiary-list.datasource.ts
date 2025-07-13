import { Injectable } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { BeneficiaryService } from 'projects/clientcare/src/app/policy-manager/shared/Services/beneficiary.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryListDataSource extends PagedDataSource<RolePlayer> {

  hasBeneficiary$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public beneficiaries: RolePlayer[] = [];
  isSpouse = false;

  constructor(
    private readonly beneficiaryService: BeneficiaryService,
    private readonly rolePlayerService: RolePlayerService,
  ) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'RolePlayerId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);
    if (orderBy.includes('RolePlayerId')) {
      orderBy = 'RolePlayerId';
    }

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'RolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.beneficiaryService.getPagedBeneficiaries(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
    ).subscribe(result => {
      if (result) {
        this.data = result as PagedRequestResult<RolePlayer>;
        if (this.data.data.length > 0) {
          this.data.data = this.data.data;
          this.data.page = pageNumber;
          this.data.pageSize = pageSize;
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
          this.hasBeneficiary$.next(true);
          this.getBeneficiaries(this.data.data);
        } else {
          this.loadingSubject.next(false)
        }
      }
    });
  }

  getBeneficiaries(beneficiaries: RolePlayer[], pageNumber: number = 1, pageSize: number = 5) {
    this.beneficiaries = new Array();
    if (beneficiaries.length >= 0) {
      beneficiaries.forEach(beneficiary => {

        this.rolePlayerService.getVOPDResponseResultByRoleplayerId(beneficiary.rolePlayerId).subscribe(clientVopdResponse => {
          beneficiary.clientVopdResponse = clientVopdResponse;
          if (beneficiary.clientVopdResponse !== null) {
            beneficiary.person.vopdVerifiedDescription = beneficiary.person.isVopdVerified ? 'Verified' : 'Not Verified';
          } else {
            beneficiary.person.vopdVerifiedDescription = 'Not Applicable';
          }
          this.loadingSubject.next(false)
        });
      })
    }
  }

  getWizardData(data: RolePlayer[], pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'RolePlayerId', sortDirection: string = 'desc', query: string = '') {
    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'RolePlayerId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.data = new PagedRequestResult<RolePlayer>()
    this.data.data = data;
    this.data.rowCount = data.length;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;

    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.loadingSubject.next(false)
  }
}
