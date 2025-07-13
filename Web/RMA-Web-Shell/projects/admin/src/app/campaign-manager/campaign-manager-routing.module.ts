import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignFindComponent } from './views/campaign-find/campaign-find.component';
import { CampaignListComponent } from './views/campaign-list/campaign-list.component';
import { TemplateFindComponent } from './views/template-find/template-find.component';
import { TemplateDetailsComponent } from './views/template-details/template-details.component';
import { CampaignDetailsComponent } from './views/campaign-details/campaign-details.component';
import { RetentionsReportComponent } from './views/report-retentions/report-retentions.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { CampaignManagerLayoutComponent } from './views/campaign-manager-layout/campaign-manager-layout.component';
import { CampaignManagerHomeComponent } from './views/campaign-manager-home/campaign-manager-home.component';

const routes: Routes = [
    {
        path: '', component: CampaignManagerLayoutComponent, 
        canActivate: [SignInGuard, PermissionGuard], 
        canActivateChild: [PermissionGuard],
        data: { title: 'Campaign Manager', permissions: ['Campaign manager view']},
        children: [
            { path: '', component: CampaignFindComponent },
            { path: 'dashboard', component: CampaignManagerHomeComponent },
            { path: 'campaign-list', component: CampaignListComponent },
            { path: 'campaign-list/:action', component: CampaignListComponent },
            { path: 'find-campaign', component: CampaignFindComponent },
            { path: 'campaign-details', component: CampaignDetailsComponent },
            { path: 'campaign-details/:id', component: CampaignDetailsComponent },
            { path: 'campaign-details/:id/:tab', component: CampaignDetailsComponent },
            { path: 'find-template', component: TemplateFindComponent },
            { path: 'template-details', component: TemplateDetailsComponent },
            { path: 'template-details/:type', component: TemplateDetailsComponent },
            { path: 'template-details/:type/:id', component: TemplateDetailsComponent },
            { path: 'retentions-report', component: RetentionsReportComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CampaignManagerRoutingModule { }
