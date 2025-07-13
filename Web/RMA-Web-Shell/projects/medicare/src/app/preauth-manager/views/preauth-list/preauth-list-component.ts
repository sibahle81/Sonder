import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service'
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { PreAuthorisationListDataSource } from '../../datasources/preauth-list-datasource';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PreAuthStatus } from 'projects/medicare/src/app/medi-manager/enums/preauth-status-enum';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { CrudActionType } from '../../../shared/enums/crud-action-type';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicareMedicalInvoiceCommonService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { isNullOrUndefined } from 'util';
import { PreauthDeleteModalComponent } from '../../modals/preauth-delete-modal/preauth-delete-modal.component';

@Component({
  selector: 'preauth-list-component',
  templateUrl: './preauth-list-component.html',
  styleUrls: ['./preauth-list-component.css'],
})

export class PreauthListComponent implements OnInit, AfterViewInit {
  preAuthorisationList: any;
  displayedColumns: string[] = ['personEventId', 'preAuthNumber', 'healthCareProviderName', 'practiceNumber', 'dateAuthorisedFrom', 'dateAuthorisedTo', 'dateAuthorised', 'requestComments', 'preAuthStatus', 'actions'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  dataSource: PreAuthorisationListDataSource;

  canView: boolean;
  canEdit: boolean;
  canReview: boolean;
  canDelete: boolean;
  canAdd: boolean;
  isInternalUser = false;
  healthCareProviderId = 0;
  personEventId: number;

  @Input() searchByHealthCareProvider: boolean = false;
  @Input() claimId: number = 0;
  @Input() preAuthType: PreauthTypeEnum ;
  @Input() header: string = 'PreAuthorisations';
  @Input() selectedPreAuthId = 0;
  @Input() isWizard = false;

  constructor(
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly authService: AuthService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly userService: UserService,
    public dialog: MatDialog,
    private readonly wizardService: WizardService) {
      this.getRouteData() 
     }

    
  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(preauthorisation: PreAuthorisation) {
    this.menus = []
    this.menus = [
      {
        title: 'Add', url: '',
        disable: (preauthorisation.preAuthStatus == PreAuthStatus.ClaimUndecided || preauthorisation.isDeleted || this.isWizard) ? true : false
      },
      {
        title: 'Edit', url: '',
        disable: (preauthorisation.preAuthStatus == PreAuthStatus.Rejected ||
          preauthorisation.preAuthStatus == PreAuthStatus.ClaimUndecided || preauthorisation.isDeleted || this.isWizard) ? true : false
      },
      {
        title: 'View', url: '',
        disable: false
      },
      {
        title: 'Review', url: '',
        disable: (preauthorisation.preAuthStatus == PreAuthStatus.Authorised ||
          preauthorisation.preAuthStatus == PreAuthStatus.Rejected ||
          preauthorisation.preAuthStatus == PreAuthStatus.ClaimUndecided || preauthorisation.isDeleted || this.isWizard || !this.isInternalUser) ? true : false
      }           
    ];

    if(!preauthorisation.isDeleted &&  this.canDelete && preauthorisation.preAuthStatus == PreAuthStatus.Authorised){
      this.menus.push(
        {
        title: 'Delete', url: '',
        disable: (preauthorisation.preAuthStatus != PreAuthStatus.Authorised &&
          preauthorisation.preAuthStatus != PreAuthStatus.PendingReview) ? true : false
        } 
      );
    }
  }

    onMenuItemClick(preauthorisation: PreAuthorisation, menu: any): void {
      switch (menu.title) {
        case 'View':
          this.onSelect(preauthorisation);
          break;
        case 'Edit':
          this.editPreAuthWizard(preauthorisation);
          break;
        case 'Review':
          this.reviewPreAuthWizard(preauthorisation);
          break;
        case 'Add':
          this.addPreAuthWizard(preauthorisation);
          break;
        case 'Delete':
          this.validateInvoiceStatus(preauthorisation);
          break;
      }
  
    }

  ngOnInit() {
    this.setPermissions();
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
    this.dataSource = new PreAuthorisationListDataSource(this.mediCarePreAuthService);
    this.paginator.pageIndex = 0;
    if(this.searchByHealthCareProvider)
    {
      this.getUserPractitioner(currentUser);
    }
    else
    {
      this.loadData();
    }
  }

  getUserPractitioner(currentUser: User): void {
    this.userService.getUserHealthCareProviders(currentUser.email).subscribe((result) => {
      if (result.length > 0) {
        this.healthCareProviderId = result[0].healthCareProviderId;
      }
      else
      {
        this.healthCareProviderId = 0;
      }
      this.loadData();
    });
  }

  setPermissions(): void {
    const permissions = this.authService.getCurrentUserPermissions();
    this.canView = permissions.find(permission => permission.name === 'View PreAuthorisation') != null;
    this.canEdit = permissions.find(permission => permission.name === 'Edit PreAuthorisation') != null;
    this.canReview = permissions.find(permission => permission.name === 'Review PreAuthorisation') != null;
    this.canDelete = permissions.find(permission => permission.name === 'Delete PreAuthorisation') != null;
    this.canAdd = permissions.find(permission => permission.name === 'Add PreAuthorisation') != null;
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();
  }

  loadData(): void {
    let queryData = new PreAuthorisation;
    if(this.searchByHealthCareProvider)
    {
      queryData.claimId = this.claimId;
      queryData.healthCareProviderId = this.healthCareProviderId,
      queryData.preAuthType = this.preAuthType;
    }
    else
    {
      queryData.createdBy = this.authService.getUserEmail();
    }
    
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, JSON.stringify(queryData));
  }

  onSelect(item: PreAuthorisation): void {
    let redirectUrl :string = MedicareUtilities.preAuthWizardType(item.preAuthType, CrudActionType.read);
    this.router.navigate(['/medicare/'+`${redirectUrl}`, item.preAuthId]);
  }

  getRouteData() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params?.id) {
        this.personEventId = params.id;
      }
    });
  }
  
  onDelete(item: PreAuthorisation) {
    const dialogRef = this.dialog.open(PreauthDeleteModalComponent, {
      width: '75%',
      data:{ preauthDataClicked : item, header: this.header}
    }).afterClosed()
      .subscribe((response) => {
        if (response) {
          this.loadData();
        }
      });
  }

  validateInvoiceStatus(item: PreAuthorisation){
    this.medicareMedicalInvoiceCommonService.isPreauthInvoiceProcessed(item.preAuthId).subscribe(invoiceStatus => {
        if(invoiceStatus){
          this.confirmservice.confirmWithoutContainer(' Delete Authorisation', 'This claim has paid invoices, Are you sure you want to delete ' + item.preAuthNumber + '?', 'Center', 'Center', 'Yes', 'No').subscribe(
            result => {
                if (result === true) {
                    this.onDelete(item);
                }
            });
        } else{
          this.onDelete(item);
        }
     });
  }  

  addPreAuthWizard(item: PreAuthorisation) {
    if (isNullOrUndefined(item))
      item = new PreAuthorisation()
    item.claimId = this.claimId
    item.preAuthType = this.preAuthType
    item.personEventId = this.personEventId
    let startWizardRequest = new StartWizardRequest();
    startWizardRequest.data = JSON.stringify(item);
    startWizardRequest.linkedItemId = item.preAuthId;

    if (item.preAuthType == PreauthTypeEnum.Prosthetic) {
      startWizardRequest.type = MedicareUtilities.preAuthWizardType(PreauthTypeEnum.Prosthetic, CrudActionType.link);
    }
    else {
      startWizardRequest.type = MedicareUtilities.preAuthWizardType(item.preAuthType, CrudActionType.create);
    }

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl('medicare/' + `${startWizardRequest.type}` + '/continue/' + `${wizard.id}`);
      })
  }

  reviewPreAuthWizard(preAuthorisation: PreAuthorisation) {
    let startWizardRequest = new StartWizardRequest();
    let wizardModel = new PreAuthorisation();
    wizardModel.preAuthId = preAuthorisation.preAuthId;
    wizardModel.claimId = this.claimId
    wizardModel.preAuthType = this.preAuthType
    wizardModel.personEventId = this.personEventId
    startWizardRequest.type = MedicareUtilities.preAuthWizardType(preAuthorisation.preAuthType, CrudActionType.review);
    wizardModel.preAuthId = preAuthorisation.preAuthId;
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = preAuthorisation.preAuthId;
    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
      });
  }

  editPreAuthWizard(preAuthorisation: PreAuthorisation) {
    let startWizardRequest = new StartWizardRequest();
    let wizardModel = new PreAuthorisation();
    wizardModel.claimId = this.claimId
    wizardModel.preAuthType = this.preAuthType
    wizardModel.personEventId = this.personEventId
    wizardModel.preAuthId = preAuthorisation.preAuthId;
    startWizardRequest.type = MedicareUtilities.preAuthWizardType(preAuthorisation.preAuthType, CrudActionType.edit);
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = preAuthorisation.preAuthId;
    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
      });
  }

  getPreauthStatus(preAuthStatus: number): string {
    return PreAuthStatus[preAuthStatus];
  }

  showReview(preAuthStatus: number) {
    if (PreAuthStatus.Authorised === preAuthStatus)
      return false;
    else
      return true;
  }

  showEdit(preAuthorisation: PreAuthorisation) {
    if (this.isInternalUser) {
      if (preAuthorisation.isRequestFromHcp && PreAuthStatus.Authorised === preAuthorisation.preAuthStatus)
        return true;
      else if (!preAuthorisation.isRequestFromHcp && PreAuthStatus.Deleted === preAuthorisation.preAuthStatus)
        return true;
      else
        return false;
    }
    else {
      if (preAuthorisation.isRequestFromHcp && PreAuthStatus.InfoRequired === preAuthorisation.preAuthStatus)
        return true;
      else
        return false;
    }
  }

  highlightSelectedRecord(row: PreAuthorisation) {
    this.selectedPreAuthId = row.preAuthId;
  }
}
