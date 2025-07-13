import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { DebtCareService } from 'projects/debtcare/src/app/debt-manager/services/debtcare.service';
import { MedicalFormService } from 'projects/debtcare/src/app/medical-form-manager/services/medicalform.service';
import { WorkItem } from 'projects/debtcare/src/app/work-manager/models/work-item';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItemTypeEnum } from 'projects/debtcare/src/app/work-manager/models/enum/work-item-type.enum';
import { WorkItemsDataSource } from 'projects/debtcare/src/app/work-manager/datasources/work-items.datasource';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';

@Component({
  selector: 'app-work-items-list',
  templateUrl: './work-items-list.component.html',
  styleUrls: ['./work-items-list.component.css']
})
export class WorkItemsListComponent implements OnInit, AfterViewInit {
  form: UntypedFormGroup;
  displayedColumns: string[] = ['description', 'workItemState', 'createdBy', 'additionalInformation', 'modifiedDate', 'workItemIForWizard'];
  worktItemsList: WorkItem[];
  currentUser: string;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: false }) filter: ElementRef;
  dataSource: WorkItemsDataSource;

  constructor(
    private readonly router: Router,
    private readonly debtCareService: DebtCareService,
    private readonly wizardService: WizardService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    private readonly medicalFormService: MedicalFormService,
    private readonly authService: AuthService) { }
  loadingWorkItemsInProgress = false;

  workItemTypeFilter: number;
  workItemNameFilter: string;
  workItemCreator: string;
  ngOnInit() {
    this.dataSource = new WorkItemsDataSource(this.debtCareService);
    this.currentUser = this.authService.getUserEmail();
    this.paginator.pageIndex = 0;
    this.loadData();
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
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction == '' ? "desc" : this.sort.direction, this.currentUser);
  }

  getActiveWorkItems(): void {
    this.loadingWorkItemsInProgress = true;
    this.worktItemsList = [];

    this.workItemTypeFilter = 0;
    this.workItemCreator = this.authService.getUserEmail();;
    this.debtCareService.getFilteredWorkItems(this.workItemTypeFilter, this.workItemCreator).subscribe(data => {
      this.worktItemsList = data;
      this.loadingWorkItemsInProgress = false;
    });
  }

  getWorkItemStateFriendlyName(workItemState: WorkItemStateEnum): string {
    if (workItemState == WorkItemStateEnum.InProgress) return "In progress";
    if (workItemState == WorkItemStateEnum.Complete) return "Done";
    return WorkItemStateEnum[workItemState];
  }

  onSelect(item: WorkItem): void {

    if (item.workItemState == WorkItemStateEnum.InProgress) {
      let workItemTypeId = item.workItemType.workItemTypeId;
      let type: string;

      if(workItemTypeId == WorkItemTypeEnum.FirstMedicalReport)
        type = "first-medical-report-form";
      else if(workItemTypeId == WorkItemTypeEnum.ProgressMedicalReport)
        type = "progress-medical-report-form";
      else if(workItemTypeId == WorkItemTypeEnum.FinalMedicalReport)
        type = "final-medical-report-form";
      else if(workItemTypeId == WorkItemTypeEnum.FirstDiseaseMedicalReport)
        type = "first-disease-medical-report-form";
      else if(workItemTypeId == WorkItemTypeEnum.ProgressDiseaseMedicalReport)
        type = "progress-disease-medical-report-form";
      else if(workItemTypeId == WorkItemTypeEnum.FinalDiseaseMedicalReport)
        type = "final-disease-medical-report-form";

      this.wizardService.getWizardsByTypeAndLinkedItemId(item.workItemId, type).subscribe(wizard => {

        let wizardId = wizard.id;
        let wizardConfigurationId: number = Number(wizard.wizardConfigurationId);
        let wizardStatusId: WizardStatus = wizard.wizardStatusId;

        if(wizardStatusId == WizardStatus.Completed){
          this.routeToMedicalFormView(item.workItemId);
        }
        else {
          this.wizardConfigurationService.getWizardConfiguration(wizardConfigurationId).subscribe(wizardConfiguration => {
            Wizard.redirect(this.router, wizardConfiguration.name, wizardId);
          });
        }
      });
    }
    else if(item.workItemState == WorkItemStateEnum.Complete) {
        this.routeToMedicalFormView(item.workItemId);
    }
  }

  routeToMedicalFormView(workItemId: number): void  {
    this.medicalFormService.getMedicalReportFormByWorkItemId(workItemId).subscribe(medicalReportForm => {
      this.router.navigate(['/debtcare/medical-form-viewer', medicalReportForm.medicalReportFormId]);
    });
  }
}
