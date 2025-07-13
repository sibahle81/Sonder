import { SanatisePipe } from './views/announcement/sanatise-pipe .pipe';
import { NgModule } from '@angular/core';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { SharedModelsLibModule } from 'projects/shared-models-lib/src/lib/shared-models-lib.module';
import { SharedUtilitiesLibModule } from 'projects/shared-utilities-lib/src/lib/shared-utilities-lib.module';
import { SharedComponentsLibModule } from 'projects/shared-components-lib/src/lib/shared-components-lib.module';
import { AuthFailureComponent } from './views/auth-failure/auth-failure.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { BreadcrumbComponent } from './layout/breadcrumb/breadcrumb.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LeftMenuComponent } from './layout/left-menu/left-menu.component';
import { HostComponent } from './layout/host/host.component';
import { TopMenuComponent } from './layout/top-menu/top-menu.component';
import { RightMenuComponent } from './layout/right-menu/right-menu.component';
import { IdleDialogComponent } from './views/idle-dialog/idle-dialog.component';
import { NotificationComponent } from './layout/notification/notification.component';
import { DatePipe } from '@angular/common';
import { ForgotPasswordComponent } from './views/forgot-password/Forgot-password.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
import { MembershipDocsComponent } from './views/membership-docs/membership-docs.component';
import { AnnouncementComponent } from './views/announcement/announcement.component';
const moment = _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
  },
};


@NgModule({
  declarations: [
    AuthFailureComponent,
    NotFoundComponent,
    SignInComponent,
    AnnouncementComponent,
    DashboardComponent,
    BreadcrumbComponent,
    FooterComponent,
    LeftMenuComponent,
    HostComponent,
    TopMenuComponent,
    RightMenuComponent,
    IdleDialogComponent,
    NotificationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    MembershipDocsComponent,
    SanatisePipe
  ],
  imports: [
    SharedServicesLibModule,
    SharedModelsLibModule,
    SharedUtilitiesLibModule,
    SharedComponentsLibModule
  ],
  exports: [
    AuthFailureComponent,
    NotFoundComponent,
    SignInComponent,
    AnnouncementComponent,
    DashboardComponent,
    BreadcrumbComponent,
    FooterComponent,
    LeftMenuComponent,
    HostComponent,
    TopMenuComponent,
    RightMenuComponent,
    IdleDialogComponent,
    NotificationComponent,
    ForgotPasswordComponent,
    SharedServicesLibModule,
    SharedModelsLibModule,
    SharedUtilitiesLibModule,
    SharedComponentsLibModule,
    ResetPasswordComponent,
    MembershipDocsComponent
  ],
  entryComponents: [
    IdleDialogComponent
  ],
  providers: [
    DatePipe,
    SharedServicesLibModule,
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  bootstrap: []
})
export class FrameworkModule { }
