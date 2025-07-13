import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { DatePipe } from "@angular/common";
import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { ClaimLiabilityStatusEnum } from "projects/shared-models-lib/src/lib/enums/claim-liability-status.enum";
import { ClaimStatusEnum } from "projects/shared-models-lib/src/lib/enums/claim-status.enum";
import { ServiceTypeEnum } from "projects/shared-models-lib/src/lib/enums/service-type.enum";
import { STPExitReasonEnum } from "projects/shared-models-lib/src/lib/enums/stp-exit-reason.enum";
import { SuspiciousTransactionStatusEnum } from "projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum";
import { Lookup } from "projects/shared-models-lib/src/lib/lookup/lookup";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { userUtility } from "projects/shared-utilities-lib/src/lib/user-utility/user-utility";
import { BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { Constants } from "../../../../constants";
import { ClaimCareService } from "../../../Services/claimcare.service";
import { PersonEventSearch } from "../../entities/personEvent/person-event-search";
import { PersonEventSearchParams } from "../../entities/personEvent/person-event-search-parameters";
import { PersonEventSearchDataSource } from "./person-event-search.datasource";
import * as XLSX from "xlsx";
import { ToastrManager } from "ng6-toastr-notifications";
import { EventTypeEnum } from "../../enums/event-type-enum";
import { PagedRequestResult } from "projects/shared-models-lib/src/lib/pagination/PagedRequestResult";
import { MatRadioChange } from "@angular/material/radio";
import { DateAdapter, MAT_DATE_FORMATS } from "@angular/material/core";
import {
  DatePickerDateFormat,
  MatDatePickerDateFormat,
} from "projects/shared-utilities-lib/src/lib/datepicker/dateformat";
import { UnSubscribe } from "projects/shared-models-lib/src/lib/common/unsubscribe";
import { ClaimItemTypeEnum } from "projects/shared-models-lib/src/lib/enums/claim-type-enum";
import { ConfirmationDialogsService } from "projects/shared-components-lib/src/lib/confirm-message/confirm-message.service";
import { ReOpenReasonDialogComponent } from "projects/claimcare/src/app/claim-manager/views/re-open-reason-dialog/re-open-reason-dialog.component";
import { ClaimAuditViewComponent } from "../../../views/claim-audit-view/claim-audit-view.component";
import { ExitReasonDialogComponent } from "../../../views/exit-reason-dialog/exit-reason-dialog.component";
import { PersonEventSmsAuditComponent } from "../../../views/person-event-sms-audit/person-event-sms-audit.component";
import { RemoveFromStpComponent } from "../../../views/remove-from-stp/remove-from-stp.component";
import { ViewEmailAuditDialogComponent } from "projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component";
import { PersonEventStatusEnum } from "projects/shared-models-lib/src/lib/enums/person-event-status.enum";

@Component({
  selector: "person-event-search",
  templateUrl: "./person-event-search.component.html",
  styleUrls: ["./person-event-search.component.css"],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat },
  ],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", visibility: "hidden" })
      ),
      state("isExpanded", style({ height: "*", visibility: "visible" })),
      transition(
        "isExpanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class PersonEventSearchComponent extends UnSubscribe implements OnInit {
  @Input() title: string;
  @Input() selectedReportFormat: string;
  @Input() hideVisibility = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("filter", { static: true }) filter: ElementRef;

  isClaimStatusLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  claimStatusList$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  claimLiabilityStatus$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  currentQuery: any;
  form: UntypedFormGroup;
  displayedColumns: string[] = [
    "expand",
    "personEventReferenceNumber",
    "memberNumber",
    "memberName",
    "identificationNumber",
    "insuredLife",
    "createdDate",
    "isStraightThroughProcess",
    "suspiciousTransactionStatus",
    "actions",
  ];

  selected = 3;
  dataSource: PersonEventSearchDataSource;
  menus: { title: string; url: string; disable: boolean }[];
  suspiciousList: Lookup[];

  claimStatuses: Lookup[];
  filteredClaimStatuses: Lookup[];
  liabilityStatuses: Lookup[];
  filteredLiabilityStatuses: Lookup[];

  maxDate = new Date();
  minDate = new Date();
  params = new PersonEventSearchParams();
  reportFormats: string[] = ["CSV"];

  isDownload = false;
  isDownloading = false;
  isSelected = false;

  removeClaimFromStpQueuePermission = false;
  emailAuditPermission = false;
  smsAuditPermission = false;
  viewClaimStatusAuditPermission = false;
  stpExitReasonHistoryPermission = false;

  searchTerm = "";
  holisticView = "claimcare/claim-manager/holistic-claim-view/";

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly claimCareService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly dialog: MatDialog,
    private readonly toaster: ToastrManager,
    private readonly lookupService: LookupService,
    private readonly datePipeService: DatePipe,
    private readonly confirmService: ConfirmationDialogsService
  ) {
    super();
    this.createForm();
    this.getClaimStatuses();
    this.getLiabilityStatuses();
    this.getAuthenticationTypes();
  }

  ngOnInit(): void {
    this.minDate.setFullYear(this.minDate.getFullYear() - 3);
    this.dataSource = new PersonEventSearchDataSource(this.claimCareService);

    this.setPermissions();
    this.getInitialData();
    this.configureSearch();
  }

  configureSearch() {
    this.form
      .get("searchTerm")
      .valueChanges.pipe(debounceTime(1000))
      .subscribe((response) => {
        this.search(response as string);
      });
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;

    if (this.currentQuery.length >= 3) {
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      this.dataSource.rowCount$.subscribe(
        (count) => (this.paginator.length = count)
      );
      this.currentQuery = this.currentQuery.trim();
      this.paginator.pageIndex = 0;
      this.getData(true);
    }
    if (!this.currentQuery || this.currentQuery === "") {
      this.reset();
      this.getInitialData();
    }
  }

  setPermissions() {
    this.removeClaimFromStpQueuePermission = this.userHasPermission(
      "Remove Claim From STP Queue"
    );
    this.emailAuditPermission = this.userHasPermission(
      "Person Event Email Audit"
    );
    this.smsAuditPermission = this.userHasPermission("Person Event Sms Audit");
    this.viewClaimStatusAuditPermission = this.userHasPermission(
      "View Claim Status Audit"
    );
    this.stpExitReasonHistoryPermission = this.userHasPermission(
      "Person Event Stp Exit Reason"
    );
  }

  getClaimStatuses() {
    this.isClaimStatusLoading$.next(true);
    this.claimCareService.getClaimStatuses().subscribe((result) => {
      this.filterClaimStatus(result);
      this.form.patchValue({
        claimStatus: Constants.prePopulateDropdown,
      });
      this.isClaimStatusLoading$.next(false);
    });
  }

  getLiabilityStatuses() {
    this.lookupService.GetClaimLiabilityStatuses().subscribe((result) => {
      this.liabilityStatuses = result;
      this.filteredLiabilityStatuses = result;
      this.form.patchValue({
        liabilityStatus: Constants.prePopulateDropdown,
      });
      this.isClaimStatusLoading$.next(false);
    });
  }

  getPEVStatus(personEventStatus: PersonEventStatusEnum) {
    return this.formatLookup(PersonEventStatusEnum[personEventStatus]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  getAuthenticationTypes(): void {
    this.lookupService.getSuspiciousTransactionTypes().subscribe((data) => {
      this.suspiciousList = data;
    });
  }

  checkPermissions(permission: string): boolean {
    return userUtility.hasPermission(permission);
  }

  onLiabilityStatusKey(value) {
    this.filteredLiabilityStatuses = this.dropDownSearch(
      value,
      "liabilityStatus"
    );
  }

  onClaimStatusKey(value) {
    this.filteredClaimStatuses = this.dropDownSearch(value, "claimStatus");
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();
    switch (name) {
      case "liabilityStatus":
        return this.setData(
          filter,
          this.filteredLiabilityStatuses,
          this.liabilityStatuses,
          "name"
        );
    }
  }

  setData(filter: string, filteredList: any, originalList: any, type: any) {
    if (String.isNullOrEmpty(filter)) {
      return (filteredList = originalList);
    } else {
      if (type === "code") {
        return filteredList.filter((option) =>
          option.code.toLocaleLowerCase().includes(filter)
        );
      }
      if (type === "name") {
        return filteredList.filter((option) =>
          option.name.toLocaleLowerCase().includes(filter)
        );
      }
    }
  }

  getInitialData() {
    this.setParams();
    let start = new Date();
    this.params.startDate = this.datePipeService.transform(
      new Date(start.setMonth(start.getMonth() - 3)),
      Constants.dateString
    );
    this.params.endDate = this.datePipeService.transform(
      new Date(),
      Constants.dateString
    );
    this.params.isStp = Constants.stpDropdownDefault;
    this.params.stm = Constants.stpDropdownDefault;
    this.params.claimStatus = Constants.statusesDefault;
    this.params.liabilityStatus = Constants.statusesDefault;
    this.params.viewAll = false;
    this.params.filter = true;
    this.params.rolePlayerId = -1;
    this.dataSource.setData(this.params);
  }

  getData(filter: boolean) {
    const model = this.form.value;

    this.setParams();
    if (!this.isSelected) {
      this.params.endDate = this.datePipeService.transform(
        model.endDate,
        Constants.dateString
      );
      this.params.startDate = this.datePipeService.transform(
        model.startDate,
        Constants.dateString
      );
    }
    this.params.isStp = model.isStp;
    this.params.stm = this.form.controls.isStm.value;
    this.params.claimStatus =
      this.form.controls.claimStatus.value === Constants.prePopulateDropdown
        ? -1
        : this.claimStatuses.find(
          (a) => a.name === this.form.controls.claimStatus.value
        ).id;
    this.params.liabilityStatus =
      this.form.controls.liabilityStatus.value === Constants.prePopulateDropdown
        ? -1
        : this.liabilityStatuses.find(
          (a) => a.name === this.form.controls.liabilityStatus.value
        ).id;
    this.params.viewAll =
      this.form.controls.selectAllDates.value === String.Empty
        ? false
        : this.form.controls.selectAllDates.value;
    this.params.filter = true;
    this.dataSource.setData(this.params);
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex
      ? this.paginator.pageIndex + 1
      : 1;
    this.params.pageSize = this.paginator.pageSize
      ? this.paginator.pageSize
      : 5;
    this.params.orderBy =
      this.sort.active && this.sort.active !== undefined
        ? this.sort.active
        : "PersonEventNumber";
    this.params.direction = this.sort.direction ? this.sort.direction : "desc";
    this.params.currentQuery = this.currentQuery ? this.currentQuery : "";
  }

  filterClaimStatus(claimStatus: Lookup[]) {
    const coidClaimStatus = new Array();
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.Submitted)
    );
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.PendingAcknowledgement)
    );
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.PendingRequirements)
    );
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.AutoAcknowledged)
    );
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.Finalized)
    );
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.ClaimClosed)
    );
    coidClaimStatus.push(
      claimStatus.find((a) => a.id === ClaimStatusEnum.Reopened)
    );
    this.claimStatuses = coidClaimStatus;
    this.filteredClaimStatuses = coidClaimStatus;
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      searchTerm: [{ value: null, disabled: false }],
      startDate: new UntypedFormControl(""),
      endDate: new UntypedFormControl(""),
      isStp: new UntypedFormControl(""),
      isStm: new UntypedFormControl(""),
      selectAllDates: new UntypedFormControl(""),
      claimStatus: new UntypedFormControl(""),
      liabilityStatus: new UntypedFormControl(""),
    });

    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      isStp: this.selected,
      isStm: this.selected,
      claimStatus: Constants.prePopulateDropdown,
      liabilityStatus: Constants.prePopulateDropdown,
    });
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.getData(true);
  }

  filterMenu(item: PersonEventSearch) {
    this.menus = [];

    this.menus = [
      { title: "View", url: "", disable: !userUtility.hasPermission("View Claim"), },
      { title: "Email Audit", url: "", disable: false },
      { title: "SMS Audit", url: "", disable: false },
      { title: "View Claim Status Audit", url: "", disable: this.disableViewClaimStatusAudit(item.claimId) },
      { title: "Remove Claim From STP", url: "", disable: this.disableRemoveClaimFromSTP(item), },
      { title: "STP Exit Reason History", url: "", disable: this.disableExitReasonSearch(item), },
      { title: "Re-Open Claim", url: "", disable: !this.isReOpenable(item) },
    ];
  }

  disableRemoveClaimFromSTP(item: PersonEventSearch): boolean {
    return userUtility.hasPermission(Constants.RemoveClaimFromSTPQueue) &&
      item.isStraightThroughProcess
      ? false
      : true;
  }

  disableExitReasonSearch(item: PersonEventSearch): boolean {
    if (item.stpExitReason === null) {
      return true;
    } else {
      return false;
    }
  }

  onMenuSelect(item: PersonEventSearch, menu: any) {
    switch (menu.title) {
      case "View":
        let menuItem = this.menus.find((a) => a.title === "View");
        const hasStpPermission = userUtility.hasPermission(
          Constants.ViewSTPPermission
        );

        if (hasStpPermission) {
          menuItem.url = this.holisticView;
          if (item.isStraightThroughProcess) {
            this.stpClaimConfirmPopUp(item, menu);
          } else {
            this.router.navigateByUrl(
              menu.url + item.eventId + "/" + item.personEventNumber
            );
          }
        } else {
          this.alertService.loading(
            "User does not have permission to view STP claim",
            "User Permission"
          );
        }
        break;
      case "Email Audit":
        this.openEmailAuditDialog(item);
        break;
      case "SMS Audit":
        this.openSmsAuditDialog(item);
        break;
      case "Remove Claim From STP":
        this.removeClaimFromStp(item);
        break;
      case "View Claim Status Audit":
        this.openClaimAuditDialog(item);
        break;
      case "STP Exit Reason History":
        this.openExitReasonDialog(item);
        break;
      case "Re-Open Claim":
        this.reOpenClaimDialog(item);
        break;
    }
  }

  reset() {
    this.paginator.firstPage();
    this.getInitialData();
  }

  openEmailAuditDialog($event: PersonEventSearch) {
    if ($event) {
      const rolePlayerContactOptions = [
        { key: 'Employer Contacts', value: $event.employerRolePlayerId },
        { key: 'Employee Contacts', value: $event.employeeRolePlayerId }
      ];

      const dialogRef = this.dialog.open(ViewEmailAuditDialogComponent, {
        width: "80%",
        maxHeight: "750px",
        disableClose: true,
        data: {
          itemType: "PersonEvent",
          itemId: $event.personEventNumber,
          rolePlayerContactOptions: rolePlayerContactOptions
        },
      });
    }
  }

  openSmsAuditDialog($event: PersonEventSearch): void {
    const rolePlayerContactOptions = [
      { key: 'Employer Contacts', value: $event.employerRolePlayerId },
      { key: 'Employee Contacts', value: $event.employeeRolePlayerId }
    ];

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "80%";
    dialogConfig.maxHeight = "750px";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      itemType: "PersonEvent",
      itemId: $event.personEventNumber,
      rolePlayerContactOptions: rolePlayerContactOptions
    };
    this.dialog.open(PersonEventSmsAuditComponent, dialogConfig);
  }

  removeClaimFromStp(row: any): void {
    if (!this.stpExitReasonHistoryPermission) {
      this.alertService.error(
        "User does not have permission to remove claim from STP",
        "No Permission"
      );
      return;
    }

    const dialogRef = this.dialog.open(RemoveFromStpComponent, {
      width: "50%",
      disableClose: true,
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        itemType: "PersonEvent",
        itemId: row.personEventNumber,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getInitialData();
      }
    });
  }

  openClaimAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1300px";
    dialogConfig.disableClose = false;
    dialogConfig.data = {
      serviceType: ServiceTypeEnum.ClaimManager,
      itemType: ClaimItemTypeEnum.Claim,
      itemId: row.claimId,
    };
    this.dialog.open(ClaimAuditViewComponent, dialogConfig);
  }

  openExitReasonDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1300px";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      itemType: "PersonEvent",
      itemId: row.personEventNumber,
    };
    this.dialog.open(ExitReasonDialogComponent, dialogConfig);
  }

  getSuspiciousTransactionStatus(id: number) {
    return this.format(SuspiciousTransactionStatusEnum[id]);
  }

  getSTPExitReason(id: number) {
    if (id > 0) {
      let Heading = this.format(STPExitReasonEnum[id]);
      if (Heading === Constants.teamLeadLabel) {
        return Heading + Constants.teamLeadClaimManager;
      } else {
        return Heading;
      }
    } else {
      return "";
    }
  }

  format(text: string) {
    if (text && text.length > 0) {
      const status = text
        .replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, "$1")
        .trim();
      return status.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|\d+/g).join(" ");
    }
  }

  getClaimStatus(id: number) {
    const statusName = this.format(ClaimStatusEnum[id]);
    return statusName === "Finalized" ? "Closed" : statusName;
  }

  getLiabilityStatus(id: number) {
    return this.format(ClaimLiabilityStatusEnum[id]);
  }

  getEventType(id: number) {
    return this.format(EventTypeEnum[id]);
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  applyData() {
    const startDate = new Date(this.form.get("startDate").value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get("endDate").value);
    endDate.setHours(0, 0, 0, 0);
    if (endDate < startDate) {
      this.form.get("endDate").setErrors({ "min-date": true });
    } else {
      this.form.get("endDate").setErrors(null);
      this.paginator.firstPage();
      this.getData(true);
    }
  }

  ClearData() {
    this.enableFormControl("startDate");
    this.enableFormControl("endDate");
    this.form.controls.startDate.reset();
    this.form.controls.endDate.reset();
    this.form.controls.isStp.reset();
    this.form.controls.isStm.reset();
    this.form.controls.claimStatus.reset();
    this.form.controls.liabilityStatus.reset();
    let start = new Date();
    this.form.patchValue({
      endDate: new Date(),
      startDate: new Date(start.setMonth(start.getMonth() - 3)),
      isStp: this.selected,
      isStm: this.selected,
      claimStatus: Constants.prePopulateDropdown,
      liabilityStatus: Constants.prePopulateDropdown,
      selectAllDates: false,
    });
    this.paginator.pageIndex = 0;
    this.params.currentQuery = String.Empty;
    this.getInitialData();
  }

  exportToCSV(): void {
    this.isDownloading = true;
    this.params.pageSize = this.dataSource.dataLength;
    this.claimCareService.getCoidPersonEvents(this.params).subscribe((data) => {
      var results = data as PagedRequestResult<PersonEventSearch>;
      results.data.forEach((element) => {
        element.eventTypeDescription = this.getEventType(element.eventType);
        element.claimLiabilityStatusDescription = this.getLiabilityStatus(
          element.claimLiabilityStatus
        );
        element.claimStatusDescription = this.getClaimStatus(
          element.claimStatus
        );
        element.stpExitReasonDescription = element.stpDescription;
        element.suspiciousTransactionStatusDescription =
          this.getSuspiciousTransactionStatus(
            element.suspiciousTransactionStatus
          );
      });

      results.data.forEach((element) => {
        delete element.eventType;
        delete element.claimLiabilityStatus;
        delete element.claimStatus;
        delete element.stpExitReason;
        delete element.suspiciousTransactionStatus;
        delete element.stpDescription;
        delete element.medicalReportForm;
        delete element.claimId;
      });
      const workSheet = XLSX.utils.json_to_sheet(results.data, { header: [] });
      const workBook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "SheetName");

      XLSX.writeFile(workBook, "PersonEvents.xlsx");
      this.toaster.successToastr("Person events exported successfully");
      this.isDownloading = false;
    });
  }

  reportFormatChange(event: MatRadioChange) {
    this.isDownload = true;
    this.selectedReportFormat = event.value;
  }

  allDatesChange(): void {
    const formDetails = this.form.getRawValue();
    this.isSelected = formDetails.selectAllDates;
    this.params.startDate = this.datePipeService.transform(
      formDetails.startDate,
      Constants.dateString
    );
    this.params.endDate = this.datePipeService.transform(
      formDetails.endDate,
      Constants.dateString
    );
    if (this.isSelected) {
      this.disableFormControl("startDate");
      this.disableFormControl("endDate");
    } else {
      this.enableFormControl("startDate");
      this.enableFormControl("endDate");
    }
  }

  enableFormControl(controlName: string) {
    this.form.get(controlName).enable();
  }

  disableFormControl(controlName: string) {
    this.form.get(controlName).disable();
  }

  selection(selection: any) {
    this.form.patchValue({ claimStatus: selection });
    this.filteredClaimStatuses = this.claimStatuses.filter((b) =>
      b.name.includes(selection)
    );
  }

  showDetail() {
    this.hideVisibility = !this.hideVisibility;
  }

  getUsersToReAllocate(find: string) {
    if (find === "") this.filteredClaimStatuses = this.claimStatuses;
    else
      this.filteredClaimStatuses = this.claimStatuses.filter((b) =>
        b.name.toLocaleLowerCase().includes(find.toLocaleLowerCase())
      );
  }

  stpClaimConfirmPopUp(item: PersonEventSearch, menu: any) {
    this.confirmService
      .confirmWithoutContainer(
        " STP Claim",
        "STP or potential STP claim. No action required as the system will process",
        "Center",
        "Center",
        "Ok",
        "Cancel"
      )
      .subscribe((result) => {
        if (result) {
          this.router.navigateByUrl(
            menu.url + item.eventId + "/" + item.personEventNumber
          );
        }
      });
  }

  reOpenClaimDialog(item: PersonEventSearch) {
    const dialogRef = this.dialog.open(ReOpenReasonDialogComponent, {
      width: "40%",
      maxHeight: "600px",
      data: {
        personEvent: item,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getData(true);
      }
    });
  }

  isReOpenable(personEvent: PersonEventSearch): boolean {
    const isClosedOrFinalized = [
      ClaimStatusEnum.Closed,
      ClaimStatusEnum.ClaimClosed,
      ClaimStatusEnum.Finalized,
    ].includes(personEvent.claimStatus);

    return isClosedOrFinalized && !personEvent.isStraightThroughProcess;
  }

  disableViewClaimStatusAudit( claimId: number): boolean {
    return !claimId;
  }
}
