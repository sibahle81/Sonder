import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserDetails } from 'src/app/core/models/security/user-details.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { WizardService } from 'src/app/shared/components/wizard/shared/services/wizard.service';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { UserLoginTypeEnum } from 'src/app/shared/enums/user-login-type.enum';
import { WizardStatus } from 'src/app/shared/enums/wizard-status.enum';
import { Wizard } from 'src/app/shared/models/wizard.model';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.scss']
})
export class CaseListComponent implements OnInit, AfterViewInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public dataSource = new MatTableDataSource<Wizard>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;

  displayedColumns = ['name', 'type', 'createdBy', 'lockedStatus', 'customStatus', 'wizardStatusId', 'overAllSLAHours', 'actions'];
  placeHolder = 'Filter tasks by name, type, created by or status...';
  searchText: string;
  wizardConfigIds = ConstantPlaceholder.BrokerCaseConfigs;
  @Input() title: string;
  @Input() filterOnLinkedItemId: number;
  searchContainsNothing$: BehaviorSubject<boolean> = new BehaviorSubject(true)
  public hasData = false;
  public hidePaginator = true;

  currentUser: UserDetails;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly userService: UserService) {
  }

  ngOnInit() {
    this.title = !this.title ? 'Broker Cases' : this.title;
    this.currentUser = this.authService.getCurrentUser();
    this.getData(this.wizardConfigIds);
  }


  ngAfterViewInit(): void {
    this.isLoading$.next(true);
    this.isData$.subscribe(result => {
      if (!result) {
        this.hasData = false;
        this.setPaginatorFilter(0);
      } else {
        this.setPaginatorFilter(this.dataSource.data.length);
        this.hasData = true;
      }
    })
  }

  formatWizardType(type: string) {
    const temp = type.replace('-', ' ');
    return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
  }

  fillTable(isData) {
    if (isData) {
      this.searchContainsNothing$.next(false);
      this.hidePaginator = false;
    }
  }

  setPaginatorFilter(paginatorLength: number) {
    if (paginatorLength === 0) {
      this.searchContainsNothing$.next(true);
      this.hidePaginator = true;
    } else {
      this.searchContainsNothing$.next(false);
      this.hidePaginator = false;
    }
  }

  onSelect(item: Wizard): void {
    let itemType = item.type;
    Wizard.redirect(this.router, itemType, item.id);
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  searchData(data) {
    this.applyFilter(data);
  }

  getStatusName(row: any): string {
    let status = '';
    switch (row.wizardStatusId) {
      case WizardStatus.InProgress:
        status = 'In Progress';
        break;
      case WizardStatus.AwaitingApproval:
        status = 'Awaiting Approval';
        break;
      default: status = WizardStatus[row.wizardStatusId];
        break;
    }
    return status;
  }


  applyFilter(filterValue: any) {
    this.searchText = filterValue;

    if (this.searchText == '') {
      this.dataSource.paginator.length = this.dataSource.data.length;
    }

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.filteredData.length) {
      this.paginator.length = this.dataSource.filteredData.length;
      this.dataSource.paginator.firstPage();
    }

    this.setPaginatorFilter(this.dataSource.paginator.length);
  }

  getData(wizardConfigIds: string): void {
    this.isLoading$.next(true);

    this.wizardService.GetPortalWizardsByConfigIdsAndCreatedBy(wizardConfigIds, this.currentUser.email).subscribe(
      data => {
        this.getUserDetails(data);
        if (data && this.currentUser.email) {
          this.dataSource.data = data;

          this.searchContainsNothing$.next(false);

          setTimeout(() => {
            if (this.sort) {
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
            }
          })
        }

        this.isLoading$.next(false);
        this.isData$.next(true)
      });
  }

  getUserDetails(data: Wizard[]) {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      this.userService.getUserDetails(item.createdBy).subscribe(user => {
        if (user.userLoginTypeId != UserLoginTypeEnum.RMA) {
          item.wizardStatusText = item.wizardStatusText;
        }
        if (user.userLoginTypeId == UserLoginTypeEnum.RMA && (item.createdDate == item.modifiedDate)) {
          item.wizardStatusText = 'New';
        }
        if (user.userLoginTypeId == UserLoginTypeEnum.RMA && (item.createdDate != item.modifiedDate)) {
          item.wizardStatusText = item.wizardStatusText;
        }
      });
    }
  }

  back() {
    this.router.navigateByUrl('broker-policy-list');
  }
}
