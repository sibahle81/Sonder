import { Component, OnInit } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { LegalCommissionRecon } from 'projects/fincare/src/app/shared/models/legal-recon';
import { BehaviorSubject } from 'rxjs';
import { BillingService } from '../../../../services/billing.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LegalCollectionTypeEnum } from 'projects/fincare/src/app/shared/enum/legal-collection-type.enum';

@Component({
  selector: 'app-handed-recon-upload',
  templateUrl: './handed-recon-upload.component.html',
  styleUrls: ['./handed-recon-upload.component.css']
})
export class HandedReconUploadComponent implements OnInit {

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('processing...please wait');

  // inputs for the xml parser component
  title = 'Handover Recon';
  expectedColumnHeadings = ['ARAccount','Company name','AttorneyName','Commission','Updated Balance'];
  invalidRowsForExport: any[][] = [];

  recons: LegalCommissionRecon[];
  selectedPeriodId: number;
  form:FormGroup;
  selectedCollectionTypeId: number;
  collectionTypes: { id: number, name: string }[] = [];

  constructor(
    private readonly billingService: BillingService,
    private readonly alertService: ToastrManager,private readonly formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.collectionTypes = this.ToKeyValuePair(LegalCollectionTypeEnum);
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      collectionType: []
    });
  }

  receiveFileData($event: any[][]) {
    if ($event && $event.length > 0) {
      this.parseFileData($event);
    }
  }

  parseFileData(fileData: any[][]) {
    this.invalidRowsForExport = [];
    this.recons = [];
   
    fileData.forEach(row => {
      const recon = new LegalCommissionRecon();
      recon.debtorNumber = row[0] as string;
      recon.periodId = this.selectedPeriodId;
      recon.attorneyName = row[2] as string;
      recon.collectionTypeId = this.selectedCollectionTypeId;
      recon.updatedBalance = row[4] as number;
      recon.commissionRate = row[3] as number;
      recon.debtorName = row[1] as string;
     
      if (this.isValid(recon, row)) {
        this.recons.push(recon);
      } else {
        this.invalidRowsForExport.push(row);
      }
    });
  }

  isValid(recon: LegalCommissionRecon, row: any[]): boolean {
    let isValid = true;
    let failedValidationReasons = '';

    // Validate Details
    if (!recon.debtorNumber) {
      failedValidationReasons += 'Debtor number is invalid, ';
      isValid = false;
    }  
   
    if (isValid) {
      this.addReasonColumn('N/A', row);
    } else {
      this.addReasonColumn(failedValidationReasons, row);
    }

    return isValid;
  }

  addReasonColumn(reasons: any, row: any[]) {
    row.push(reasons);
  }

  submit($event: boolean) {
    if ($event) {
      this.isLoading$.next(true);
      this.billingService.uploadHandoverRecon(this.recons).subscribe(result => {
        if (result) {
          this.alertService.successToastr(`recons successfully uploaded`);        
        } else {
          this.alertService.errorToastr('no recons were updated');
        }
        this.isLoading$.next(false);
      });
    }
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  removePercentageSign(input: string | null | undefined): number | null {
    if (!input) return null;
    const cleaned = input.replace('%', '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  periodFilterChanged(item : [{ key:string, value: number }]) {
    if(item[0] && item[0].value){
      this.selectedPeriodId = item[0].value;
    }
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  } 
}
