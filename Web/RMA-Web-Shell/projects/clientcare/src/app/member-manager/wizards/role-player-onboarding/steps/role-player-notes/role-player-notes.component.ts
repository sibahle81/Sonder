    import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
    import { BehaviorSubject } from 'rxjs';
    import { ActivatedRoute } from '@angular/router';
    import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
    import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

    @Component({
    templateUrl: './role-player-notes.component.html'
    })

    export class RolePlayerNotesComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {

    isReadOnly = false;
    wizardId: string;

    constructor(
        readonly appEventsManager: AppEventsManager,
        readonly authService: AuthService,
        readonly activatedRoute: ActivatedRoute) {
        super(appEventsManager, authService, activatedRoute);
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params: any) => {
            if (params.linkedId) {
                this.wizardId = params.linkedId;
            }
        });
    }

    createForm(id: number): void { return; }

    onLoadLookups(): void { return; }

    populateModel(): void { return; }

    populateForm(): void { }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        return validationResult;
    }

    }
