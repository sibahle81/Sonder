import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { InitiatePensionCaseData } from '../../../../../shared-penscare/models/initiate-pensioncase-data.model';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { PensionLedgerService } from 'projects/penscare/src/app/pensioncase-manager/services/pension-ledger.service';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import * as moment from 'moment';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ProductClassEnum } from 'projects/shared-models-lib/src/lib/enums/product-class-enum';
import { PensionLedgerStatusEnum } from 'projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { StatusChangeReasonDialogComponent } from '../dialogs/status-change-reason-dialog/status-change-reason-dialog.component';
import { PensionLedgerStatusNotification } from '../../../../../shared-penscare/models/pension-ledger-status-notification.model';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { BeneficiaryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/beneficiary-type-enum';

@Component({
  selector: 'app-pension-ledger',
  templateUrl: './pension-ledger.component.html',
  styleUrls: ['./pension-ledger.component.css']
})
export class PensionLedgerComponent extends WizardDetailBaseComponent<InitiatePensionCaseData> implements OnInit {

  menus: { title: string, action: string, disable: boolean, status?: PensionLedgerStatusEnum }[];
  @Input() pensionCaseContext: PensionCaseContextEnum;

  form: UntypedFormGroup;
  showTable = true;
  showCommutations = false;
  displayedColumns = [
    'beneficiary',
    'recipient',
    'dateOfStabilisation',
    'claimReferenceNumber',
    'benefit',
    'policy',
    'status',
    'normalMonthlyPension',
    'currentMonthlyPension',
    'actions'
  ];

  dataSource: PensionLedger[] = [];
  selectedPensionLedger: PensionLedger;
  isLoading = false;
  beneficiaryType = BeneficiaryTypeEnum;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private wizardService: WizardService,
    private alertService: AlertService,
    private readonly router: Router,
    private dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private pensionLedgerService: PensionLedgerService) {
      super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    if (this.pensionCaseContext == PensionCaseContextEnum.Manage) { // originating from pensionCase Information
      this.dataSource = this.model.pensionLedger;
    } else {
      this.canEdit = false;
    }
  }

  createForm(): void {
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      claimReferenceNumber: new UntypedFormControl({value: '', disabled: true})
    });
  }

  onLoadLookups(): void { }

  populateModel(): void {
    if (!this.model) {
      this['model'] = new InitiatePensionCaseData()
    }
    this.model.pensionLedger = this.dataSource;
    this.showTable = true;
  }

  populateForm(): void {
    if (this.model && this.model.compensationDataSource) {
      this.dataSource = [];
      this.generatePensionLedger();
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  filterMenu(item: PensionLedger) {
    this.menus = null;
    this.menus =
      [
        { title: 'View', action: 'view', disable: false },
        { title: 'Running', action: 'running', disable: !this.canEdit ||  item.status == PensionLedgerStatusEnum.Reopened, status: PensionLedgerStatusEnum.Running },
        { title: 'Reopen', action: 'reopen', disable: !this.canEdit ||  item.status == PensionLedgerStatusEnum.Reopened, status: PensionLedgerStatusEnum.Reopened },
        { title: 'Close', action: 'close', disable: !this.canEdit || item.status == PensionLedgerStatusEnum.Closed, status: PensionLedgerStatusEnum.Closed },
        { title: 'Suspend', action: 'suspend', disable: !this.canEdit ||  item.status == PensionLedgerStatusEnum.Suspended, status: PensionLedgerStatusEnum.Suspended },
        { title: 'Stop', action: 'stopped', disable: !this.canEdit ||  item.status == PensionLedgerStatusEnum.Stopped, status: PensionLedgerStatusEnum.Stopped },
        { title: 'Commutation', action: 'commutation-entry', disable: !this.canEdit || item.beneficiaryType == this.beneficiaryType.Child || [PensionLedgerStatusEnum.Closed, PensionLedgerStatusEnum.Stopped].includes(item.status) },
      ];
  }

  onMenuItemClick(pensionLedger: any, menu: any): void {

    switch (menu.action) {
      case 'view':
        this.selectedPensionLedger = pensionLedger;
        this.showTable = false;
        this.pensionCaseContext = PensionCaseContextEnum.Manage;
        break;
      case 'reopen':
        case 'suspend':
        case 'close':
        case 'stopped':
        case 'running':
          this.showStatusChangeDialog({
            action: menu.action,
            status: menu.status,
            pensionLedgerId: pensionLedger.ledgerId,
            pensionCaseNumber: pensionLedger.pensionCaseNumber,
            beneficiarySurname: pensionLedger.beneficiarySurname
          });
          case 'commutation-entry':
            this.selectedPensionLedger = pensionLedger;
            this.showTable = false
            this.showCommutations = true
          break
    }
  }

  showStatusChangeDialog(inputData) {
    const dialog = this.dialog.open(
      StatusChangeReasonDialogComponent, this.getDialogConfig(inputData)
    );
    dialog.afterClosed().subscribe((data: PensionLedgerStatusNotification) => {
      if (data.status) {
        this.startWizard(data);
      }
    });
  }

  startWizard(data: PensionLedgerStatusNotification) {
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'pension-ledger-status';
    startWizardRequest.linkedItemId = data.pensionLedgerId;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.success(startWizardRequest.type + ' wizard started successfully');
      this.router.navigateByUrl(`/penscare/pensioncase-manager/pension-ledger-status/continue/${result.id}`);
    });
  }

  getDialogConfig(data): MatDialogConfig {
    const config = new MatDialogConfig();
    config.data = data;
    return config;
  }

  generatePensionLedger() {
    const compensationDataSource = this.model.compensationDataSource;
    compensationDataSource.filter((compensation) => compensation.cv !== 0)
    .forEach(compensation => {
      const pensionLedgerItem = new PensionLedger();
      pensionLedgerItem.beneficiaryIdNumber = compensation.beneficiaryIdNumber;
      pensionLedgerItem.beneficiaryFirstName = compensation.beneficiaryFirstName;
      pensionLedgerItem.beneficiarySurname = compensation.beneficiarySurname;
      pensionLedgerItem.recipientFirstName = compensation.recipientFirstName;
      pensionLedgerItem.recipientSurname = compensation.recipientSurname;
      pensionLedgerItem.beneficiaryAge = Number(compensation.age);
      pensionLedgerItem.claimReferenceNumber = compensation.claimReferenceNumber;
      pensionLedgerItem.dateOfAccident = compensation.dateOfAccident;
      pensionLedgerItem.dateOfStabilisation = compensation.dateOfStabilisation;
      pensionLedgerItem.productCode = compensation.productCode;

      pensionLedgerItem.benefitCode = compensation.benefitCode;
      pensionLedgerItem.productOptionName = compensation.productOptionName;
      pensionLedgerItem.productClassName = ProductClassEnum[compensation.productClass];

      pensionLedgerItem.status = PensionLedgerStatusEnum.Open;
      pensionLedgerItem.statusName = compensation.statusName;
      pensionLedgerItem.normalMonthlyPension = compensation.compensation;
      pensionLedgerItem.currentMonthlyPension =  compensation.compensation;

      pensionLedgerItem.currentMonthlyPensionPaye =  compensation.paye;
      pensionLedgerItem.currentMonthlyPensionExcludingTax =  compensation.compensation - compensation.paye;
      pensionLedgerItem.normalMonthlyPensionPaye =  compensation.paye;
      pensionLedgerItem.normalMonthlyPensionPayeExcludingTax =  compensation.compensation - compensation.paye;
      pensionLedgerItem.additionalTax = 0;
      pensionLedgerItem.capitalValue = compensation.cv;

      const dateOfBirth = moment(compensation.beneficiaryDateOfBirth);
      const dateOfStabilisation = moment(compensation.dateOfStabilisation);
      pensionLedgerItem.ageAtDateOfStabilization = dateOfStabilisation.diff(dateOfBirth, 'years');
      pensionLedgerItem.earnings = compensation.earnings;
      pensionLedgerItem.beneficiaryPercentage = compensation.cvPercentage;
      pensionLedgerItem.earningsAllocation = 0.75;

      pensionLedgerItem.av = compensation.av;
      pensionLedgerItem.beneficiaryPercentage = compensation.cvPercentage;
      pensionLedgerItem.beneficiaryType = compensation.beneficiaryType;
      this.dataSource.push(pensionLedgerItem);
    });
  }

  onViewTable() {
    this.showTable = true;
    this.showCommutations = false;
  }
}
