import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';
import { PermissionGuard } from 'projects/shared-services-lib/src/lib/guards/permission/permission.guard';
import { CertificateOfLifeViewComponent } from './views/certificate-of-life-view/certificate-of-life-view.component';

const routes: Routes = [
  {
    path: '', component: CertificateOfLifeViewComponent,
    canActivate: [SignInGuard],
    canActivateChild: [PermissionGuard],
    data: { permissions: ['Certificate of life view'] }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CertificateOfLifeRoutingModule { }
