import { Component, Input, Output, EventEmitter } from '@angular/core';

import { RuleRequest } from '../shared/models/rule-request';
import { RuleRequestResult } from '../shared/models/rule-request-result';
import { RulesEngineService } from '../shared/services/rules-engine.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'execute-rules',
    templateUrl: './execute-rules.component.html',
    styleUrls: ['./execute-rules.component.css']
})
export class ExecuteRulesComponent {
    // tslint:disable-next-line:no-input-rename
    @Input('valid') valid: boolean;
    @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();
    ruleRequestResult: RuleRequestResult;
    isError = false;

    isValidating = false;
    isValid = false;
    isValidationComplete = false;

    constructor(
        private readonly alertService: AlertService,
        private readonly rulesEngineService: RulesEngineService) {
    }

    executeRules(ruleRequest: RuleRequest): void {
        this.isValidating = true;
        this.isValid = false;
        this.isValidationComplete = false;
        this.isError = false;

        this.rulesEngineService.executeRules(ruleRequest)
            .subscribe(ruleResults => this.executedRulesCompleted(ruleResults),
                error => this.showErrorMessage(error));
    }

    executedRulesCompleted(ruleRequestResult: RuleRequestResult): void {
        this.isValidationComplete = true;
        this.ruleRequestResult = ruleRequestResult;
        this.isValid = ruleRequestResult.overallSuccess;

        this.isValidating = false;
        this.change.emit(this.ruleRequestResult.overallSuccess);
    }

    showErrorMessage(error: any): void {
        this.isValidationComplete = false;
        this.isValid = false;
        this.isError = true;
        this.alertService.handleError(error);
    }
}
