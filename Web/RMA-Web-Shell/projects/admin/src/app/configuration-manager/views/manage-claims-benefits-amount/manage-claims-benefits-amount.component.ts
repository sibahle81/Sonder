import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import {ClaimsBenefitsAmount} from '../../shared/claims-benefits-amount';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import * as XLSX from 'xlsx';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {EditBenefitsAmountDialogComponent} from '../edit-benefits-amount-dialog/edit-benefits-amount-dialog.component'
import { MatDialog } from '@angular/material/dialog';

type TWO_D_REPRESENTATION = any[][];

@Component({
  selector: 'app-manage-claims-benefits-amount',
  templateUrl: './manage-claims-benefits-amount.component.html',
  styleUrls: ['../../../../../../../assets/css/site.css','./manage-claims-benefits-amount.component.css']
})
export class ManageClaimsBenefitsAmountComponent implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isConfiguring$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isActiveBenefitsAmountsView: boolean;

  dataSource: MatTableDataSource<ClaimsBenefitsAmount>;

  loadingNotification: string;
  capturedClaimsBenefitsAmounts: ClaimsBenefitsAmount[] = [];
  createdByAndBenefitsDatesHolder: ClaimsBenefitsAmount;

  claimsBenefitsAmountsFile: File;
  claimsBenefitAmountsFileData: TWO_D_REPRESENTATION;
  doNewClaimsBenefitsConfiguration: boolean;
  hideInputUploadButton: boolean = true;
  sheetTabNumber: number = 1;
  benefitHeadingText: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private readonly toastr: ToastrManager,
    private readonly claimCareService: ClaimCareService,
    private matDialog: MatDialog
  ) {}

  ngOnInit() {
    this.benefitHeadingText = "Active Benefit";
    this.doNewClaimsBenefitsConfiguration = false;
    this.loadActiveClaimsBenefitsAmounts();
  }

  ngAfterContentInit() {
    this.dataSource = new MatTableDataSource<ClaimsBenefitsAmount>();
     setTimeout(() => this.dataSource.paginator = this.paginator);
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'benefitType', show: true },
      { def: 'benefitName', show: true },
      { def: 'formula', show: true },
      { def: 'minimumCompensationAmount', show: true },
      { def: 'maximumCompensationAmount', show: true },
      { def: 'startDate', show: true },
      { def: 'endDate', show: true },
      { def: 'actions', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  loadActiveClaimsBenefitsAmounts(): void {
    this.loadClaimsBenefitsAmounts(true);
    this.isActiveBenefitsAmountsView = true;
  }

  loadHistoricalClaimsBenefitsAmounts(): void {
    this.loadClaimsBenefitsAmounts(false);
    this.isActiveBenefitsAmountsView = false;
  }

  loadClaimsBenefitsAmounts(activeBenefitsAmounts: boolean) {
    this.isLoading$.next(true);
    this.doNewClaimsBenefitsConfiguration = false;

    if (activeBenefitsAmounts) {
      this.loadingNotification =
        "loading active claims benefits amounts...please wait";
      this.benefitHeadingText = "Active Benefit";
    } else {
      this.loadingNotification =
        "loading historical claims benefits amounts...please wait";
      this.benefitHeadingText = "Historical Benefit";
    }

    this.claimCareService
      .getClaimsBenefitsAmounts(activeBenefitsAmounts)
      .subscribe((response) => {
        this.dataSource.data = response;
        setTimeout(() => (this.dataSource.paginator = this.paginator));
        this.isLoading$.next(false);
      });
  }

  configureNewClaimsBenefitsAmounts(): void {
    this.doNewClaimsBenefitsConfiguration = true;
  }

  onExcelFileSelected(event): void {
    this.isConfiguring$.next(true);

    this.claimsBenefitsAmountsFile = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const workBook: XLSX.WorkBook = XLSX.read(bstr, { type: "binary" });

      const workSheetName: string = workBook.SheetNames[this.sheetTabNumber];
      const workSheet: XLSX.WorkSheet = workBook.Sheets[workSheetName];

      this.claimsBenefitAmountsFileData = <TWO_D_REPRESENTATION>(
        XLSX.utils.sheet_to_json(workSheet, { header: 1 })
      );
      this.doCapture();
      this.doConfigureNewClaimsBenefitsAmounts();
    };

    reader.readAsBinaryString(this.claimsBenefitsAmountsFile);
  }

  doCapture(): void {
    this.capturedClaimsBenefitsAmounts = [];

    this.createdByAndBenefitsDatesHolder = this.doCreatedByAndDatesCapture();
    if (this.createdByAndBenefitsDatesHolder === null) return;

    let ttdBenefit: ClaimsBenefitsAmount = this.doTtdCaputre();
    if (ttdBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(ttdBenefit)
      );

    let pdLumpSumBenefit: ClaimsBenefitsAmount = this.doPdLumpSumCaputre();
    if (pdLumpSumBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(pdLumpSumBenefit)
      );

    let pdPensionBenefit: ClaimsBenefitsAmount = this.doPdPensionCaputre();
    if (pdPensionBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(pdPensionBenefit)
      );

    let widowLumpSumBenefit: ClaimsBenefitsAmount =
      this.doWidowLumpSumCaputre();
    if (widowLumpSumBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(widowLumpSumBenefit)
      );

    let fatalSpouseMonthlyPensionBenefit: ClaimsBenefitsAmount =
      this.doFatalSpouseMonthlyPensionCaputre();
    if (fatalSpouseMonthlyPensionBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(fatalSpouseMonthlyPensionBenefit)
      );

    let fatalChildrenMonthlyPensionBenefit: ClaimsBenefitsAmount =
      this.doFatalChildrenMonthlyPensionCaputre();
    if (fatalChildrenMonthlyPensionBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(fatalChildrenMonthlyPensionBenefit)
      );

    let funeralExpensesBenefit: ClaimsBenefitsAmount =
      this.doFuneralExpensesCaputre();
    if (funeralExpensesBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(funeralExpensesBenefit)
      );

    let argumentationKickInBenefit: ClaimsBenefitsAmount =
      this.doArgumentationKickInCapture();
    if (argumentationKickInBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(argumentationKickInBenefit)
      );

    let familiyAllowanceBenefit: ClaimsBenefitsAmount =
      this.doFamiliyAllowanceCapture();
    if (familiyAllowanceBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(familiyAllowanceBenefit)
      );

    let constantAttendenceAllowanceBenefit: ClaimsBenefitsAmount =
      this.doConstantAttendenceAllowanceCapture();
    if (constantAttendenceAllowanceBenefit !== null)
      this.capturedClaimsBenefitsAmounts.push(
        this.doAddCreatedByAndBenefitDates(constantAttendenceAllowanceBenefit)
      );
  }

  doTtdCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[3][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[5][1] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[5][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[72][1] as string;
      claimsBenefitsAmount.benefitType = 1;
      claimsBenefitsAmount.description =
        "Temporary Total Disablement Days Off Benefit";
      claimsBenefitsAmount.linkedBenefits = "";
      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("TTD");
      return null;
    }
  }

  doPdLumpSumCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[7][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[9][1] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[11][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[11][1] as string;
      claimsBenefitsAmount.benefitType = 1;
      claimsBenefitsAmount.description = "PD Lump Sum";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("PD Lump sum");
      return null;
    }
  }

  doPdPensionCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[13][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[15][1] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[15][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[17][1] as string;
      claimsBenefitsAmount.benefitType = 2;
      claimsBenefitsAmount.description = "PD Pension";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("PD Pension");
      return null;
    }
  }

  doWidowLumpSumCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[19][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[21][3] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[21][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[23][3] as string;
      claimsBenefitsAmount.benefitType = 1;
      claimsBenefitsAmount.description = "Fatal Widow Lump Sum";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Widow lump sum");
      return null;
    }
  }

  doFatalSpouseMonthlyPensionCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[25][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[27][3] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[27][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[29][3] as string;
      claimsBenefitsAmount.benefitType = 2;
      claimsBenefitsAmount.description = "Fatal: Spouse Monthly Pension";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Fatal: Spouse Monthly Pension");
      return null;
    }
  }

  doFatalChildrenMonthlyPensionCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[31][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[33][3] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[33][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[35][3] as string;
      claimsBenefitsAmount.benefitType = 2;
      claimsBenefitsAmount.description = "Fatal: Children Monthly Pension";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Fatal: Children Monthly Pension");
      return null;
    }
  }

  doFuneralExpensesCaputre(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[48][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[50][1] as string;
      claimsBenefitsAmount.formula = "";
      claimsBenefitsAmount.minimumCompensationAmount = "";
      claimsBenefitsAmount.benefitType = 1;
      claimsBenefitsAmount.description = "Funeral Expenses";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Funeral Expense");
      return null;
    }
  }

  doArgumentationKickInCapture(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[52][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[54][1] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[54][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[58][1] as string;
      claimsBenefitsAmount.benefitType = 1;
      claimsBenefitsAmount.description = "Augmentation kick-in";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Augmentation kick-in");
      return null;
    }
  }

  doFamiliyAllowanceCapture(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[60][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[62][3] as string;
      claimsBenefitsAmount.formula = this
        .claimsBenefitAmountsFileData[62][2] as string;
      claimsBenefitsAmount.minimumCompensationAmount = this
        .claimsBenefitAmountsFileData[64][3] as string;
      claimsBenefitsAmount.benefitType = 2;
      claimsBenefitsAmount.description = "Family Allowance";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Family Allowance");
      return null;
    }
  }

  doConstantAttendenceAllowanceCapture(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.benefitName = this
        .claimsBenefitAmountsFileData[66][1] as string;
      claimsBenefitsAmount.maximumCompensationAmount = this
        .claimsBenefitAmountsFileData[68][1] as string;
      claimsBenefitsAmount.formula = "";
      claimsBenefitsAmount.minimumCompensationAmount = "";
      claimsBenefitsAmount.benefitType = 2;
      claimsBenefitsAmount.description = "Constant Attendance Allowance";
      claimsBenefitsAmount.linkedBenefits = "";

      return claimsBenefitsAmount;
    } catch (e) {
      this.doCaptureError("Constant Attendance Allowance");
      return null;
    }
  }

  doCreatedByAndDatesCapture(): ClaimsBenefitsAmount {
    try {
      let claimsBenefitsAmount: ClaimsBenefitsAmount =
        new ClaimsBenefitsAmount();

      claimsBenefitsAmount.createdBy = this
        .claimsBenefitAmountsFileData[2][0] as string;
      claimsBenefitsAmount.startDate = new Date(
        this.claimsBenefitAmountsFileData[2][1] as string
      );
      claimsBenefitsAmount.createdDate = new Date(
        this.claimsBenefitAmountsFileData[2][2] as string
      );
      claimsBenefitsAmount.endDate = new Date(
        this.claimsBenefitAmountsFileData[2][3] as string
      );

      return claimsBenefitsAmount;
    } catch (e) {
      this.toastr.errorToastr(
        "Failed to capture benefits start, end dates and created by fields. Excel file not in expected format"
      );
      return null;
    }
  }

  doAddCreatedByAndBenefitDates(
    claimsBenefitsAmount: ClaimsBenefitsAmount
  ): ClaimsBenefitsAmount {
    claimsBenefitsAmount.createdBy =
      this.createdByAndBenefitsDatesHolder.createdBy;
    claimsBenefitsAmount.startDate =
      this.createdByAndBenefitsDatesHolder.startDate;
    claimsBenefitsAmount.endDate = this.createdByAndBenefitsDatesHolder.endDate;
    claimsBenefitsAmount.createdDate =
      this.createdByAndBenefitsDatesHolder.createdDate;

    return claimsBenefitsAmount;
  }

  doCaptureError(benefitType: string): void {
    this.toastr.errorToastr(
      benefitType + " capture failed. Excel file not in expected format"
    );
  }

  doConfigureNewClaimsBenefitsAmounts(): void {
    this.claimCareService
      .addNewClaimsBenefitsAmounts(this.capturedClaimsBenefitsAmounts)
      .subscribe((response) => {
        if (response === this.capturedClaimsBenefitsAmounts.length)
          this.toastr.successToastr("Claim Benefit Amounts added successfully");
        else
          this.toastr.errorToastr(
            "Failed to load all Claim Benefit Amounts successfully"
          );

        this.isConfiguring$.next(false);
        this.doNewClaimsBenefitsConfiguration = false;
        this.loadActiveClaimsBenefitsAmounts();
      });
  }

  getBenefitType(benefitTypeId: number): string {
    if (benefitTypeId === 1) return "Claims";
    else return "Pension";
  }

  openEditBenefitsAmountDialog(
    claimsBenefitsAmount: ClaimsBenefitsAmount
  ): void {
    const dialogRef = this.matDialog.open(EditBenefitsAmountDialogComponent, {
      width: "50%",
      data: {
        claimsBenefitsAmountToEdit: claimsBenefitsAmount,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadActiveClaimsBenefitsAmounts();
    });
  }
}
