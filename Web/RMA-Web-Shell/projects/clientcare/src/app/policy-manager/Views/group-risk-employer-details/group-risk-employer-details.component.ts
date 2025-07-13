
    import { BehaviorSubject } from 'rxjs';
    import { Component } from '@angular/core';
    import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
    import { ActivatedRoute } from '@angular/router';
    import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
    import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    import { GroupRiskPolicyCaseModel } from '../../shared/entities/group-risk-policy-case-model';
    import { GroupRiskService } from '../../shared/Services/group-risk.service';
    import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
    import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
    import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
    import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
    import { RolePlayerService } from '../../shared/Services/roleplayer.service';
    import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
    import { PolicyService } from '../../shared/Services/policy.service';
    import { RolePlayer } from '../../shared/entities/roleplayer';
import { WizardService } from '../../../../../../shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from '../../../../../../shared-services-lib/src/lib/services/alert/alert.service';

    @Component({
    selector: 'app-group-risk-employer-details',
    templateUrl: './group-risk-employer-details.component.html',
    styleUrls: ['./group-risk-employer-details.component.css'],
    providers: [
        { provide: DateAdapter, useClass: MatDatePickerDateFormat },
        { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
    ]
    })
    export class GroupRiskEmployerDetailsComponent extends WizardDetailBaseComponent<GroupRiskPolicyCaseModel> {

    ficaVerifications: Lookup[];
    ficaRiskRatingTypes: Lookup[];
    bankAccountTypes: Lookup[];
    employer: RolePlayer;

    tabIndex = 0;
    isReadOnly = false;
    isWizard = false;
    triggerRefresh: boolean;

    errors: any[];
    isLoading: boolean;
    pollingMessage: string;
    createCompany : boolean;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    showSearch = true;
        

    constructor(
        authService: AuthService,
        activatedRoute: ActivatedRoute,
        appEventsManager: AppEventsManager,
        private readonly formBuilder: UntypedFormBuilder,
        private readonly groupriskService: GroupRiskService,
        private readonly rolePlayerService: RolePlayerService,
        private readonly lookupService: LookupService,
        private readonly policyService: PolicyService,
        private readonly wizardService: WizardService,
        private readonly privateAlertService: AlertService
    ) {
        super(appEventsManager, authService, activatedRoute);
        this.employer  = new RolePlayer();
    }

    onLoadLookups() { this.getLookups(); }

    getLookups() {
    }

    createForm() {
    }

    populateForm() {
        if (this.model.employerRolePlayerId) {
            this.getEmployer();
            }

    }

    populateModel() {
        this.model.employerRolePlayerId = this.employer.rolePlayerId;
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        return validationResult;
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
        .filter(StringIsNumber)
        .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string): string {
        if (!lookup || lookup == '') { return 'N/A'; }
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    createNewCompany(){
        this.createCompany = true;
    }

    toggle() {
        this.showSearch = !this.showSearch;
        }

    employerSelected($event: RolePlayer) {
        this.employer = $event;
        this.model.employerRolePlayerId = this.employer.rolePlayerId;
        this.toggle();
    }

    getEmployer() {
        this.isLoading$.next(true);
        if (this.model.employerRolePlayerId) {
            this.rolePlayerService.getRolePlayer(this.model.employerRolePlayerId).subscribe(result => {
            if (result) {
              this.employer = result;
              this.showSearch = false;
            }
            this.isLoading$.next(false);
          });
        } else {
          this.isLoading$.next(false);
        }
    }

    delete() {
        this.employer = null;
        this.model.employerRolePlayerId = null;
        this.toggle();
        //this.save();
    }

    refresh($event: boolean) {
        this.triggerRefresh = !this.triggerRefresh;
        //this.refreshEmit.emit(this.triggerRefresh);
    }


}
