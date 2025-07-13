import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PreAuthorisation } from 'projects/medicare/src/app/preauth-manager/models/preauthorisation';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { isNullOrUndefined } from 'util';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthCare-provider-model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { PreAuthPractitionerTypeSetting } from 'projects/medicare/src/app/medi-manager/models/preAuth-practitioner-type-setting';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PractitionerTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/practitioner-type-enum';
import { PreauthTypeEnum } from 'projects/medicare/src/app/medi-manager/enums/preauth-type-enum';
import { MedicareUtilities } from 'projects/medicare/src/app/shared/medicare-utilities';
import { BehaviorSubject } from 'rxjs';
import ReportFormValidationUtility from 'projects/digicare/src/app/digi-manager/Utility/ReportFormValidationUtility';
import { SwitchBatchType } from 'projects/medicare/src/app/shared/enums/switch-batch-type';
import { of } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
	selector: 'healthcareprovider-search',
	templateUrl: './healthcareprovider-search.component.html',
	styleUrls: ['./healthcareprovider-search.component.css'],
	providers: [HealthcareProviderService]
})

export class HealthCareProviderSearchComponent extends WizardDetailBaseComponent<PreAuthorisation> implements OnInit {
	public form: UntypedFormGroup;

	@Input() healthCareProviderSearchType: string;
	@Input() showTelephoneNumber: boolean = false;
	@Input() controlMode: string;
	@Output() healthCareProviderChanged: EventEmitter<HealthCareProvider> = new EventEmitter<HealthCareProvider>();
	@Output() telephoneNumberChanged: EventEmitter<number> = new EventEmitter<number>();
	@Output() healthCareProviderLoaded: EventEmitter<HealthCareProvider> = new EventEmitter<HealthCareProvider>();

	filterRecordsCtrl = new UntypedFormControl();
	healthCareProviders: HealthCareProvider[];
	isLoading = false;
	errorMsg: string;
	healthCareProvider: HealthCareProvider;
	showSearchProgress = false;
	disabled: boolean = true;
	tenant: Tenant;
	disablePracticeNumber = false;
	authType: string;
	isInternalUser: boolean = false;
	showSearchControl: boolean = true;
	currentHealthCareProvider: HealthCareProvider = null;
	loadingHCPData$ = new BehaviorSubject<boolean>(false);
	currentUser:User;
	isHospitalError = false;

	constructor(appEventsManager: AppEventsManager,
		authService: AuthService,
		activatedRoute: ActivatedRoute,
		private readonly formBuilder: UntypedFormBuilder,
		private readonly HealthcareProviderService: HealthcareProviderService,
		private readonly mediCarePreAuthService: MediCarePreAuthService,
		private readonly userService: UserService,
		private readonly toasterService: ToastrManager,
		private router: Router
	) {
		super(appEventsManager, authService, activatedRoute);
		this.createForm();
		this.currentUser = this.authService.getCurrentUser();
		this.isInternalUser = this.currentUser.isInternalUser;
		this.authType = MedicareUtilities.getPreauthTypeName(this.currentUrl);
		
	}

	currentUrl = this.activatedRoute.snapshot.params.type;
	wizardData
	switchBatchType: SwitchBatchType

	ngOnInit() {
		// Encode 'val.name' if the provided value is a 'HealthCareProvider' object otherwise
		//   just encode the value itself.
		let fEncodeValue = function (val) {
			let filterString = Object.getPrototypeOf(val) == HealthCareProvider.prototype ? val.name : val;
			return encodeURIComponent(filterString);
		};

		// Return true if the provided value is NOT a string of 3 or more chars
		let fNotDefined = function (val) { return val === void 0 || val === null || val === "" || val.length < 3 || typeof(val) !== 'string'};

		this.healthCareProvider = new HealthCareProvider();

		this.filterRecordsCtrl.valueChanges
			.pipe(
				debounceTime(500),
				tap(() => {
					this.healthCareProviders = HealthCareProvider[0];
					this.isLoading = true;
				}),
				switchMap(value => fNotDefined(value) ? [] : this.HealthcareProviderService.filterHealthCareProviders(fEncodeValue(value))
					.pipe(
						finalize(() => {
							this.isLoading = false;
						})
					)
				)
			)
			.subscribe(healthCareProviders => {

				if (healthCareProviders) {
					if (healthCareProviders.length == 1)
					{
						this.setHealthCareProviderDetails(healthCareProviders[0]);
						this.filterRecordsCtrl.setValue('');
						this.isLoading = false;
					}
					else
						this.healthCareProviders = healthCareProviders;
				}
			});
	}

	getExternalHealthCareProvider(user: User): void {
		this.loadingHCPData$.next(true);
		let currentUserHCPs: UserHealthCareProvider[];
		this.userService.getUserHealthCareProviders(user.email).subscribe((x) => {
			currentUserHCPs = x;
		},
			(error) => {
			},
			() => {
				if (!isNullOrUndefined(currentUserHCPs) && currentUserHCPs.length > 0) {
					this.HealthcareProviderService.filterHealthCareProviders(currentUserHCPs[0].practiceNumber)
						.subscribe(healthCareProviders => {
							if (!isNullOrUndefined(healthCareProviders) && healthCareProviders.length > 0) {
								this.currentHealthCareProvider = healthCareProviders[0];
							}
						},
							() => { },
							() => {
								if (!isNullOrUndefined(this.currentHealthCareProvider)) {
									let preAuthPractitionerTypeSetting = new PreAuthPractitionerTypeSetting();
									this.mediCarePreAuthService.getPreAuthPractitionerTypeSetting(PreauthTypeEnum.Hospitalization, this.currentHealthCareProvider.providerTypeId).subscribe(
										(result) => {
											preAuthPractitionerTypeSetting = result as unknown as PreAuthPractitionerTypeSetting;
										},
										(error) => {
										},
										() => {
											if (preAuthPractitionerTypeSetting.isHospital && this.authType == PreauthTypeEnum[PreauthTypeEnum.Hospitalization]) {
												this.showSearchControl = false;
												this.setHealthCareProviderDetails(this.currentHealthCareProvider);
											}
											else if (preAuthPractitionerTypeSetting.isTreatingDoctor && this.authType == PreauthTypeEnum[PreauthTypeEnum.TreatingDoctor]) {
												this.showSearchControl = false;
												this.setHealthCareProviderDetails(this.currentHealthCareProvider);
											}
											else if (preAuthPractitionerTypeSetting.isTreatingDoctor && this.authType == PreauthTypeEnum[PreauthTypeEnum.Hospitalization]) {
												this.showSearchControl = true;
												if (this.healthCareProviderSearchType == PreauthTypeEnum[PreauthTypeEnum.TreatingDoctor]) {
													this.showSearchControl = false;
													this.setHealthCareProviderDetails(this.currentHealthCareProvider);
												}
											}
											else if (preAuthPractitionerTypeSetting.isTreatingDoctor && this.authType == PreauthTypeEnum[PreauthTypeEnum.Treatment]) {
												this.showSearchControl = false;
												this.setHealthCareProviderDetails(this.currentHealthCareProvider);
											}
											else{
												this.showSearchControl = false;
												this.setHealthCareProviderDetails(this.currentHealthCareProvider);
											}
										}
									);
									sessionStorage.setItem('currentHealthCareProvider', JSON.stringify(this.currentHealthCareProvider));									
								}
							}
						);
				}
				this.loadingHCPData$.next(false);
			}
		);
	}

	displayNull(healthCareProvider: HealthCareProvider): string {
		return null;
	}

	onSelectChanged(evtOption: any) {
		if (evtOption && evtOption.value) {
			this.isHospitalError = this.shouldBlockOnIsHolpitalAndAuthType((evtOption.value as HealthCareProvider).isHospital)
			if(this.isHospitalError)
			{
				return;
			}
			this.setHealthCareProviderDetails(evtOption.value);
		}
	}

	setHealthCareProviderDetails(healthCareProvider: HealthCareProvider) {
		const form = this.form.controls;
		this.healthCareProviderChanged.emit(healthCareProvider);
		if(!isNullOrUndefined(healthCareProvider)){
		form.healthcareProviderPracticeNumber.setValue(healthCareProvider.practiceNumber);
		form.healthcareProviderName.setValue(healthCareProvider.name);
		form.healthcareProviderId.setValue(healthCareProvider.rolePlayerId);
		form.providerTypeId.setValue(healthCareProvider.providerTypeId);
		form.practitionerTypeName.setValue(healthCareProvider.practitionerTypeName);
		form.isVat.setValue(healthCareProvider.isVat);
		}
	}

	getHealthCareProviderDetails(): HealthCareProvider {
		const form = this.form as UntypedFormGroup;
		let healthCareProvider = new HealthCareProvider();
		healthCareProvider.practiceNumber = form.controls.healthcareProviderPracticeNumber.value;
		healthCareProvider.name = form.controls.healthcareProviderName.value;
		healthCareProvider.rolePlayerId = form.controls.healthcareProviderId.value;
		healthCareProvider.providerTypeId = form.controls.providerTypeId.value;
		healthCareProvider.practitionerTypeName = form.controls.practitionerTypeName.value;
		return healthCareProvider;
	}

	createForm(): void {
		if (this.form) { return; }

		this.form = this.formBuilder.group({
			healthcareProviderPracticeNumber: new UntypedFormControl(''),
			healthcareProviderName: new UntypedFormControl({ value: '', disabled: this.disabled }),
			healthcareProviderId: new UntypedFormControl(''),
			providerTypeId: new UntypedFormControl(''),
			practitionerTypeName: new UntypedFormControl({ value: '', disabled: this.disabled }),
			telephoneNumber:  new UntypedFormControl(''),
			isVat: new UntypedFormControl(''),
		});
		if (this.controlMode === "View") {
			this.showSearchControl = false;
		}
	}

	onLoadLookups(): void {
	}

	populateForm(): void {
		if (!isNullOrUndefined(this.context)) {
			this.wizardData = JSON.parse(this.context?.wizard?.data)[0];
			if (!isNullOrUndefined(this.wizardData['switchBatchType'])) {
				this.switchBatchType = +this.wizardData['switchBatchType'];
				switch (this.switchBatchType) {
					case SwitchBatchType.Teba:
						this.model.healthCareProviderId = !isNullOrUndefined(this.wizardData['invoicerId']) && +this.wizardData['invoicerId'] > 0 ? +this.wizardData['invoicerId'] : 0;//for Teba batch invoices
						break;
					default:
						break;
				}
			}
			else if(!isNullOrUndefined(this.wizardData['invoicerId']) && this.wizardData['invoicerId'] > 0 || this.context?.wizard?.linkedItemId > 0 )
			{
				this.model.healthCareProviderId = !isNullOrUndefined(this.wizardData['invoicerId']) && +this.wizardData['invoicerId'] > 0 ? +this.wizardData['invoicerId'] : 0;
			}
		}

		if (this.currentUrl.includes("capture-preauth-prosthetist-quote") && this.authType == PreauthTypeEnum[PreauthTypeEnum.Prosthetic]) {
			this.HealthcareProviderService.getHealthCareProviderById(Number(this.wizardData['rolePlayerId'])).subscribe(result => {
				this.setHealthCareProviderDetails(result);
			});
		}
		else {
			if (!this.model || !this.model.healthCareProviderId) return;

			this.HealthcareProviderService.getHealthCareProviderById(this.model.healthCareProviderId).subscribe(result => {
				this.setHealthCareProviderDetails(result);
			});
		}
	}

	populateModel(): void {
		if (!this.model) return;
		const form = this.form.controls;
		if (!form.healthcareProviderId) return;

		if (this.healthCareProviderSearchType === undefined) {
			this.model.healthCareProviderId = form.healthcareProviderId.value;
			this.model.practitionerTypeId = form.providerTypeId.value;
			this.model.healthCareProviderName = form.healthcareProviderName.value;
			this.model.practiceNumber = form.healthcareProviderPracticeNumber.value;
			this.model.isVat = form.isVat.value;
		}
	}

	onValidateModel(validationResult: ValidationResult): ValidationResult {
		ReportFormValidationUtility.FieldRequired('healthcareProviderPracticeNumber', 'Healthcare Provider', this.form, validationResult);
		return validationResult;
	}

	onTelephoneNumberChanged(event: any){
		this.telephoneNumberChanged.emit(event.target.value);
	 }

	loadExistingAuthHealthcareProviderDetails(healthCareProviderId): void {
		if (healthCareProviderId !== undefined && healthCareProviderId !== null && healthCareProviderId > 0) {
			this.HealthcareProviderService.getHealthCareProviderById(healthCareProviderId).subscribe((healthCareProvider) => {
				if (healthCareProvider !== null && healthCareProvider.rolePlayerId > 0) {
					const form = this.form.controls;
					if(!isNullOrUndefined(healthCareProvider)){
					form.healthcareProviderName.setValue(healthCareProvider.name);
					form.healthcareProviderPracticeNumber.setValue(healthCareProvider.practiceNumber);
					form.healthcareProviderId.setValue(healthCareProvider.rolePlayerId);
					form.practitionerTypeName.setValue(healthCareProvider.practitionerTypeName);
					this.healthCareProviderLoaded.emit(healthCareProvider);
					}
				}
			});
		}
	}


	shouldBlockOnIsHolpitalAndAuthType(isHospitalHCP: boolean): boolean{
		var typeToCheck = this.healthCareProviderSearchType ? this.healthCareProviderSearchType : this.authType;
		switch (typeToCheck){
			case PreauthTypeEnum[PreauthTypeEnum.Hospitalization]: {
				return !isHospitalHCP;
			}
			case PreauthTypeEnum[PreauthTypeEnum.Treatment]: {
				return isHospitalHCP;
			}
			case PreauthTypeEnum[PreauthTypeEnum.Prosthetic]: {
				return isHospitalHCP;
			}
			case PreauthTypeEnum[PreauthTypeEnum.ChronicMedication]: {
				return isHospitalHCP;
			}
			case PreauthTypeEnum[PreauthTypeEnum.TreatingDoctor]:{
				return isHospitalHCP;
			}
			default:{
				return false;
			}
		}
	}

	getAuthTypeErrorMessage(): string{
		var typeToCheck = this.healthCareProviderSearchType ? this.healthCareProviderSearchType : this.authType;
		switch (typeToCheck){
			case PreauthTypeEnum[PreauthTypeEnum.Hospitalization]: {
				return "Only Hospital practice type allowed on Hospital authorization type.";
			}
			case PreauthTypeEnum[PreauthTypeEnum.Treatment]: {
				return "Hospital practice type not allowed on Treatment authorization type.";
			}
			case PreauthTypeEnum[PreauthTypeEnum.Prosthetic]: {
				return "Hospital practice type not allowed on Prosthetic authorization type.";
			}
			case PreauthTypeEnum[PreauthTypeEnum.ChronicMedication]: {
				return "Hospital practice type not allowed on Chronic Medication authorization type.";
			}
			case PreauthTypeEnum[PreauthTypeEnum.TreatingDoctor]: {
				return "Hospital practice type not allowed on Treating Doctor authorization type.";
			}
			default:{
				return "";
			}
		}
	}
}
