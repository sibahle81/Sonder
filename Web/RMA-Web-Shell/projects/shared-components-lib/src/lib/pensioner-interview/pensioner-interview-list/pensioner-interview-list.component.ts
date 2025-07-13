import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PagedParams } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/paged-parameters';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { PensionerInterviewListDataSource } from './pensioner-interview-list.datasource';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';

@Component({
  selector: 'pensioner-interview-list',
  templateUrl: './pensioner-interview-list.component.html',
  styleUrls: ['./pensioner-interview-list.component.css']
})
export class PensionerInterviewListComponent extends UnSubscribe implements OnChanges {

  @Input() personEvent: PersonEventModel;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PensionerInterviewListDataSource;
  currentQuery: any;
  params = new PagedParams();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  constructor() {
    super();
   }

  ngOnChanges() {
    if (this.personEvent) {
      this.currentQuery = this.personEvent.rolePlayer.rolePlayerId;
      this.setPaginatorOnSortChanges();
      this.getData();
    }
  }

  setPaginatorOnSortChanges() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new PensionerInterviewListDataSource();
    this.dataSource.rowCount$.subscribe((count) => this.paginator.length = count);
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery);
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'createdDate';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'name', show: true },
      { def: 'designation', show: true },
      { def: 'interviewDate', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  showDetail($event: any, actionType: any, readOnly: boolean) {
  }

  onRemove($event: any, actionType: any) {
  }
}
