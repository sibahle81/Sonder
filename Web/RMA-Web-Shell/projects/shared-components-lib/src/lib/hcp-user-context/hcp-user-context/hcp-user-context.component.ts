import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { HcpUserContextDataSource } from './hcp-user-context.datasource';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CommonFunctionUtility } from 'projects/shared-utilities-lib/src/lib/common-function-utility/common-function-utility';

@Component({
  selector: 'hcp-user-context',
  templateUrl: './hcp-user-context.component.html',
  styleUrls: ['./hcp-user-context.component.css']
})
export class HcpUserContextComponent implements OnChanges {

  @Input() userId: number;
  @Output() contextSelectedEmit = new EventEmitter<UserHealthCareProvider>();
  @Output() closeEmit = new EventEmitter<boolean>();

  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;

  displayedColumns: string[] = ['name', 'practiceNumber', 'actions'];

  selectedHcpUser: UserHealthCareProvider;

  constructor(
    public readonly dataSource: HcpUserContextDataSource,
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
  }

  ngOnChanges() {
    this.search();
  }

  search() {
    this.dataSource.setControls(this.paginator, this.sort);
    this.dataSource.getData(this.authService.getCurrentUser().email);
  }

  formatText(text: string): string {
    return CommonFunctionUtility.formatText(text);
  }

  contextSelected(hcpUser: UserHealthCareProvider) {
    this.selectedHcpUser = hcpUser;
    this.contextSelectedEmit.emit(this.selectedHcpUser);
  }

  close() {
    this.closeEmit.emit();
  }

}
