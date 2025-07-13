import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from '../../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { DatePipe, KeyValue } from '@angular/common';

@Component({
  selector: 'bulk-invoice-release',
  templateUrl: './bulk-invoice-release.component.html',
  styleUrls: ['./bulk-invoice-release.component.css']
})
export class BulkInvoiceReleaseComponent extends PermissionHelper implements OnInit {

  permission = 'Release Bulk Member Invoices';

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  form: UntypedFormGroup;

  industryClasses: IndustryClassEnum[];
  message: string;
  minDate: Date;

  reportUrl = 'RMA.Reports.ClientCare.Member/Collections/RMABundleRaiseReport';
  parameters: KeyValue<string, string>[] = [];

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly declarationService: DeclarationService,
    public dialog: MatDialog,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.minDate = new Date().getCorrectUCTDate();
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: false }, Validators.required],
      effectiveToDate: [{ value: null, disabled: false }, Validators.required]
    });

    this.isLoading$.next(false);
  }

  setParameter(key: string, value: string) {
    this.setParameters([{ key: key, value: key == 'IndustryClassId' ? (+IndustryClassEnum[value]).toString() : this.datePipe.transform(value, 'yyyy-MM-dd') }]);
    this.reset();
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {

      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });

      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  processInvoices() {
    this.isLoading$.next(true);
    this.message = null;

    const industryClass = this.form.controls.industryClass.value;
    const effectiveToDate = this.form.controls.effectiveToDate.value;

    this.declarationService.releaseBulkInvoices(industryClass, effectiveToDate).subscribe(result => { }, error => {
      this.isLoading$.next(false);
    });

    this.message = `Releasing ${industryClass} Invoice(s) has started. When this process is completed, all users that have permission to monitor this process will receive a system notification`;
    this.isLoading$.next(false);
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Release Invoices?',
        text: `If you proceed, all invoices with an effective date before or equal to ${this.form.controls.effectiveToDate.value} will be released. Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processInvoices();
      } else {
        this.reset();
      }
    });
  }

  reset() {
    this.message = null;
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
