import { ComponentFactoryResolver, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FrameworkModule } from 'src/app/framework.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedServicesLibModule } from 'projects/shared-services-lib/src/lib/shared-services-lib.module';
import { WizardContextFactory } from 'projects/shared-components-lib/src/lib/wizard/sdk/wizard-context.factory';
import { WizardModule } from 'projects/shared-components-lib/src/lib/wizard/wizard.module';
import { SharedPenscareModule } from '../shared-penscare/shared-penscare.module';
import { CertificateOfLifeViewComponent } from './views/certificate-of-life-view/certificate-of-life-view.component';
import { CertificateOfLifeListComponent } from './views/certificate-of-life-list/certificate-of-life-list.component';
import { CertificateOfLifeDetailComponent } from './views/certificate-of-life-detail/certificate-of-life-detail.component';
import { CertificateOfLifeRoutingModule } from './certificate-of-life-routing.module';
import { CerticateOfLifeVendorDocumentsComponent } from './views/certicate-of-life-vendor-documents/certicate-of-life-vendor-documents.component';
import {TebaSftpFileRequestListComponent} from './views/teba-sftp-file-request-list/teba-sftp-file-request-list.component';
import {TebaFileDataListComponent} from './views/teba-file-data-list/teba-file-data-list.component';
@NgModule({
  declarations: [
    CertificateOfLifeViewComponent,
    CertificateOfLifeListComponent,
    CertificateOfLifeDetailComponent,
    CerticateOfLifeVendorDocumentsComponent,
    TebaSftpFileRequestListComponent,
    TebaFileDataListComponent
  ],
  imports: [
    CommonModule,
    CertificateOfLifeRoutingModule,
    FrameworkModule,
    SharedModule,
    WizardModule,
    SharedPenscareModule
  ],
  providers: [
    SharedServicesLibModule,
    DatePipe
  ]
})
export class CertificateOfLifeModule {
  constructor(
    componentFactoryResolver: ComponentFactoryResolver,
    contextFactory: WizardContextFactory) {
  }
}
