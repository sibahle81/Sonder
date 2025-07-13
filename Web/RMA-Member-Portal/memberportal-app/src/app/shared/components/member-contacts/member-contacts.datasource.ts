import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';
import { PagedDataSource } from 'src/app/shared-utilities/datasource/pagedDataSource';
import { RolePlayerContact } from '../../models/roleplayer-contact';
import { RolePlayerService } from '../../services/roleplayer.service';

@Injectable({
  providedIn: 'root'
})
export class MemberContactsDataSource extends PagedDataSource<RolePlayerContact> {

  isContactsLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly rolePlayerService: RolePlayerService) {
    super();
  }

  getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'RolePlayerContactId', sortDirection: string = 'desc', query: string = '') {
    this.loadingSubject.next(true);

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'RolePlayerContactId';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.rolePlayerService.getPagedRolePlayerContacts(pageNumber, pageSize, orderBy, sortDirection, query).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(result => {
      this.data = result as PagedRequestResult<RolePlayerContact>;
      this.data.page = pageNumber;
      this.data.pageSize = pageSize;
      this.dataSubject.next(this.data.data);
      this.rowCountSubject.next(this.data.rowCount);
      this.isContactsLoaded$.next(true);
    });
  }

  getWizardData(data: RolePlayerContact[], pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'Title', sortDirection: string = 'desc', query: string = '') {

    pageNumber = pageNumber ? pageNumber : 1;
    pageSize = pageSize ? pageSize : 5;
    orderBy = orderBy ? orderBy : 'Title';
    sortDirection = sortDirection ? sortDirection : 'desc';
    query = query ? query : '';

    this.data = new PagedRequestResult<RolePlayerContact>();
    this.data.data = data;
    this.data.rowCount = data.length;
    this.data.page = pageNumber;
    this.data.pageSize = pageSize;

    this.dataSubject.next(this.data.data);
    this.rowCountSubject.next(this.data.rowCount);
    this.loadingSubject.next(false);
    this.isContactsLoaded$.next(true);
  }

  filterData(data: any){
    this.dataSubject.next(data);
    this.rowCountSubject.next(data.length);
  }
}
