import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import 'src/app/shared/extensions/date.extensions';
import { ReportsManagerConstants } from 'projects/medicare/src/app/medical-reports-manager/constants/reports-manager-constants';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { EventTypeEnum } from 'projects/claimcare/src/app/claim-manager/shared/enums/event-type-enum';
import { isNullOrUndefined } from 'util';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-medical-reports-manager',
  templateUrl: './medical-reports-manager.component.html',
  styleUrls: ['./medical-reports-manager.component.css']
})
export class MedicalReportsManagerComponent implements OnInit {

  reportServer: string;
  reportUrl: string;
  showParameters: string;
  parameters: any;
  language: string;
  width: number;
  height: number;
  toolbar: string;
  format = ReportsManagerConstants.formatPDF;
  extension = String.Empty;
  reportTitle: string;
  ssrsBaseUrl: string;
  dateError = String.Empty;

  form: UntypedFormGroup;
  showReport = false;
  showExport = false;
  exportTypeId = '1';
  selectedReportFormat = ReportsManagerConstants.formatPDF;
  reportFormats: string[] = [ReportsManagerConstants.formatPDF, ReportsManagerConstants.formatExcel];
  searchableStart: Date;
  searchableEnd: Date;
  formIsValid = false;
 
  medicalFilterDateParam: any;  

  public selectedReportType: any;
  isDownload: string;
  isDownloading = false;
  reportUseStartAndEndDates = false;
  years: { name: string, value: number }[] = [];
  months: { name: string, value: number }[] = [];
  toMonths: { name: string, value: number }[] = [];
  selectedYear = 0;
  selectedMonth = 0;
  toSelectedMonth = 0;
  productNameFilter = null;
  startDate: Date;
  endDate: Date;
  start: any;
  end: any;
  startDt: UntypedFormControl;
  endDt: UntypedFormControl;
  startMaxDate: Date;
  endMinDate: Date;
  isDateFilterVisble = false;
  isServiceYearVisible = true;
  completedServicesReportFilter = false;
  pmpRegions: Lookup[];
  diagnosticGroups: ICD10DiagnosticGroup[] = [];
  isLoading = false;

  public medicalReportTypes = [
    { name: 'Chronic Medication Report', value: 'ChronicMedicationReport' },
    { name: 'Medical Service Completed Services Report', value: 'CompletedServicesReport' },
    { name: 'Medical Service Scheduling Report', value: 'ServiceSchedulingReport' },
    { name: 'Rescheduling of PMP Non-Attendees Report', value: 'ReschedulingPMPNonAttendeesReport' },
  ];

  constructor(
    private lookupService: LookupService,
    private readonly alertService: AlertService,
    private readonly medicalService: ICD10CodeService,
    private readonly toasterService: ToastrManager,
    private formBuilder: UntypedFormBuilder,
    public datePipe: DatePipe,
  ) {
    this.createForm();

    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    this.start = this.datePipe.transform(this.startDate, ReportsManagerConstants.dateStringFormat);
    this.startDt = new UntypedFormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new UntypedFormControl(this.endDate);
    const tempEndDate = new Date();
    this.end = this.datePipe.transform(tempEndDate, ReportsManagerConstants.dateStringFormat);

    this.getPMPRegions();
    this.getDiagnosticGroupsByEventTypeId(EventTypeEnum.Accident);
  }

  ngOnInit() {
    this.isDownload = 'false';
    const today = new Date();
    this.startMaxDate = today;
    this.endMinDate = this.startDate;
    this.createForm();
    this.lookupService.getItemByKey(ReportsManagerConstants.baseURL).subscribe(
      value => {
        this.ssrsBaseUrl = value;
        this.loadDefaultReport();
      }
    );
  }

  getPMPRegions(): void {
    this.isLoading = true;
    this.lookupService.getPMPRegions().subscribe(
      data => {
        this.pmpRegions = data;
        this.isLoading = false;
      }
    );
  }
  
  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    this.isLoading = true;
    this.medicalService
      .getICD10DiagonosticGroupsByEventType(eventType)
      .subscribe((groups) => {
        this.diagnosticGroups = groups;
        this.isLoading = false;
      });
  }

  medicalReportTypeChanged($event: any) {
    this.selectedReportType = this.medicalReportTypes.filter(i => i.value === $event.value.value)[0];
    this.reportTitle = this.selectedReportType.name;
    this.showExport = false;
    this.extension = String.Empty;
    this.showReportFilters();
  } 

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, ReportsManagerConstants.dateStringFormat);
    this.endMinDate = this.startDate;
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.end = this.datePipe.transform(this.endDate, ReportsManagerConstants.dateStringFormat);
  }

  showReportFilters(): void {
    switch (this.selectedReportType.value) {     
      case ReportsManagerConstants.chronicMedicationReportName:
      case ReportsManagerConstants.reschedulingPMPNonAttendeesReportName:
        this.isDateFilterVisble = true;
        this.completedServicesReportFilter = false;
        break;
      case ReportsManagerConstants.completedServicesReportName:
        this.isDateFilterVisble = false;
        this.completedServicesReportFilter = true;
        this.isServiceYearVisible = true;
        break;
      case ReportsManagerConstants.serviceSchedulingReportName:
          this.isDateFilterVisble = true;
          this.completedServicesReportFilter = true;
          this.isServiceYearVisible = false;
          break;
      default:
        this.isDateFilterVisble = false;
        this.completedServicesReportFilter = false;
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      medicalReportTypes: [null],
      startDt: new UntypedFormControl(String.Empty),
      endDt: new UntypedFormControl(String.Empty),
      serviceYear: new UntypedFormControl(String.Empty),
      pmpRegion: new UntypedFormControl(String.Empty),
      drgGroup: new UntypedFormControl(String.Empty)
    });
  }

  loadDefaultReport(): void {
    this.showReport = false;
    this.showExport = false;
    this.reportTitle = String.Empty;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = ReportsManagerConstants.reportUrl;
    this.showParameters = 'false';
    this.parameters = { default: true };
    this.language = ReportsManagerConstants.defaultLanguage;
    this.width = 50;
    this.height = 50;
    this.toolbar = 'false';
  }

  viewReport() {
    this.isDownload = 'false';
    this.reportTitle = this.selectedReportType.name;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = ReportsManagerConstants.reportUrl + this.selectedReportType.value;
    const formModel = this.form.getRawValue();
    
    if (this.selectedReportType.value === ReportsManagerConstants.chronicMedicationReportName
      || this.selectedReportType.value === ReportsManagerConstants.reschedulingPMPNonAttendeesReportName) {
      this.parameters = {
        StartDate: this.start,
        EndDate: this.end,
      };
    }
    else if (this.selectedReportType.value === ReportsManagerConstants.completedServicesReportName) {
      if (formModel.serviceYear == '') {
        this.toasterService.warningToastr(`Please capture service year!`);
        return;
      }
      this.parameters = {
        ServiceYear: formModel.serviceYear,
        PMPRegionID: formModel.pmpRegion == '' ? 0 : formModel.pmpRegion,
        ICD10DiagnosticGroupId: formModel.drgGroup == '' ? 0 : formModel.drgGroup
      };
    }
    else if (this.selectedReportType.value === ReportsManagerConstants.serviceSchedulingReportName) {
      if (formModel.drgGroup == '' || isNullOrUndefined(this.start) || isNullOrUndefined(this.end)) {
        this.toasterService.warningToastr(`Please capture all mandatory fields`);
        return;
      }
      this.parameters = {
        StartDate: this.start,
        EndDate: this.end,
        PMPRegionID: formModel.pmpRegion == '' ? 0 : formModel.pmpRegion,
        ICD10DiagnosticGroupId: formModel.drgGroup == '' ? 0 : formModel.drgGroup
      };
    }

    this.showParameters = 'false';
    this.format = ReportsManagerConstants.formatPDF;
    this.width = 100;
    this.height = 100;
    this.toolbar = 'true';
    this.showReport = true;
  }

  exportReport() {
    console.log('export report');
    this.isDownload = 'true';
    this.showReport = false;
    this.isDownloading = true;
    this.reportTitle = this.selectedReportType.name;
    this.reportServer = this.ssrsBaseUrl;
    this.reportUrl = ReportsManagerConstants.reportUrl + this.selectedReportType.value;
    const formModel = this.form.getRawValue();

    if (this.selectedReportType.value === ReportsManagerConstants.chronicMedicationReportName) {
      this.parameters = {
        StartDate: this.start,
        EndDate: this.end,
      };
    }    
    else if (this.selectedReportType.value === ReportsManagerConstants.completedServicesReportName) {
      if (formModel.serviceYear == '') {
        this.toasterService.warningToastr(`Please capture service year!`);
        return;
      }
      this.parameters = {
        ServiceYear: formModel.serviceYear,
        PMPRegionID: formModel.pmpRegion == '' ? 0 : formModel.pmpRegion,
        ICD10DiagnosticGroupId: formModel.drgGroup == '' ? 0 : formModel.drgGroup
      };
    }
    else if (this.selectedReportType.value === ReportsManagerConstants.serviceSchedulingReportName) {
      if (formModel.drgGroup == '' || isNullOrUndefined(this.start) || isNullOrUndefined(this.end)) {
        this.toasterService.warningToastr(`Please capture all mandatory fields`);
        return;
      }
      this.parameters = {
        StartDate: this.start,
        EndDate: this.end,
        PMPRegionID: formModel.pmpRegion == '' ? 0 : formModel.pmpRegion,
        ICD10DiagnosticGroupId: formModel.drgGroup == '' ? 0 : formModel.drgGroup
      };
    }

    this.showParameters = 'true';
    this.format = this.selectedReportFormat;
    this.extension = this.extension;
    this.language = ReportsManagerConstants.defaultLanguage;
    this.width = 10;
    this.height = 10;
    this.toolbar = 'true';
    this.showReport = true;
    this.isDownloading = false;
  }

  reportFormatChange(event: MatRadioChange) {
    this.reportUrl = null;
    this.selectedReportFormat = event.value;
  }
}