import { NgModule } from '@angular/core';

import { FollowUpSearchComponent } from './follow-up-search/follow-up-search.component';
import { FollowUpSearchDataSource } from './follow-up-search/follow-up-search.datasource';
import { FrameworkModule } from 'src/app/framework.module';
import { GroupSearchComponent } from './group-search/group-search.component';
import { PolicyInsuredLifeSearchComponent } from './policy-insured-life-search/policy-insured-life-search.component';
import { PolicyInsuredLifeSearchDatasource } from './policy-insured-life-search/policy-insured-life-search.datasource';
import { TemplateSearchComponent } from './template-search/template-search.component';
import { TemplateSearchDataSource } from './template-search/template-search.datasource';
import { ClientSearchComponent } from './client-search/client-search.component';

@NgModule({
    imports: [
       FrameworkModule
    ],
    declarations: [
        FollowUpSearchComponent,
        GroupSearchComponent,
        PolicyInsuredLifeSearchComponent,
        TemplateSearchComponent,
        ClientSearchComponent
    ],
    exports: [
        FollowUpSearchComponent,
        GroupSearchComponent,
        PolicyInsuredLifeSearchComponent,
        TemplateSearchComponent,
        ClientSearchComponent
    ],
    providers: [
        FollowUpSearchDataSource,
        PolicyInsuredLifeSearchDatasource,
        TemplateSearchDataSource
    ]
})
export class SearchModule { }
