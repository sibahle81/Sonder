import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'close-renewal-period',
  templateUrl: './close-renewal-period.component.html',
  styleUrls: ['./close-renewal-period.component.css']
})
export class CloseRenewalPeriodComponent extends PermissionHelper implements OnInit {

  permission = 'Close Renewal Period';

  reportUrl = 'RMA.Reports.ClientCare.Member/Renewals/RMANonCompliantRenewalsReport';
  parameters: KeyValue<string, string>[] = [];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isReportViewerLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  form: UntypedFormGroup;

  industryClasses: IndustryClassEnum[];
  message: string;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly declarationService: DeclarationService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: false }, Validators.required],
    });

    this.isLoading$.next(false);
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Close Renewal Period?',
        text: 'If you proceed, penalties and inflation may be applied to non-compliant member declarations & invoices may be released. Are you sure you want to proceed?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.generateEstimates();
      } else {
        this.reset();
      }
    });
  }

  setParameter(key: string, value: string) {
    this.setParameters([{ key: key, value: (+IndustryClassEnum[value]).toString() }]);
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

  reset() {
    this.message = null;
  }

  generateEstimates() {
    this.isLoading$.next(true);
    this.message = null;

    const industryClass = this.form.controls.industryClass.value;

    this.declarationService.closeRenewalPeriod(industryClass).subscribe(result => { }, error => {
      this.message = `this process will run in the background until complete. Please monitor your message inbox for updates`;
      this.isLoading$.next(false);
    });

    this.message = `Closing of the renewal period has started. When this process is completed, all users that have permission to monitor this process will receive a system notification. Policies that have already been queued for closing will be managed by the system and will not be processed multiple times`;
    this.isLoading$.next(false);
  }

  reportViewerCompleted($event: boolean) {
    this.isReportViewerLoading$.next($event);
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
