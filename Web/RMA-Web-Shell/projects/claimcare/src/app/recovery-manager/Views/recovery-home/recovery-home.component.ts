import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WizardParameters } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-parameters';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';

@Component({
    templateUrl: './recovery-home.component.html'
})
export class RecoveryHomeComponent implements OnInit {
    constructor(public readonly router: Router,readonly wizardService: WizardService) {
    }

    ngOnInit(): void {
    }
}
