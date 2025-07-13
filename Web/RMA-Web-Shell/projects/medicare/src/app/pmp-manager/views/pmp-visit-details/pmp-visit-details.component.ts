import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { isNullOrUndefined } from 'util';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { PMPService } from 'projects/medicare/src/app/pmp-manager/services/pmp-service';
import { BehaviorSubject } from 'rxjs';
import { EventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/event.model';
import { PersonEventModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/personEvent/personEvent.model';
import { Visit } from '../../models/visit';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ToastrManager } from "ng6-toastr-notifications";
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { PensionClaim } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { Service } from '../../models/service';
import { ServiceEnum } from '../../enums/service.enum';
import { ClinicVenue } from '../../models/clinic-venue';

@Component({
  selector: 'pmp-visit-details',
  templateUrl: './pmp-visit-details.component.html',
  styleUrls: ['./pmp-visit-details.component.css']
})

export class PMPVisitDetailsComponent extends WizardDetailBaseComponent<PensionClaim> {

  public form: UntypedFormGroup;
  loadingData$ = new BehaviorSubject<boolean>(false);
  noPensionCaseLink: boolean = false;
  showSearchProgress = false;
  disabled: boolean = true;
  isLoadingCategories = false;
  pensionCaseNumberErrorMessage: string;
  selectedTab = 0;
  isInternalUser: boolean = true;
  icd10List = [];
  eventId: number = 0;
  selectedEvent: EventModel;
  selectedPersonEvent: PersonEventModel;
  dataSource: MatTableDataSource<Visit>;
  @Input() personEventId: number;  
  visitList: Visit[];
  displayedColumns: { def: string, show: boolean }[];
  dateVisited: Date;
  currentEditedItem: Visit;
  currentUrl = this.router.url;
  loading$ = new BehaviorSubject<boolean>(false);  
  services: Service[];
  counter = 0;
  showEditControls: boolean = false;
  showAddItemTitlesAndControls: boolean = true;
  userEmail: string;
  today = new Date();
  clinicVenues: ClinicVenue[];

  getDisplayedColumns(): string[] {    
    this.displayedColumns = [
      { def: 'dateVisited', show: true },
      { def: 'serviceType', show: true },
      { def: 'modifiedBy', show: true },
      { def: 'edit', show: true },
      { def: 'delete', show: true },
    ];
    return this.displayedColumns.filter((cd) => cd.show).map((cd) => cd.def);
  }  

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly pmpService: PMPService,
    readonly confirmservice: ConfirmationDialogsService,
    public datepipe: DatePipe,
    private readonly alertService: AlertService,
    private readonly toasterService: ToastrManager,
    private router: Router
  ) {
    super(appEventsManager, authService, activatedRoute);
    this.getServices();
    this.getClinicVenue();
  }

  ngOnInit() {
    this.visitList = [];
    this.createForm();
    this.dataSource = new MatTableDataSource<Visit>();
    var currentUser = this.authService.getCurrentUser();
    this.isInternalUser = currentUser.isInternalUser;
    this.userEmail = currentUser.email;
  }

  onLoadLookups(): void {
  }
  
  getServices() {
    this.pmpService.getServices().subscribe((result) => {
      this.services = result;
    });
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.visitList === null || this.visitList === undefined || this.visitList.length <= 0) {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push(`Please capture at least one visit.`);
    }
    return validationResult;
  }

  populateModel(): void {
    if (!this.visitList || this.visitList.length === 0) return;
    this.model.visits = this.visitList;
  }

  populateForm(): void {
    if (!this.model || !this.model.visits) {
      this.visitList = this.model.visits;
    }
    this.loadExistingVisitList(null);
  }

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      visitId: [{ value: 0, disabled: true }],
      serviceType: new UntypedFormControl(''),
      dateVisited: new UntypedFormControl(''),
      visitComments: new UntypedFormControl(''),
      clinicVenue: new UntypedFormControl('')
    });
    this.loadExistingVisitList(null);
  }

  clearForm(): void {
    this.form.patchValue({
      serviceType: '',
      dateVisited: '',
      visitComments: '',
      clinicVenue: ''
    });
  }

  addVisitItem(): void {
    if (this.form.controls.dateVisited.value) {
        this.addItemToVisitList();
    }
  }

  addItemToVisitList(): void {
    let visit = new Visit;
    let visitId = this.form.controls.visitId.value;
    
    if (this.form.controls.dateVisited.value && this.form.controls.visitComments.value && this.form.controls.serviceType.value) {
        visit.visitId = (visitId > 0) ? visitId : this.counter -= 1;        
        visit.dateVisited = this.form.controls.dateVisited.value;
        visit.serviceId = this.form.controls.serviceType.value;
        visit.comment = this.form.controls.visitComments.value;
        visit.clinicVenueId = this.form.controls.clinicVenue.value;
        visit.modifiedBy = this.userEmail;

        if (this.visitList !== undefined) {
            let isDuplicateLineItem = this.isDuplicateLineItem(visit, this.visitList);
            if (!isDuplicateLineItem) {
                this.visitList.push(visit);
            }
        }
        else {
            this.confirmservice.confirmWithoutContainer('Duplicate line item Validation', `This visit already exists. Please capture a different visit`,
                'Center', 'Center', 'OK').subscribe(() => {
                });
        }
    }
    else
    {      
      this.toasterService.warningToastr(`Please capture all fields!`);
    }
    this.bindData();
    this.clearForm();
  }

  updateItem(): void {
    if (!this.form) {
      return;
    }
    let updateResult = false;
    if (!isNullOrUndefined(this.currentEditedItem)) {
      this.currentEditedItem.comment = this.form.controls.visitComments.value;
      this.currentEditedItem.serviceId = this.form.controls.serviceType.value;
      this.currentEditedItem.dateVisited = this.form.controls.dateVisited.value;
      this.currentEditedItem.clinicVenueId = this.form.controls.clinicVenue.value;
      
      let visitIndex = this.visitList?.indexOf(this.currentEditedItem);
      if (visitIndex > -1) {
        this.visitList[visitIndex] = this.currentEditedItem;
        this.bindData();
        updateResult = true;
      }
      else {
        updateResult = false;
      }
    }
    else {
      updateResult = false;
    }

    if (updateResult) {
      this.alertService.success(`Visit updated successfully`, 'Edit Visit', true);
    }
    else {
      this.alertService.error(`Failed to update visit`, 'Edit Visit', true);
    }
    this.showEditControls = false;
    this.showAddItemTitlesAndControls = true;

    this.form.reset();
  }

  bindData(): void {
    if (this.dataSource !== undefined && this.visitList !== undefined) {
      this.dataSource.data = this.visitList.filter((v, i) => this.visitList.findIndex(item => (item.serviceId == v.serviceId) && (item.dateVisited == v.dateVisited) && (item.comment == v.comment) && (item.clinicVenueId == v.clinicVenueId) && (item.isDeleted == false || isNullOrUndefined(item.isDeleted))) === i);
    }
  }
  
  getClinicVenue() {
    this.pmpService.getClinicVenue().subscribe((result) => {
      this.clinicVenues = result;
    });
  }

  getPreAuthBreakdownList(): Visit[] {
    return this.visitList;
  }

  getPreAuthFromDate(): Date {
    return new Date(this.form.controls.dateAuthorisedFrom.value);
  }

  isDuplicateLineItem(visit: Visit, visitList: Visit[]): boolean {
    let isDuplicate = true;
    if (visitList.length > 0) {
        visitList.forEach((breakdown) => {
        isDuplicate = true;
        if (visit.serviceId !== breakdown.serviceId || visit.dateVisited !== breakdown.dateVisited) {
          isDuplicate = false;
        }
        else {
          if (visit.dateVisited.valueOf() === breakdown.dateVisited.valueOf()) {
            isDuplicate = true;
          }
          else {
            isDuplicate = false;
          }
        }
      });
    }
    else {
      isDuplicate = false;
    }
    
    return isDuplicate;
  }

  loadExistingVisitList(visits) {
    if (this.model && this.model.visits !== null && this.model.visits !== undefined && this.model.visits.length > 0) {
      this.visitList = this.model.visits;
    }
    else if (visits !== null && visits !== undefined && visits.length > 0) {
      this.visitList = visits;
    }
    if (this.visitList !== undefined && this.visitList !== null) {
      this.bindData();
    }
  }

  resetForm(): void {
    this.form.reset();
  }

  getServiceEnumName(id: number): string {
    return ServiceEnum[id];
  }

  deleteItem(obj: Visit): void {
    this.confirmservice.confirmWithoutContainer('Confirm Delete?', 'Are you sure you want to delete this item from the list?',
    'Center', 'Center', 'Yes', 'No').subscribe(result => {
      if (result === true) {
        if (obj.visitId > 0) {
          let visitIndex = this.visitList.indexOf(obj);
          if (visitIndex > -1) {
            this.visitList[visitIndex].isDeleted = true;
          }
        }
        else{
          const i = this.visitList.findIndex(e => +e.visitId == +obj.visitId);
          this.visitList.splice(i, 1);
        }

        this.bindData();
        this.alertService.success(`Visit deleted successfully`);
      }
    });
  }

  editItem(obj: Visit): void {
    if (!this.form) {
      return;
    }
    this.form.controls.serviceType.patchValue(obj.serviceId);
    this.form.controls.dateVisited.patchValue(obj.dateVisited);
    this.form.controls.visitComments.patchValue(obj.comment);
    this.form.controls.clinicVenue.patchValue(obj.clinicVenueId);
    this.currentEditedItem = obj;
    this.showEditControls = true;
    this.showAddItemTitlesAndControls = false;
  }
}
