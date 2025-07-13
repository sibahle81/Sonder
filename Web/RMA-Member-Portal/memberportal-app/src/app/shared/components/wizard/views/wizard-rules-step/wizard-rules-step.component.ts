import { Component, Output, EventEmitter } from '@angular/core';

import { WizardContext } from '../../shared/models/wizard-context';
import { WizardService } from '../../shared/services/wizard.service';
import { RuleRequestResult } from '../../../rules-engine/shared/models/rule-request-result';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wizard-rules-step',
    templateUrl: './wizard-rules-step.component.html'
})
export class WizardRulesStepComponent {
    // tslint:disable-next-line:no-output-on-prefix
    @Output() onRulesExecuted = new EventEmitter<boolean>();
    private ruleRequestResult: RuleRequestResult;

    constructor(
        private readonly wizardService: WizardService) {
    }

    executeRules(wizardContext: WizardContext): void {
          this.ruleRequestResult = null;
          this.wizardService.executeWizardRules(wizardContext.wizard.id)
              .subscribe(ruleRequestResult => this.executedRulesCompleted(ruleRequestResult));
    }

    private executedRulesCompleted(ruleRequestResult: RuleRequestResult): void {
        this.ruleRequestResult = ruleRequestResult;
        this.onRulesExecuted.emit(this.ruleRequestResult.overallSuccess);
    }
}
