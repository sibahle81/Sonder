import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgModule, ErrorHandler } from '@angular/core';
import { MatSortModule } from '@angular/material/sort';
import {MatCheckboxModule} from '@angular/material/checkbox'

import { RightMenuComponent } from './layout/right-menu/right-menu.component';
import { NotificationComponent } from './layout/notification/notification.component';
import { FrameworkModule } from './framework.module';
import { AppInsightsService } from 'projects/shared-services-lib/src/lib/services/diagnostics/appinsights.service';
import { GlobalErrorHandler } from 'projects/shared-services-lib/src/lib/services/global-error-handler/global-error-handler.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ng6-toastr-notifications';
import { NotificationDatasource } from './layout/notification/notification.datasource';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        // Our Shared Items
        FrameworkModule,
        SharedServicesLibModule,
        MatSortModule,
        MatCheckboxModule
    ],
    entryComponents: [
        RightMenuComponent,
        NotificationComponent
    ],
    providers: [
        AppInsightsService,
        NotificationDatasource,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

}

declare global {
    interface Navigator {
        msSaveBlob: (blob: Blob, fileName: string) => boolean,
        msSaveOrOpenBlob: (blob: Blob, fileName: string) => boolean
    }
}
