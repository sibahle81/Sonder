import { NgModule, Injector } from '@angular/core';
import { ReportViewerComponent } from './reportviewer.component';
// import { createCustomElement } from '@angular/elements';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        ReportViewerComponent
    ],
    exports: [
        ReportViewerComponent
    ],
    imports: [
        CommonModule
    ],
    entryComponents: [
        ReportViewerComponent
    ]
})
export class ReportViewerModule {
    constructor(injector: Injector) {
        // const reportviewerElement = createCustomElement(ReportViewerComponent, { injector });
        // customElements.define('app-reportviewer', reportviewerElement);
    }
}
