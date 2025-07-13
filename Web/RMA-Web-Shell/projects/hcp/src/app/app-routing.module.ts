import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';

// Learn from other peoples DO NOT REMOVE comments
// these "Unused references" Angular Compiler for some reason needs them to find the modules
import { HcpHomeComponent } from 'projects/hcp/src/app/hcp-manager/views/hcp-home/hcp-home.component';


const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard],
    children: [
      { path: 'hcp-manager', loadChildren: () => import('projects/hcp/src/app/hcp-manager/hcp-manager.module').then(m => m.HcpManagerModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HcpMainAppRoutingModule { }
