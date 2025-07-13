import { Component, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PensionLedger } from "projects/shared-components-lib/src/lib/models/pension-ledger.model";
import { StartWizardRequest } from "projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request";
import { WizardService } from "projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service";
import { AlertService } from "projects/shared-services-lib/src/lib/services/alert/alert.service";
import { PensionCaseContextEnum } from "../../../shared-penscare/enums/pensioncase-context-enum";
import { CommutationNotification } from "../../models/commutation-notification.model";
import { Commutation } from "../../models/commutation.model";
import { PensCareService } from "../../services/penscare.service";
import { PensionLedgerService } from "../../services/pension-ledger.service";
import { CommutationListDataSource } from "./commutation-entry-list-datasource";


class ComponentInputData {
  pensionCaseContext: PensionCaseContextEnum;
  id: number;
  pensionLedger?: PensionLedger;
}

@Component({
  selector: 'app-commutation-entry-list',
  templateUrl: './commutation-entry-list.component.html',
  styleUrls: ['./commutation-entry-list.component.css'],
  providers: [CommutationListDataSource],
})
export class CommutationEntryListComponent {
  @Input() componentInputData: ComponentInputData;

  title: string = 'Find a Commutation';
  searchPlaceHolder: string =
    'Search by Pension Case Number, Pension Case Type, Individual Type, Beneficiary Surname or Industry Number';
  buttonTitle: string = 'New Comutation Application';

  creatingWizard: boolean;

  constructor(
    public readonly dataSource: CommutationListDataSource,
    private readonly pensionLedgerService: PensionLedgerService,
    private pensCareService: PensCareService,
    private wizardService: WizardService,
    private alertService: AlertService,
    private readonly router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.pensionLedgerId) {
        this.componentInputData = new ComponentInputData();
        this.componentInputData['pensionCaseContext'] =
          PensionCaseContextEnum.CommutationEntries;
        this.componentInputData['id'] = params.pensionLedgerId;
      }
    });
  }

  newApplication() {
    if (!this.componentInputData.pensionLedger) {
      this.creatingWizard = true;
      this.pensCareService
        .getCommutationLedgersId(this.componentInputData.id)
        .subscribe((response) => {
          this.startWizard(this.createNotification('add', response[0]));
        });
    } else {
      this.startWizard(
        this.createNotification('add', this.componentInputData.pensionLedger)
      );
    }
  }

  createNotification(
    action: string,
    pensionLedger: PensionLedger
  ): CommutationNotification {
    const comumutation = new Commutation();
    const commutationNotification: CommutationNotification = {
      action: action,
      firstName: pensionLedger.beneficiaryFirstName,
      lastName: pensionLedger.beneficiarySurname,
      ledger: pensionLedger,
      commutation: comumutation,
    };
    return commutationNotification;
  }

  startWizard(data: CommutationNotification) {
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'commutation-wizard';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.creatingWizard = false;
      this.alertService.success(
        String.capitalizeFirstLetter(data.action) +
        ' commutation wizard started successfully'
      );
      this.router.navigateByUrl(
        `/penscare/commutation-wizard/continue/${result.id}`
      );
    });
  }

  onMenuItemClick(item, menu) { }

  //table definition
  metaData = {
    displayColumns: [
      'createdDate',
      'commutationReasonId',
      'requestedDate',
      'ccSchedule',
      'commutationAmount',
      'commutationAmountRequested',
      'commutationPaye',
      'mpfPension',
      'salary',
      'available',
      'modifiedBy',
      'reference',
      'commutationStatusId',
      //'document',
      'action',
    ],
    columnsDef: {
      createdDate: {
        displayName: 'Date',
        type: 'date',
        sortable: false,
      },
      commutationReasonId: {
        displayName: 'Reason',
        type: 'text',
        sortable: false,
      },
      requestedDate: {
        displayName: 'Date Received',
        type: 'date',
        sortable: false,
      },
      ccSchedule: {
        displayName: 'Schedule',
        type: 'text',
        sortable: false,
      },
      commutationAmount: {
        displayName: 'Normal Pension',
        type: 'currency',
        sortable: false,
      },
      commutationAmountRequested: {
        displayName: 'Amount',
        type: 'currency',
        sortable: false,
      },
      commutationPaye: {
        displayName: 'PAYE',
        type: 'currency',
        sortable: false,
      },
      mpfPension: {
        displayName: 'Impact',
        type: 'currency',
        sortable: false,
      },
      salary: {
        displayName: 'PAYE',
        type: 'currency',
        sortable: false,
      },
      available: {
        displayName: 'Impact',
        type: 'currency',
        sortable: false,
      },
      modifiedBy: {
        displayName: 'Captured By',
        type: 'text',
        sortable: false,
      },
      reference: {
        displayName: 'Recipient Name',
        type: 'text',
        sortable: false,
      },
      commutationStatusId: {
        displayName: 'Status',
        type: 'text',
        sortable: false,
      },
      action: {
        displayName: 'Action',
        type: 'action',
        sortable: false,
      }
    },
  };
}
