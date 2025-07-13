import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TravelAuthorisedPartyEnum } from 'projects/shared-models-lib/src/lib/enums/travel-authorised-party-enum';
import { TravelAuthListDataSource } from './travel-auth-list.datasource';
import { MedicareTravelauthService } from '../../services/medicare-travelauth.service';
import { MatDialog } from '@angular/material/dialog';
import { ManageTravelAuthComponent } from '../manage-travel-auth/manage-travel-auth.component';
import { AuthorisedPartyEnum } from '../../models/authorised-party-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { TravelAuthorisation } from '../../models/travel-authorisation';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MedicareMedicalInvoiceCommonService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { switchMap } from 'rxjs/operators';
import { TravelauthDeleteModalComponent } from '../../modals/travelauth-delete-modal/travelauth-delete-modal.component';

@Component({
  selector: 'app-travel-auth-list',
  templateUrl: './travel-auth-list.component.html',
  styleUrls: ['./travel-auth-list.component.css']
})
export class TravelAuthListComponent extends PermissionHelper implements OnInit {
  @Input() personEventId = 0;
  @Input() header: string = 'Travel Authorisations';
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  canEdit: boolean;
  canAdd: boolean;

  permissions = {
    createTravelAuth: 'Create Travel Authorisation',
    editTravelAuth: 'Edit Travel Authorisation'
  };

  dataSource: TravelAuthListDataSource;
  pageLength: number;
  loading$ = new BehaviorSubject<boolean>(false);
  form: any;
  authorisedParties: TravelAuthorisedPartyEnum[];
  searchTerm = '';
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isInternalUser = true;
  personEvent: PersonEventModel;
  eventModel: EventModel;

   menus: { title: string; action: string; disable: boolean }[];
  
  constructor(
      private dialog: MatDialog,
      private readonly formBuilder: FormBuilder,
      private readonly medicareTravelAuthService: MedicareTravelauthService,
      readonly confirmservice: ConfirmationDialogsService,
    private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
      private readonly authService: AuthService,
      private readonly claimCareService: ClaimCareService,
       private readonly alertService: AlertService
  ) {
      super();
      this.dataSource = new TravelAuthListDataSource(this.medicareTravelAuthService);
  }

  ngOnInit() {
    this.isInternalUser = this.authService.getCurrentUser().isInternalUser;
    this.createForm();
    this.authorisedParties = this.ToArray(TravelAuthorisedPartyEnum);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    this.dataSource.personEventId = this.personEventId;
    this.getData();
    this.loadPersonEventData();
  }

  private loadPersonEventData() {
    if (this.personEventId > 0) {
      this.claimCareService.getPersonEvent(this.personEventId).pipe(
        switchMap(personEvent => {
          this.personEvent = personEvent;
          return this.claimCareService.getEvent(personEvent.eventId);
        })
      ).subscribe(eventModel => {
        this.eventModel = eventModel;
      });
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      authorisedPartyControl: [{ value: null, disabled: false }]
    });
  }

  addNewTravelAuth(): void {
    const dialogRef = this.dialog.open(ManageTravelAuthComponent, {
      width: '1000px',
      disableClose: true,
      data: { 
        personEvent: this.personEvent, 
        eventModel: this.eventModel,
        travelAuthorisation: null,
        action: null
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSaving$.next(true);
        this.medicareTravelAuthService.addTravelAuthorisation(result).subscribe(() => {
          this.getData();
          this.isSaving$.next(false);
          this.alertService.success('Travel Authorisation added successfully');
        });
      } else {
        this.isSaving$.next(false);
      }
    });
  }

  viewOrEditTravelAuth(travelAuth, action: string): void {
    const dialogRef = this.dialog.open(ManageTravelAuthComponent, {
      width: '1000px',
      disableClose: true,
      data: { 
        personEvent: this.personEvent, 
        eventModel: this.eventModel,
        travelAuthorisation: travelAuth,
        action: action 
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isSaving$.next(true);
        this.medicareTravelAuthService.editTravelAuthorisation(result).subscribe(() => {
          this.getData();
          this.isSaving$.next(false);
          this.alertService.success('Travel Authorisation updated successfully');
        });
      }
      this.isSaving$.next(false);
    });
  }

  filterByAuthorisedParty(travelAuthorisedParty: TravelAuthorisedPartyEnum) {
    this.form.patchValue({
      authorisedPartyControl: travelAuthorisedParty
    });
    this.getData(+TravelAuthorisedPartyEnum[travelAuthorisedParty]);
  }

  reset() {
    this.loading$.next(true);
    this.getData();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getAuthorisedParty(id: number): string {
      return this.formatText(AuthorisedPartyEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getData(authorisedPartyId?: number, fromPaginationOrSorting = false) {
    this.loading$.next(true);
    if (authorisedPartyId <= 0 && fromPaginationOrSorting) {
      authorisedPartyId = this.form && this.form.get("authorisedPartyControl") && this.form.get("authorisedPartyControl").value ?
                                                 +TravelAuthorisedPartyEnum[this.form.get("authorisedPartyControl").value] : 0;
    }
    if (authorisedPartyId > 0) {
      this.dataSource.getDataByAuthorisedPartyId(authorisedPartyId, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    } else {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
  }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'TravelAuthorisationId', show: true },
      { def: 'TravelAuthorisedPartyId', show: true },
      { def: 'DateAuthorisedFrom', show: true },
      { def: 'DateAuthorisedTo', show: true },
      { def: 'AuthorisedKm', show: true },
      { def: 'AuthorisedRate', show: true },
      { def: 'AuthorisedAmount', show: true },
      { def: 'actions', show: true }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  filterMenu(travelAuthorisation: TravelAuthorisation) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false }
      ]
      if(travelAuthorisation.isDeleted){
        this.menus.push({ title: 'Edit', action: 'edit', disable: true });
      }
      else if(!travelAuthorisation.isDeleted){
        this.menus.push(
           { title: 'Edit', action: 'edit', disable: !this.userHasPermission(this.permissions.editTravelAuth) }
        );
        this.menus.push(
          {title: 'Delete', action: 'delete', disable: false } 
        );
      }
    }

  setPermissions(): void {
    const permissions = this.authService.getCurrentUserPermissions();
    this.canEdit = permissions.find(permission => permission.name === 'Edit Travel Authorisation') != null;
    this.canAdd = permissions.find(permission => permission.name === 'Create Travel Authorisation') != null;
  }

  onMenuSelect(item: any, menu: any) {
    switch (menu) {
      case 'View':
        this.viewOrEditTravelAuth(item, menu);
        break;
      case 'Edit':
        this.viewOrEditTravelAuth(item, menu);
        break;
      case 'Delete':
        this.validateInvoiceStatus(item);
        break;
    }
  }

  onDelete(item: TravelAuthorisation) {
    const dialogRef = this.dialog.open(TravelauthDeleteModalComponent, {
      width: '75%',
      data:{ travelauthDataClicked : item, header: this.header}
    }).afterClosed()
      .subscribe((response) => {
        if (response) {
          this.getData();
        }
      });
  }

  validateInvoiceStatus(item: TravelAuthorisation){
      this.medicareTravelAuthService.isTravelauthInvoiceProcessed(item.travelAuthorisationId, item.personEventId).subscribe(invoiceStatus => {
          if(invoiceStatus){
            this.confirmservice.confirmWithoutContainer(' Delete Travel Authorisation', ' There are Paid invoices , Are you still want to delete ' + item.travelAuthNumber + '?', 'Center', 'Center', 'Yes', 'No').subscribe(
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
}
