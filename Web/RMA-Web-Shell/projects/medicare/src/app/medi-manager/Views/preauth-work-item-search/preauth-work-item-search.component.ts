import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { WorkItemStateEnum } from 'projects/shared-models-lib/src/lib/enums/work-item-state.enum';
import { WorkItemTypeEnum } from 'projects/digicare/src/app/work-manager/models/enum/work-item-type.enum';
import { WorkItem } from 'projects/digicare/src/app/work-manager/models/work-item';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { WorkItemSearchDataSource } from 'projects/digicare/src/app/work-manager/datasources/work-item-search-datasource';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
  selector: 'preauth-work-item-search',
  templateUrl: './preauth-work-item-search.component.html',
  styleUrls: ['./preauth-work-item-search.component.css']
})
export class PreauthWorkItemSearchComponent implements OnInit, AfterViewInit {

  form: UntypedFormGroup;
  currentQuery: string;
  displayedColumns: string[] = ['description', 'workItemState', 'createdBy', 'additionalInformation', 'modifiedDate', 'workItemIForWizard'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;
  dataSource: WorkItemSearchDataSource;

  constructor(private readonly router: Router, private readonly wizardService: WizardService, private readonly wizardConfigurationService: WizardConfigurationService,
    private readonly medicalFormService: MedicalFormService, private readonly digiService: DigiCareService) { }

  ngOnInit() {
    this.dataSource = new WorkItemSearchDataSource(this.digiService);
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

  //refactor DRY
  onSelect(item: WorkItem): void {

    if (item.workItemState == WorkItemStateEnum.InProgress) {
      let workItemTypeId = item.workItemType.workItemTypeId;
      let type: string;

      if (workItemTypeId == WorkItemTypeEnum.FirstMedicalReport)
        type = "first-medical-report-form";
      else if (workItemTypeId == WorkItemTypeEnum.ProgressMedicalReport)
        type = "progress-medical-report-form";
      else if (workItemTypeId == WorkItemTypeEnum.FinalMedicalReport)
        type = "final-medical-report-form";
      else if (workItemTypeId == WorkItemTypeEnum.FirstDiseaseMedicalReport)
        type = "first-disease-medical-report-form";
      else if (workItemTypeId == WorkItemTypeEnum.ProgressDiseaseMedicalReport)
        type = "progress-disease-medical-report-form";
      else if (workItemTypeId == WorkItemTypeEnum.FinalDiseaseMedicalReport)
        type = "final-disease-medical-report-form";

      this.wizardService.getWizardsByTypeAndLinkedItemId(item.workItemId, type).subscribe(wizard => {

        let wizardId = wizard.id;
        let wizardConfigurationId: number = Number(wizard.wizardConfigurationId);

        this.wizardConfigurationService.getWizardConfiguration(wizardConfigurationId).subscribe(wizardConfiguration => {
          Wizard.redirect(this.router, wizardConfiguration.name, wizardId);
        });

      });
    }
    else if (item.workItemState == WorkItemStateEnum.Complete) {

      this.medicalFormService.getMedicalReportFormByWorkItemId(item.workItemId).subscribe(medicalReportForm => {
        this.router.navigate(['/digicare/medical-form-viewer', medicalReportForm.medicalReportFormId]);
      });
    }
  }
  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  getWorkItemStateFriendlyName(workItemState: WorkItemStateEnum): string {
    if (workItemState == WorkItemStateEnum.InProgress) return "In progress";
    if (workItemState == WorkItemStateEnum.Complete) return "Done";
    return WorkItemStateEnum[workItemState];
  }

}
