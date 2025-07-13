import { PeriodService } from './shared/period.service';
import { NgModule } from '@angular/core';
import { ConfigManagerRoutingModule } from './config-manager-routing.module';
import { PublicHolidayDetailsComponent } from './views/public-holidays/public-holiday-details.component';
import { PublicHolidayListComponent } from './views/public-holidays/public-holiday-list.component';
import { PublicHolidayDataSource } from './views/public-holidays/public-holidays.datasource';
import { RequiredDocumentDetailsComponent } from './views/required-documents/required-documents-details/required-documents-details.component';
import { RequiredDocumentListComponent } from './views/required-documents/required-documents-list/required-documents-list.component';
import { RequiredDocumentDataSource } from './views/required-documents/required-documents-list/required-documents.datasource';
import { SearchModule } from 'projects/clientcare/src/app/shared/search/search.module';
import { PublicHolidayService } from './shared/public-holiday.service';
import { RequiredDocumentService } from './shared/required-document.service';
import { FrameworkModule } from 'src/app/framework.module';
import { ConfigurationManagerBreadcrumbService } from './shared/configuration-manager-breadcrumb.service';
import { ConfigurationManagerHomeComponent } from './views/configuration-manager-home/configuration-manager-home.component';
import { ConfigurationManagerLayoutComponent } from './views/configuration-manager-layout/configuration-manager-layout.component';
import { ConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.component';
import { ManageScheduleTasksComponent } from './views/manage-schedule-tasks/manage-schedule-tasks.component';
import { ScheduledTasksListComponent } from './views/manage-schedule-tasks/scheduled-tasks-list/scheduled-tasks-list.component';
import { ScheduledTasksService } from './shared/scheduled-task.service';
import { ScheduledTasksDataSource } from './views/manage-schedule-tasks/scheduled-tasks-list/scheduled-tasks-list.datasource';
import { ManageChartsComponent } from './views/manage-charts/manage-charts.component';
import { ChartListComponent } from './views/manage-charts/chart-list/chart-list.component';
import { ProductCrossRefTranTypeService } from './shared/productCrossRefTranType.service';
import { ChartsListDatasource } from './views/manage-charts/chart-list/charts-list.datasource';
import { ManagePeriodsComponent } from './views/manage-periods/manage-periods/manage-periods.component';
import { ConcurrentPeriodDialogComponent } from './views/manage-periods/concurrent-period-dialog/concurrent-period-dialog.component';
import { AnnouncementDetailsComponent } from './views/announcements/announcement-details.component';
import { AnnouncementsListComponent } from './views/announcements/announcements-list.component';
import { AnnouncementsDataSource } from './views/announcements/announcements.datasource';
import { CommissionBandService } from './shared/commission-band.service';;
import { ManageBandsComponent } from './views/manage-bands/manage-bands.component';
import { AddBandComponent } from './views/manage-bands/bands-dialogs/add-band/add-band.component';
import { EditBandComponent } from './views/manage-bands/bands-dialogs/edit-band/edit-band.component';
import { ReportExampleComponent } from './views/report-example/report-example.component';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/public-api';
import {ManageClaimsBenefitsAmountComponent} from './views/manage-claims-benefits-amount/manage-claims-benefits-amount.component';
import { AuthorityLimitsEditComponent } from './views/authority-limits/authority-limits-edit/authority-limits-edit.component';
import { AuthorityLimitsListComponent } from './views/authority-limits/authority-limits-list/authority-limits-list.component';
import {EditBenefitsAmountDialogComponent} from './views/edit-benefits-amount-dialog/edit-benefits-amount-dialog.component';
import { PrimeRateService } from './shared/prime-rate.service';
import { ManagePrimeRatesComponent } from './views/manage-prime-rates/manage-prime-rates.component';
import { ForecastRateService } from './shared/forecast-rate.service';
import { AddPrimeRateComponent } from './views/manage-prime-rates/prime-rates-dialogs/add-prime-rate/add-prime-rate.component';
import { AutorityLimitRejectNoteDialogComponent } from './views/authority-limits/autority-limit-reject-note-dialog/autority-limit-reject-note-dialog.component';
import { ManageForecastRatesComponent } from './views/manage-billing-forecast-rates/manage-forecast-rates.component';
import { AddForecastRateComponent } from './views/manage-billing-forecast-rates/forecast-rates-dialogs/add-forecast-rate/add-forecast-rate.component';

@NgModule({
    imports: [
        FrameworkModule,
        SearchModule,
        ConfigManagerRoutingModule,
        SharedComponentsLibModule
    ],
    declarations: [
        ConfigurationManagerHomeComponent,
        ConfigurationManagerLayoutComponent,
        PublicHolidayDetailsComponent,
        PublicHolidayListComponent,
        RequiredDocumentDetailsComponent,
        RequiredDocumentListComponent,
        ReportExampleComponent,
        ManageScheduleTasksComponent,
        ScheduledTasksListComponent,
        ManageChartsComponent,
        ChartListComponent,
        ManagePeriodsComponent,
        ManagePrimeRatesComponent,
        ManageForecastRatesComponent,
        ConcurrentPeriodDialogComponent,
        AnnouncementDetailsComponent,
        AnnouncementsListComponent,
        EditBandComponent,
        AddBandComponent,
        ManageBandsComponent,
        ManageClaimsBenefitsAmountComponent,
        AuthorityLimitsEditComponent,
        AuthorityLimitsListComponent,
        EditBenefitsAmountDialogComponent,
        AddPrimeRateComponent,
        AutorityLimitRejectNoteDialogComponent,
        AddForecastRateComponent
    ],
    exports: [
        ManageBandsComponent,
        AuthorityLimitsListComponent
    ],
    entryComponents: [
        ConcurrentPeriodDialogComponent,
        EditBandComponent,
        AddBandComponent,
        AddPrimeRateComponent,
        AddForecastRateComponent
    ],
    providers: [
        ConfigurationManagerBreadcrumbService,
        PublicHolidayDataSource,
        ChartsListDatasource,
        RequiredDocumentDataSource,
        PublicHolidayService,
        RequiredDocumentService,
        ConfirmationDialogComponent,
        ScheduledTasksService,
        ProductCrossRefTranTypeService,
        ScheduledTasksDataSource,
        PeriodService,
        PrimeRateService,
        ForecastRateService,
        AnnouncementsDataSource,
        CommissionBandService
    ]
})
export class ConfigManagerModule { }
