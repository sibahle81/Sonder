import { NgModule } from '@angular/core';
import { ExecuteRulesComponent } from './execute-rules/execute-rules.component';
import { RulesEngineService } from './shared/services/rules-engine.service';
import { RulesEngineRoutingModule } from './rules-engine-routing.module';
import { RuleService } from './shared/services/rule.service';

import { BreadcrumbRuleService } from './shared/services/breadcrumb-rule.service';
import { RuleListComponent } from './rule-list/rule-list.component';
import { RuleDetailsComponent } from './rule-details/rule-details.component';

// rule last viewed
import { RuleLastViewedListComponent } from './rule-last-viewed-list/rule-last-viewed-list.component';
import { RuleLastViewedListDataSource } from './rule-last-viewed-list/rule-last-viewed-list.datasource';
import { FrameworkModule } from 'src/app/framework.module';

import { RulesHomeComponent } from './home/rules-home.component';
import { RulesLayoutComponent } from './rules-layout/rules-layout.component';
import { RuleSearchComponent } from './rule-search/rule-search.component';

@NgModule({
    imports: [
        FrameworkModule,
        RulesEngineRoutingModule
    ],
    declarations: [
        RulesLayoutComponent,
        RulesHomeComponent,
        RuleListComponent,
        RuleDetailsComponent,
        ExecuteRulesComponent,
        RuleLastViewedListComponent,
        RuleSearchComponent,
    ],
    exports: [
        RulesLayoutComponent,
        RulesHomeComponent,
        RuleListComponent,
        RuleDetailsComponent,
        ExecuteRulesComponent,
        RuleLastViewedListComponent,
        RuleSearchComponent,
    ],
    providers: [
        RulesEngineService,
        BreadcrumbRuleService,
        RuleService,
        RuleLastViewedListDataSource,
        RuleService,
    ]
})
export class RulesEngineModule {
    constructor() {
    }
}
