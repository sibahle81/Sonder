import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WizardHostComponent } from './views/wizard-host/wizard-host.component';
import { WizardDetailsComponent } from './views/wizard-details/wizard-details.component';
import { WizardHomeComponent } from './views/wizard-home/wizard-home.component';
import { WizardMenuComponent } from './views/wizard-menu/wizard-menu.component';
import { TaskListComponent } from './views/task-list/task-list.component';
import { SignInGuard } from '../../services/sign-in.guard';

 
const routes: Routes = [
    {
        path: '', component: WizardMenuComponent, canActivate: [SignInGuard],
        children: [
            { path: '', component: WizardHomeComponent },
            { path: 'dashboard', component: WizardHomeComponent },
            { path: 'wizard-host/:action/:type/:linkedId', component: WizardHostComponent },
            { path: 'wizard-details/:id', component: WizardDetailsComponent },
            { path: 'my-task-list', component: TaskListComponent }
        ]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WizardRoutingModule { }
