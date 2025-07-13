import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthCare-provider-model';

@Component({
	selector: 'preauth-hcp.component',
	templateUrl: './preauth-hcp.component.html',
	styleUrls: ['./preauth-hcp.component.css'],
	providers: [HealthcareProviderService]
})

export class PreAuthHCPComponent {

	public form: UntypedFormGroup
	filterRecordsCtrl = new UntypedFormControl();
	healthCareProviders: HealthCareProvider[];
	isLoading = false;
	errorMsg: string;
	healthCareProvider: HealthCareProvider;
	showSearchProgress = false;
	disabled: boolean = true;
	disablePracticeNumber = false;
	userHealthCareProviders: UserHealthCareProvider[];

	constructor(appEventsManager: AppEventsManager,
		private readonly authService: AuthService,
		private readonly activatedRoute: ActivatedRoute,
		private readonly formBuilder: UntypedFormBuilder,
		private readonly userService: UserService,
		private readonly HealthcareProviderService: HealthcareProviderService
	) {
	}

	ngOnInit() {
		const user = this.authService.getCurrentUser();
		this.createForm();
		this.getUserHealthCareProviders(user.email);
	}

	getUserHealthCareProviders(userEmail: string): void {
		this.userService.getUserHealthCareProviders(userEmail).subscribe(
			userHealthCareProviders => {

				if (userHealthCareProviders) {
					if (userHealthCareProviders.length == 1)
						this.setHealthCareProviderDetails(userHealthCareProviders[0]);
					else
						this.userHealthCareProviders = userHealthCareProviders;
				}
			}
		);
	}

	onSelectChanged(evtOption: any) {
		if (evtOption && evtOption.value) {
			this.setHealthCareProviderDetails(evtOption.value);
		}
	}

	setHealthCareProviderDetails(userhealthCareProvider: UserHealthCareProvider) {
		const form = this.form.controls;

		form.healthcareProviderPracticeNumber.setValue(userhealthCareProvider.practiceNumber);
		form.healthcareProviderName.setValue(userhealthCareProvider.name);
		form.healthcareProviderId.setValue(userhealthCareProvider.healthCareProviderId);
	}

	createForm(): void {

		if (this.form) { return; }

		this.form = this.formBuilder.group({
			healthcareProviderPracticeNumber: new UntypedFormControl(''),
			healthcareProviderName: new UntypedFormControl({ value: '', disabled: this.disabled }),
			healthcareProviderId: new UntypedFormControl(''),
			isDeclarationAccepted: new UntypedFormControl('')
		});
	}
}
