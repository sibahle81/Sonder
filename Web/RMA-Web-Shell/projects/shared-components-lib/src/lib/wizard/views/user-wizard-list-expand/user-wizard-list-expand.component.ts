import { Component, OnInit, ElementRef, ViewChild, Input, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardService } from '../../shared/services/wizard.service';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WizardConfiguration } from '../../shared/models/wizard-configuration';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { UntypedFormGroup, UntypedFormBuilder, FormControl } from '@angular/forms';
import { WizardStatus } from '../../shared/models/wizard-status.enum';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UserWizardListExpandDatasource } from './user-wizard-list-expand.datasource';
import { MatDialog } from '@angular/material/dialog';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { UserWizardListPopup } from '../user-wizard-list-popup/user-wizard-list-popup.component';


@Component({
  templateUrl: './user-wizard-list-expand.component.html',
  selector: 'user-wizard-list-expand',
  styleUrls: ['./user-wizard-list-expand.component.css'],
  
})
export class UserWizardListExpandComponent implements OnInit, AfterViewInit {
  displayedColumns = ['select', 'lockedStatus', 'name', 'type', 'createdBy', 'wizardStatusText', 'overAllSLAHours', 'actions'];
  placeHolder = 'Filter tasks by name, type, created by or status...';
  searchText: string;
  currentQuery: any;
  @Input() wizardConfigIds: string;
  @Input() title: string;
  @Input() filterOnLinkedItemId: number;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  @ViewChild('selectUser', { static: true }) selectUser: ElementRef;

  dataSource: UserWizardListExpandDatasource;
  wizardConfiguration: WizardConfiguration[];

  currentUser: string;
  showIfReallocate = true;
  wizardIdToReassign: number;
  wizardType: string;
  wizardStatus: string;
  wizardStatuses: Lookup[];
  lockStatus: string;
  form: UntypedFormGroup;
  previous: boolean;
  usersToReAssign: User[];
  originalUserList: User[];
  selectedUser: number;
  updateSuccess: boolean;
  isLocked: boolean = false;
  LockedToDisplayName: string = '';
  caseAssignArray: any[];

  public lockStatuses = [
    { name: 'All', value: '0' },
    { name: 'Locked', value: 'Locked' },
    { name: 'Unlocked', value: 'Unlocked' }
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    public lookupService: LookupService,
    public wizardService: WizardService,
    public dialog: MatDialog,
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager,
    private readonly userService: UserService,
    private formBuilder: UntypedFormBuilder, ) {
  }

  ngOnInit() {
      this.intializeControls();
       
    this.caseAssignArray = new Array();
  }

  intializeControls()
  {
    this.title = !this.title ? 'My Tasks' : this.title;
    this.currentUser = this.authService.getCurrentUser().username;
    this.dataSource = new UserWizardListExpandDatasource(this.wizardService);
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '', this.wizardConfigIds, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus);
    this.wizardConfigurationService.getWizardConfigurationByIds(this.wizardConfigIds).subscribe(result => {
      this.wizardConfiguration = [];
      this.wizardConfiguration = result;
      this.wizardConfiguration.forEach(x => {
        x.name = x.name.replace(/-/gi," ");
        x.name = x.name.replace(/\b\w/g, (char) => char.toUpperCase());
      });
      if (this.wizardConfiguration.length > 0) {
        if(this.wizardConfiguration.findIndex(wc => wc.name == 'All') == -1){
          this.wizardConfiguration.unshift({ id: 0, name: 'All' } as WizardConfiguration);
        }
      }
    });
    this.getWizardStatuses();
    this.createForm();
  }
 
  openMoreInformation(item: Wizard) {

    this.wizardIdToReassign = item.id;
    const y = item.lockedToUser;
    this.isLocked = !String.isNullOrEmpty(item.lockedToUser);
    if (this.isLocked)
      this.LockedToDisplayName = item.lockedToUserDisplayName;
      
    
  }

  createForm() {
    this.form = this.formBuilder.group({
      type: [null],
      wizardStatus: [null],
      lockStatus: [null]
    });

    this.form.patchValue({
      type: 0,
      wizardStatus: 0,
      lockStatus: '0'
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          } else if (this.currentQuery.length === 0) {
            this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery,this.wizardConfigIds, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus);
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  apply() {
    this.loadData();
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    if(this.wizardType == "0" || this.wizardType == undefined){
      this.wizardType = this.wizardConfigIds;
    }
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery,this.wizardType, this.filterOnLinkedItemId, this.wizardStatus, this.lockStatus);
  }

  typeChanged($event: any) {
    this.wizardType = $event.value;
  }

  wizardStatusChanged($event: any) {
    this.wizardStatus = $event.value;
  }

  lockStatusChanged($event: any) {
    this.lockStatus = $event.value;
  }

  private getWizardStatuses(): void {
    this.lookupService.getWizardStatuses().subscribe(
      data => { this.wizardStatuses = data.sort(); 
        if (this.wizardStatuses.length > 0 && this.wizardStatuses.findIndex(wc => wc.name == 'All') == -1) {
          this.wizardStatuses.unshift({ id: 0, name: 'All' } as Lookup);
        }
      });
  }

  formatWizardType(type: string) {
    const temp = type.replace('-', ' ');
    return temp.replace('-', ' ').replace(/(\b[a-z](?!\s))/g, a => a.toUpperCase());
  }


  onSelect(item: Wizard): void {
    let itemType = item.type;
    if (item.type === 'inter-debtor-transfer' || item.type === 'claims-interbank-transfer') {
      itemType = 'inter-bank-transfer';
    }
    Wizard.redirect(this.router, itemType, item.id);
  }

  clearInput() {
    this.filter.nativeElement.value = String.Empty;
    this.loadData();
  }

  AddCheckedItems(event, item) {
    if (event.checked === true) {
      let valueExist = false;
      for (const value of this.caseAssignArray) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === false) {
        this.caseAssignArray.push(item.id);
      }
    } else if (event.checked === false) {
      let valueExist = false;
      for (const value of this.caseAssignArray) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === true) {
        const index: number = this.caseAssignArray.indexOf(item.id);
        if (index !== -1) {
          this.caseAssignArray.splice(index, 2);
        }
      }
    }
  }

  
  openReAllocateToUsersPopup(): void {
  
    if (this.caseAssignArray.length === 0) {
      this.alertService.error(`No item selected`, 'Unlock / Reassign', true);
      return;
    }
    
    const dialogRef = this.dialog.open(UserWizardListPopup, {
          data: this.caseAssignArray
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'Reassign') {
            this.reset();                       
            this.caseAssignArray = new Array();
          }
        });
      }
     
  reset() {
    this.intializeControls();
  }

}
