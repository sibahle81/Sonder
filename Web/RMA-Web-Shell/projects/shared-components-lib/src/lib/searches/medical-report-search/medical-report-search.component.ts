import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';

import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';

import { MedicalReportSearchDataSource } from './medical-report-search-datasource';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';

import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { MedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/medical-report-form';

import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItemTypeEnum } from 'projects/digicare/src/app/work-manager/models/enum/work-item-type.enum';
import { MedicalReportCategoryEnum } from 'projects/digicare/src/app/work-manager/models/enum/medical-report-category.enum';
import { MedicalReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-enum';
import { MedicalReportStatusEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-status-enum';
import { MedicalReportModeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-report-mode.enum';

@Component({
  selector: 'medical-report-search',
  templateUrl: './medical-report-search.component.html',
  styleUrls: ['./medical-report-search.component.css']
})
export class MedicalReportSearchComponent extends PermissionHelper implements OnInit, OnChanges  {
  addPermission = 'Add Medical Report';
  editPermission = 'Edit Medical Report';
  viewPermission = 'View Medical Report';

  @Input() searchByHealthCareProvider: boolean = false;
  @Input() claimId: number = 0;
  @Input() basicMode = true;
  @Input() triggerReset: boolean;


  @Output() workItemEmit: EventEmitter<WorkItem> = new EventEmitter();
  @Output() medicalReportEmit: EventEmitter<MedicalReportForm> = new EventEmitter();

  form: UntypedFormGroup;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: MedicalReportSearchDataSource;

  medicalReportTypes: any;
  medicalReportCategories: any;
  isInternalUser = false;
  healthCareProviderId = 0;
  isClaimView: boolean = false;

  searchTerm = '';
  selectedWorkItem: WorkItem;  
  selectedMedicalReport: MedicalReportForm;  

  accepted = +MedicalReportStatusEnum.Accepted;
  memberSubmit = +MedicalReportStatusEnum.MemberSubmit;
  rejected = +MedicalReportStatusEnum.Rejected;
  pending = +MedicalReportStatusEnum.Pending;

  constructor(private readonly router: Router, 
        private readonly medicalFormService: MedicalFormService, 
        private readonly digiService: DigiCareService,
        private readonly formBuilder: FormBuilder,
        private readonly authService: AuthService,
        private readonly lookupService: LookupService,
        private readonly userService: UserService) {
          super();
          this.dataSource = new MedicalReportSearchDataSource(this.medicalFormService);
         }

    ngOnInit(): void {
        if(this.claimId && this.claimId > 0){
            this.isClaimView = true;
            }

        this.createForm();
        this.configureSearch();
        this.getData();
        this.getMedicalReportTypes();
        this.getMedicalReportCategories();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.getData();
        }
    }


    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.paginator.pageIndex = 0;
            this.search(response as string);
        });
    }
    
    search(searchTerm: string) {
        this.searchTerm = searchTerm;
        if (!this.searchTerm || this.searchTerm === '') {
            this.getData();
        } else {
            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
            this.getData();
        }
    }

    navigate() {
        this.router.navigate([`/medicare/medical-report/report-view`]);
    }

    getData(): void {
        this.dataSource.claimId = this.claimId; 
        var currentUser = this.authService.getCurrentUser();
        this.isInternalUser = currentUser.isInternalUser;
        this.userService.getUserHealthCareProviders(currentUser.email).subscribe((result) => {
            if (result.length > 0) {                
                this.dataSource.healthCareProviderId = result[0].healthCareProviderId; 
            }

            this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, this.searchTerm == '' ? ' ' : btoa(this.searchTerm));            
        });        
    }

    getMedicalReportTypes(): void {
        //this.loadingMessage$.next("loading medical report types...");
        this.lookupService.getMedicalReportTypes().subscribe(data => {
        this.medicalReportTypes = data;
        });
    }

    getMedicalReportCategories(): void {
        //this.loadingMessage$.next("loading medical report categories...");
        this.lookupService.getMedicalReportCategories().subscribe(data => {
        this.medicalReportCategories = data;
        });
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'reportTypeId', show: true },
            { def: 'reportCategoryId', show: true },
            { def: 'reportDate', show: true },
            { def: 'name', show: true },
            { def: 'surname', show: true },
            { def: 'healthcareProviderName', show: true },
            { def: 'healthcareProviderPracticeNumber', show: true },
            { def: 'icd10Codes', show: true },
            { def: 'modifiedBy', show: true },  
            { def: 'reportStatusId', show: true },               
            { def: 'actions', show: true }
            //{ def: 'actions', show: (this.userHasPermission(this.viewPermission) || this.userHasPermission(this.editPermission)) }    
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    } 

    setReportType(_report: MedicalReportForm): string {
        if (!_report.reportTypeId) { return ''; }
        else {
        //return MedicalReportTypeEnum[_report.reportTypeId];
        return this.medicalReportTypes.find(c => c.id === +_report.reportTypeId).name;
        }
    }

    setReportCategory(_report: MedicalReportForm): string {
        if (!_report.reportCategoryId) { return ''; }
        else {
        //return MedicalReportCategoryEnum[_report.reportCategoryId];
        return this.medicalReportCategories.find(c => c.id === +_report.reportCategoryId).name;
        }
    }

    setStatus(_report: MedicalReportForm): string {
        if (!_report.reportStatusId) { return ''; }
        else {
            return MedicalReportStatusEnum[+_report.reportStatusId];
        }
    }

    medicalReportSelected(_report: MedicalReportForm) {
        this.selectedMedicalReport = _report;
        this.medicalReportEmit.emit(this.selectedMedicalReport);
    }

    viewMedicalReport(_report: MedicalReportForm) {
        this.router.navigate([`/medicare/medical-report/report-view/${_report.medicalReportFormId}`]);
    }

    addMedicalReport() {
        this.router.navigate([`/medicare/medical-report/report-view/${this.isClaimView}/${this.selectedMedicalReport?this.selectedMedicalReport.medicalReportFormId : 0}/${this.claimId}/${this.healthCareProviderId}`]);
    }

    onMedicalReportActionClink(_report: MedicalReportForm, menu: string): void {
        switch (menu) {
          case 'view':
            this.router.navigate([`/medicare/medical-report/report-view/${this.isClaimView}/${MedicalReportModeEnum.View}/${_report.medicalReportFormId}`]);
            break;
          case 'edit':
            this.router.navigate([`/medicare/medical-report/report-view/${this.isClaimView}/${MedicalReportModeEnum.Edit}/${_report.medicalReportFormId}`]);
            break;
          case 'remove':
            this.router.navigate([`/medicare/medical-report/report-view/${this.isClaimView}/${MedicalReportModeEnum.Delete}/${_report.medicalReportFormId}`]);
            break;
        }
    } 
}
