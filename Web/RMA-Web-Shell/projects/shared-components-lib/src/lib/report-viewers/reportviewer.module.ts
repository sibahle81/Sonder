import { CommonModule } from '@angular/common';
import { NgModule, Injector } from '@angular/core';
import { SafeUrlPipe } from 'projects/shared-utilities-lib/src/lib/pipes/safe-url';
import { SSRSReportViewerV2Component } from './ssrs-report-viewer-V2/ssrs-report-viewer-V2.component';
import { ReportViewerComponent } from './ssrs-report-viewer-V1/reportviewer.component';

@NgModule({
    declarations: [
        ReportViewerComponent,
        SSRSReportViewerV2Component,
        SafeUrlPipe
    ],
    exports: [
        ReportViewerComponent,
        SSRSReportViewerV2Component
    ],
    entryComponents: [
        ReportViewerComponent,
        SSRSReportViewerV2Component,
        SafeUrlPipe
    ],
    imports: [
        CommonModule
    ]
})
export class ReportViewerModule {
    constructor(injector: Injector) { }
}
