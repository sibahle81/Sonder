
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignInGuard } from 'projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard';

// DO NOT REMOVE these "Unused references" Angular Compiler for some reason needs them to find the modules
import { CaseHomeComponent } from 'projects/contactcare/src/app/case-manager/views/case-home/case-home.component';
const routes: Routes = [
  {
    path: '',
    canActivate: [SignInGuard],
    children: [
      { path: '', component: CaseHomeComponent },
      { path: 'case-manager', loadChildren: () => import('projects/contactcare/src/app/case-manager/case-manager.module').then(m => m.CaseManagerModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ContactMainRoutingModule { }



