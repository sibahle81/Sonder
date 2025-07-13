import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClaimInvoiceService } from 'projects/claimcare/src/app/claim-manager/services/claim-invoice.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AuthorisationsFormService } from 'projects/claimcare/src/app/claim-manager/shared/claim-care-shared/claim-authorisations-container/claim-authorisations-form.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';
import { InvoiceDetails } from 'projects/medicare/src/app/medical-invoice-manager/models/medical-invoice-details';
import { TebaInvoice } from 'projects/medicare/src/app/medical-invoice-manager/models/teba-invoice';
import { MedicalUnderAssessReasonServiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-under-assess-reason-service.service';
import { MedicareMedicalInvoiceCommonService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { MedicalInvoiceHealthcareProviderService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice-healthcare-provider.service';
import { MedicalInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/medicare-medical-invoice.service';
import { TariffBaseUnitCostTypesService } from 'projects/medicare/src/app/medical-invoice-manager/services/tariff-base-unit-cost-types.service';
import { TebaInvoiceService } from 'projects/medicare/src/app/medical-invoice-manager/services/teba-invoice.service';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { MedicalInvoiceListDatasource } from '../../../datasources/medical-invoice-list-datasource';
import { TebaInvoiceListDatasource } from '../../../datasources/teba-invoice-list-datasource';
import { HealthcareProviderService } from '../../../services/healthcareProvider.service';
import { ICD10CodeService } from '../../../services/icd10-code-service';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { isNullOrUndefined } from 'util';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Utility } from '../../../constants/utility';
import { HealthCareProviderModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/healthare-provider-model';

@Component({
  selector: 'app-teba-invoice-list',
  templateUrl: './teba-invoice-list.component.html',
  styleUrls: ['./teba-invoice-list.component.css']
})
export class TebaInvoiceListComponent {

  @Input() personEventId = 0;
  @Input() switchBatchType: SwitchBatchType = SwitchBatchType.Teba;//default val used if not set/passed
  claimId: number;
  invoiceDetails: InvoiceDetails[] = [];
  tebaInvoice: TebaInvoice;
  isExternalUser: boolean = false;
  dataSource: MedicalInvoiceListDatasource;
  dataSourceTeba: TebaInvoiceListDatasource;

  pageIndex: number = 0;
  sortDirection: string = "desc";
  pageSize: number = 5;
  orderBy: string = "tebaInvoiceId"
  healthCareProviderModel: HealthCareProviderModel;

  constructor(private formBuilder: UntypedFormBuilder,
    appEventsManager: AppEventsManager,
    private readonly authService: AuthService,
    private activeRoute: ActivatedRoute,
    private readonly medicalInvoiceHealthcareProviderService: MedicalInvoiceHealthcareProviderService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly tariffBaseUnitCostTypesService: TariffBaseUnitCostTypesService,
    private lookupService: LookupService,
    private readonly authorizationService: AuthService,
    public datepipe: DatePipe,
    private router: Router,
    private readonly alertService: AlertService,
    readonly confirmservice: ConfirmationDialogsService,
    private tebaInvoiceService: TebaInvoiceService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private medicalInvoiceService: MedicalInvoiceService,
    private readonly medicalFormService: MedicalFormService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly toasterService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly eventService: ClaimCareService,
    private readonly icd10CodeService: ICD10CodeService,
    public readonly rolePlayerService: RolePlayerService,
    public readonly authorisationsFormService: AuthorisationsFormService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private cdr: ChangeDetectorRef,
    public userService: UserService,
    private readonly medicalUnderAssessReasonServiceService: MedicalUnderAssessReasonServiceService,
    public dialog: MatDialog) {

  }

  currentUrl = this.router.url;

  ngOnInit() {
    this.getTebaPracticeNumberKey()
    this.isExternalUser = !this.authService.getCurrentUser().isInternalUser
    this.dataSourceTeba = new TebaInvoiceListDatasource(this.tebaInvoiceService)
    if (this.currentUrl.includes("teba-invoice-list"))
      this.dataSourceTeba.getData();

    if (this.currentUrl.includes("view-search-results"))
      this.dataSourceTeba.getData(this.pageIndex, this.pageSize, this.orderBy, this.sortDirection, '', this.personEventId);

    this.dataSourceTeba.getDataSubject.subscribe(results => {
      if (results?.length > 0) {
        this.invoiceDetails = [];
        results.forEach(element => {
          this.invoiceDetails.push(MedicareUtilities.convertTebaInvoiceToInvoiceDetails(element))
        });

        this.cdr.detectChanges();
      }

    });

  }

  getRouteData() {
    this.activeRoute.params.subscribe((params: any) => {
      if (params?.id)
        this.personEventId = params.id;

      if (params?.selectedPreAuthId)
        this.claimId = params.selectedPreAuthId//the param name must be fixed - will chat to Bongz to rectify this

    });
  }

  onCaptureNewTebaInvoice() {

    let startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = 0;
    let wizardType: string = "";

    switch (this.switchBatchType) {
      case SwitchBatchType.Teba:
        wizardType = 'capture-teba-invoice';
        break;
      default:
        break;
    }
    let wizardModel = new TebaInvoice();
    wizardModel.claimId = this.claimId > 0 ? this.claimId : 0;
    wizardModel.personEventId = this.personEventId > 0 ? this.personEventId : 0;
    wizardModel.invoicerId = this.healthCareProviderModel.rolePlayerId;
    wizardModel.healthCareProviderName = this.healthCareProviderModel.name;
    wizardModel.practiceNumber = this.healthCareProviderModel.practiceNumber;
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.type = wizardType;

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${wizard.type}/continue/${wizard.id}`);
      })

  }

  ngAfterViewInit() { }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.switchBatchType?.currentValue) {
      this.switchBatchType = changes?.switchBatchType?.currentValue
    }

    if (changes.personEventId?.currentValue) {
      this.personEventId = changes?.personEventId?.currentValue
    }

  }


  onSortPagingSearchedInvoiceTable($event) {
    //values for sort and paging
    this.sortDirection = isNullOrUndefined($event[0]) || $event[0] == "" ? "desc" : $event[0];
    this.pageSize = $event[3] > 0 ? $event[3] : 5;
    this.orderBy = isNullOrUndefined($event[1]) || $event[1] == "" ? "tebaInvoiceId" : $event[1];
    this.pageIndex = $event[2];

    this.dataSourceTeba.getData(this.pageIndex, this.pageSize, this.orderBy, this.sortDirection, '', this.personEventId);
  }

  getTebaPracticeNumberKey() {
    const tebaPracticeNumberKey: string = Utility.TEBA_PRACTICE_NUMBER_KEY;
    this.lookupService.getItemByKey(tebaPracticeNumberKey).subscribe(
      tebaKeyVal => {
        if (tebaKeyVal.length > 0) {
          this.healthcareProviderService.searchHealthCareProviderByPracticeNumberQueryParam(tebaKeyVal).subscribe(healthCareProvider => {
            this.healthCareProviderModel = healthCareProvider;
          });
        }
      }
     );
  }

}