import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { MatMenuModule } from '@angular/material/menu';
import { PreauthSearchComponent } from '../../../preauth-manager/views/preauth-search/preauth-search-component';
import { MediCarePreAuthService } from '../../../preauth-manager/services/medicare-preauth.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { DigiCareService } from 'projects/digicare/src/app/digi-manager/services/digicare.service';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { HealthcareProviderService } from '../../../medi-manager/services/healthcareProvider.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Invoice } from '../../../medical-invoice-manager/models/medical-invoice';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { PreauthTypeEnum } from '../../../medi-manager/enums/preauth-type-enum';
import { ProsthetistQuote } from '../../../preauth-manager/models/prosthetistquote';
import { MedicareUtilities } from '../../medicare-utilities';
import { CrudActionType } from '../../enums/crud-action-type';
import { MedicareMedicalInvoiceCommonService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';
import { SwitchBatchType } from '../../enums/switch-batch-type';

@Component({
  selector: 'app-medicare-search-menus',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule, SharedComponentsLibModule],
  templateUrl: './medicare-search-menus.component.html',
  styleUrls: ['./medicare-search-menus.component.css']
})
export class MedicareSearchMenusComponent implements OnInit {


  error: Error;
  loadingMessage: string;
  isExternalUser = false;

  disable_coid_vaps_e2e_medicare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_MediCare');
  switchBatchType: typeof SwitchBatchType;

  constructor(
    readonly mediCarePreAuthService: MediCarePreAuthService,
    private readonly medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly digiCareService: DigiCareService,
    private readonly wizardService: WizardService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    private readonly datePipe: DatePipe,
    private readonly healthcareProviderService: HealthcareProviderService,
    readonly confirmservice: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    //Check if featureflag 

    if (this.disable_coid_vaps_e2e_medicare) {
      this.router.navigate(['/access-denied', 'Access to MediCare is currently restricted. Please contact support for more information.']);
    }

    this.isExternalUser = !this.authService.getCurrentUser().isInternalUser;
  }


  captureHospitalAuth() {
    let preauthSearchComponent = new PreauthSearchComponent(this.mediCarePreAuthService, this.medicareMedicalInvoiceCommonService, this.router, this.authService, this.userService, this.digiCareService, this.wizardService, this.wizardConfigurationService, this.datePipe, this.healthcareProviderService, this.confirmservice, this.cdr);
    preauthSearchComponent.onStartClick(PreauthTypeEnum.Hospitalization);

  }
  captureTreatmentAuth() {
    let preauthSearchComponent = new PreauthSearchComponent(this.mediCarePreAuthService, this.medicareMedicalInvoiceCommonService, this.router, this.authService, this.userService, this.digiCareService, this.wizardService, this.wizardConfigurationService, this.datePipe, this.healthcareProviderService, this.confirmservice, this.cdr);
    preauthSearchComponent.onStartClick(PreauthTypeEnum.Treatment);
  }

  captureProstheticAuth() {
    const startWizardRequest = new StartWizardRequest(); let wizardModel = new ProsthetistQuote();
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = MedicareUtilities.preAuthWizardType(PreauthTypeEnum.Prosthetic, CrudActionType.link);

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/${startWizardRequest.type}/continue/${wizard.id}`);
      })
  }

  captureChronicAuth() {
    let preauthSearchComponent = new PreauthSearchComponent(this.mediCarePreAuthService, this.medicareMedicalInvoiceCommonService, this.router, this.authService, this.userService, this.digiCareService, this.wizardService, this.wizardConfigurationService, this.datePipe, this.healthcareProviderService, this.confirmservice, this.cdr);
    preauthSearchComponent.onStartClick(PreauthTypeEnum.ChronicMedication);
  }

  onCaptureNewInvoice() {
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new Invoice();
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = 'capture-medical-invoice';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/medical-invoice-manager/capture-medical-invoice/continue/${wizard.id}`);
      })
  }

  listProstheticQuotes() {
    this.router.navigate(['/medicare/prosthetist-quote-list']);
  }

  medEDISwitchBatches() {
    this.router.navigateByUrl(`medicare/invoice-switch-batch-search/${SwitchBatchType.MedEDI}`);
  }

  tebaSwitchBatches() {
    this.router.navigateByUrl(`medicare/invoice-switch-batch-search/${SwitchBatchType.Teba}`);
  }

  onCaptureNewTebaInvoice() {
    const startWizardRequest = new StartWizardRequest();
    let wizardModel = new Invoice();
    startWizardRequest.data = JSON.stringify(wizardModel);
    startWizardRequest.linkedItemId = 0;
    startWizardRequest.type = 'capture-teba-invoice';

    this.wizardService.startWizard(startWizardRequest)
      .subscribe((wizard) => {
        this.router.navigateByUrl(`medicare/work-manager/capture-teba-invoice/continue/${wizard.id}`);
      })
  }

  selectedHCPContextChanged($event: UserHealthCareProvider) {

  }
}
