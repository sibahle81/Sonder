import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { SignInGuard } from "projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard";
import { AnnualIncreaseLayoutComponent } from "./views/annual-increase-layout/annual-increase-layout.component";
import { WizardHostComponent } from "projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component";
import { WizardEntryGuard } from "projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard";

export const AnnualIncreaseRoutes: Routes = [
  { path: '', canActivate: [SignInGuard], component: AnnualIncreaseLayoutComponent },
  { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent }
]

@NgModule({
  imports: [RouterModule.forChild(AnnualIncreaseRoutes)],
  exports: [RouterModule]
})

export class AnnualIncreaseRoutingModule {}
