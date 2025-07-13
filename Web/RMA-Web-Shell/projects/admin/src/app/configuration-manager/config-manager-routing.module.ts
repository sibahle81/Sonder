import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicHolidayDetailsComponent } from './views/public-holidays/public-holiday-details.component';
import { RequiredDocumentDetailsComponent } from './views/required-documents/required-documents-details/required-documents-details.component';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { ConfigurationManagerLayoutComponent } from './views/configuration-manager-layout/configuration-manager-layout.component';
import { ConfigurationManagerHomeComponent } from './views/configuration-manager-home/configuration-manager-home.component';
import { ReportExampleComponent } from './views/report-example/report-example.component';
import { ManageScheduleTasksComponent } from './views/manage-schedule-tasks/manage-schedule-tasks.component';
import { ManageChartsComponent } from './views/manage-charts/manage-charts.component';
import { ManagePeriodsComponent } from './views/manage-periods/manage-periods/manage-periods.component';
import { AnnouncementDetailsComponent } from './views/announcements/announcement-details.component';
import { ManageBandsComponent } from './views/manage-bands/manage-bands.component';
import {ManageClaimsBenefitsAmountComponent} from './views/manage-claims-benefits-amount/manage-claims-benefits-amount.component';
import { AuthorityLimitsListComponent } from './views/authority-limits/authority-limits-list/authority-limits-list.component';
import { ManagePrimeRatesComponent } from './views/manage-prime-rates/manage-prime-rates.component';
import { ManageForecastRatesComponent } from './views/manage-billing-forecast-rates/manage-forecast-rates.component';

const routes: Routes = [
    {
        path: '', component: ConfigurationManagerLayoutComponent,
        canActivate: [SignInGuard, PermissionGuard],
        canActivateChild: [PermissionGuard],
        data: { title: 'Configuration Manager', permissions: ['Config manager view']},
        children: [
            { path: '', component: ConfigurationManagerHomeComponent },
            { path: 'dashboard', component: ConfigurationManagerHomeComponent },
            { path: 'public-holidays', component: PublicHolidayDetailsComponent },
            { path: 'scheduled-tasks', component: ManageScheduleTasksComponent },
            { path: 'manage-periods', component: ManagePeriodsComponent},
            { path: 'manage-prime-rates', component: ManagePrimeRatesComponent},
            { path: 'manage-billing-forecast-rates', component: ManageForecastRatesComponent}, 
            { path: 'manage-charts', component: ManageChartsComponent },
            { path: 'manage-commission-bands', component: ManageBandsComponent },
            { path: 'required-documents', component: RequiredDocumentDetailsComponent },
            { path: 'report-example', component: ReportExampleComponent },
            { path: 'announcements', component: AnnouncementDetailsComponent },
            { path: 'manage-claims-benefits-amount', component: ManageClaimsBenefitsAmountComponent },
            { path: 'authority-limits', component: AuthorityLimitsListComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ConfigManagerRoutingModule { }
