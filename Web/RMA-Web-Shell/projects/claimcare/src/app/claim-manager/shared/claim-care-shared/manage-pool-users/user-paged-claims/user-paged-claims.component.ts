import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UserPagedClaimsDataSource } from './user-paged-claims.datasource';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';

@Component({
  selector: 'user-paged-claims',
  templateUrl: './user-paged-claims.component.html',
  styleUrls: ['./user-paged-claims.component.css']
})
export class UserPagedClaimsComponent extends UnSubscribe implements OnChanges {

  @Input() user: User;

  @Output() emitClaimCount: EventEmitter<number> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['claimNumber', 'claimStatus', 'liabilityStatus'];

  dataSource: UserPagedClaimsDataSource;
  currentQuery: any;

  constructor(public claimCareService: ClaimCareService) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new UserPagedClaimsDataSource(this.claimCareService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.currentQuery = this.user && this.user.id > 0 ? this.user.id.toString() : 0;
    this.getData();
    this.emitRowCount();
  }

  getData() {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  emitRowCount() {
    this.dataSource.hasData$.subscribe(result => {
      if (result) {
        this.emitClaimCount.emit(this.dataSource.data.rowCount);
      }
    });
  }

  getClaimStatus(id: number) {
    if (!id) { return };
    return this.formatText(ClaimStatusEnum[id]);
  }

  getLiabilityStatus(id: number) {
    return this.formatText(ClaimLiabilityStatusEnum[id]);
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
