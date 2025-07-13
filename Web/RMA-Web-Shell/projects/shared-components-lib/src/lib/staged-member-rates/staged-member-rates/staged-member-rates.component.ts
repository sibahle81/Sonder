import { Component, OnInit } from '@angular/core';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { BehaviorSubject } from 'rxjs';
import { DefaultConfirmationDialogComponent } from '../../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { KeyValue } from '@angular/common';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { LoadRate } from 'projects/clientcare/src/app/policy-manager/shared/entities/load-rate';

@Component({
  selector: 'staged-member-rates',
  templateUrl: './staged-member-rates.component.html',
  styleUrls: ['./staged-member-rates.component.css']
})
export class StagedMemberRatesComponent extends PermissionHelper implements OnInit {

  permission = 'Approve Staged Member Rates';

  reportUrl = 'RMA.Reports.ClientCare.Member/Renewals/RMAStagedMemberRatesReport';
  parameters: KeyValue<string, string>[] = [];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  canApprove$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClasses: IndustryClassEnum[];
  message: string;

  standardFiltersExpanded = true;
  advancedFiltersExpanded: boolean;

  selectedDebtor: RolePlayer;
  selectedIndustryClass: number;
  selectedIndustryClassName: string;
  defaultIndustryClassParameter: KeyValue<string, string>[] = [{ key: 'IndustryClassId', value: 'all' }];
  triggerReset: boolean;

  constructor(
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
    this.setIndustryClass(this.defaultIndustryClassParameter);
    this.isLoading$.next(false);
  }

  openConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Open ${this.selectedIndustryClassName} Renewal Period?`,
        text: `If you proceed, notifications will be sent to each member included in the approved member rates list. Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.approved();
      } else {
        this.reset();
      }
    });
  }

  approved() {
    this.isLoading$.next(true);
    this.message = null;

    this.declarationService.startRenewalPeriod(this.selectedIndustryClass).subscribe(result => { }, error => {
      this.message = `this process will run in the background until complete. Please monitor your message inbox for updates`;
      this.isLoading$.next(false);
    });

    this.message = `Opening ${this.selectedIndustryClassName} renewal period has started. When this process is completed, all users that have permission to monitor this process will receive a system notification`;
    this.standardFiltersExpanded = false;
    this.isLoading$.next(false);
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

  setIndustryClass($event: KeyValue<string, string>[]) {
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;
    this.selectedDebtor = null;

    this.defaultIndustryClassParameter = $event;
    this.parameters = this.defaultIndustryClassParameter;
    this.setParameters(this.parameters);

    this.selectedIndustryClassName = this.defaultIndustryClassParameter.find(s => s.key == 'IndustryClassId')?.value != 'all' ? IndustryClassEnum[this.defaultIndustryClassParameter.find(s => s.key == 'IndustryClassId').value] : 'All';
    this.selectedIndustryClass = this.defaultIndustryClassParameter.find(s => s.key == 'IndustryClassId')?.value != 'all' ? +this.defaultIndustryClassParameter.find(s => s.key == 'IndustryClassId').value : 0;
    this.message = null;

    this.canApprove();
  }

  reset() {
    this.parameters = this.defaultIndustryClassParameter;
    this.setIndustryClass(this.parameters);
  }

  resetAll() {
    this.parameters = [{ key: 'IndustryClassId', value: 'all' }];
    this.setIndustryClass(this.parameters);
    this.triggerReset = !this.triggerReset;
  }

  setDebtor($event: RolePlayer) {
    this.advancedFiltersExpanded = false;
    this.selectedDebtor = $event;
    const parameter = [{ key: 'RolePlayerId', value: $event.rolePlayerId.toString() }];
    this.setParameters(parameter);
  }

  rateSelected($event: LoadRate) {
    this.toggleForm();
  }

  toggleForm() {
    this.showForm$.next(!this.showForm$.value);
  }

  canApprove() {
    const defaultIndustryClass = this.parameters.find(s => s.key == 'IndustryClassId');
    this.canApprove$.next(defaultIndustryClass && defaultIndustryClass.value != 'all' && this.userHasPermission(this.permission));
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
