import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RulesHomeComponent } from './home/rules-home.component';
import { RuleDetailsComponent } from './rule-details/rule-details.component';
import { RuleLastViewedListComponent } from './rule-last-viewed-list/rule-last-viewed-list.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { RulesLayoutComponent } from './rules-layout/rules-layout.component';


const routes: Routes = [
    {
        path: '', component: RulesLayoutComponent, canActivate: [SignInGuard]
        , children: [
            { path: '', component: RulesHomeComponent},
            { path: 'dashboard', component: RulesHomeComponent},
            { path: 'rule-details', component: RuleDetailsComponent },
            { path: 'rule-details/:id', component: RuleDetailsComponent},
            { path: 'rule-last-viewed', component: RuleLastViewedListComponent},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class RulesEngineRoutingModule { }
