import { Component, OnInit } from '@angular/core';
import { BreadcrumbRuleService } from '../shared/services/breadcrumb-rule.service';

@Component({
    templateUrl: './rules-home.component.html'
})
export class RulesHomeComponent implements OnInit {

    constructor(private readonly breadcrumbService: BreadcrumbRuleService) {
    }

    ngOnInit(): void {
        this.breadcrumbService.setBreadcrumb('Find a rule');
    }

}
