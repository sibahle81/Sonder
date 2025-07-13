import { Component, Inject, ViewChild } from '@angular/core';
import { UntypedFormGroup, FormBuilder, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PersonEventModel } from '../../../../entities/personEvent/personEvent.model';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { ClaimInvoiceService } from 'projects/claimcare/src/app/claim-manager/services/claim-invoice.service';
import { ClaimEstimate } from '../../../../entities/personEvent/claimEstimate';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { Claim } from '../../../../entities/funeral/claim.model';
import { ClaimEarningService } from 'projects/claimcare/src/app/claim-manager/Services/claim-earning.service';
import { Earning } from '../../../../entities/earning-model';
import { EarningsTypeEnum } from 'projects/shared-models-lib/src/lib/enums/earnings-type-enum';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'select-claim-benefit',
  templateUrl: './select-claim-benefit.component.html',
  styleUrls: ['./select-claim-benefit.component.css']
})
export class SelectClaimBenefitComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading benefits...please wait');

  form: UntypedFormGroup;
  personEvent: PersonEventModel;
  claim: Claim;

  earnings: Earning[];
  hasAccidentEarnings = false;

  dataSource = new MatTableDataSource<Benefit>();
  selectedBenefits: Benefit[] = [];
  claimEstimate: ClaimEstimate[] = [];

  @ViewChild(MatTable, { static: false }) table: MatTable<Benefit>;
  @ViewChild(MatPaginator, { static: false }) set paginator(value: MatPaginator) {
    if (this.dataSource) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<SelectClaimBenefitComponent>,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly claimService: ClaimCareService,
    private readonly claimEarningService: ClaimEarningService,
    public dialog: MatDialog,
  ) {
    this.personEvent = this.data.personEvent;
    this.claim = this.data.claim;
  }

  ngOnInit() {
    this.createForm();
    this.getData();
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      filter: new UntypedFormControl(''),
      filterUser: new UntypedFormControl(''),
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit() {
    this.dialogRef.close(this.selectedBenefits);
  }

  benefitSelected(benefit: Benefit) {
    let index = this.selectedBenefits.findIndex(a => a.id === benefit.id);
    if (index > -1) {
      this.selectedBenefits.splice(index, 1);
    } else {
      this.selectedBenefits.push(benefit);
    }
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'select', show: true },
      { def: 'code', show: true },
      { def: 'displayName', show: true },
      { def: 'estimateType', show: true },
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getData() {
    this.getPersonEventEarnings();
  }

  getPersonEventEarnings() {
    this.claimEarningService.getEarningsByPersonEventId(this.personEvent.personEventId).subscribe(results => {
      if (results && results.length > 0) {
        this.earnings = results;
        this.hasAccidentEarnings = this.earnings.some(s => s.earningsType == EarningsTypeEnum.Accident);
      }

      this.getClaimEstimates();
    });
  }

  getClaimEstimates() {
    this.claimInvoiceService.GetClaimEstimateByPersonEvent(this.personEvent.personEventId).subscribe((result) => {
      if (result) {
        this.claimEstimate = result;
      }
      this.claimService.getClaimBenefits(this.claim.claimId).subscribe(results => {
        if (results) {
          this.setDataSource(results);
        }
        this.isLoading$.next(false);
      });
    });
  }

  getEstimateType(id: number) {
    return this.formatText(EstimateTypeEnum[id]);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'N/A';
  }

  checkBenefitExist(benefit: Benefit): boolean {
    let index = this.claimEstimate.findIndex(a => a.benefitId === benefit.id);
    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  setDataSource(benefits: Benefit[]) {
    this.dataSource = new MatTableDataSource<Benefit>(benefits);
    this.dataSource.paginator = this.paginator;
  }
}
