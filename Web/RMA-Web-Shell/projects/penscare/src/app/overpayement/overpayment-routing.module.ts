import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { SignInGuard } from "projects/shared-services-lib/src/lib/guards/sign-in/sign-in.guard";
import { WizardHostComponent } from "projects/shared-components-lib/src/lib/wizard/views/wizard-host/wizard-host.component";
import { WizardEntryGuard } from "projects/shared-services-lib/src/lib/guards/wizard-entry/wizard-entry.guard";
import { OverpaymentLayoutComponent } from "./views/overpayment-layout/overpayment-layout.component";


export const OverPaymentRoutes: Routes = [
  { path: '', canActivate: [SignInGuard], component: OverpaymentLayoutComponent },
  { path: ':type/:action/:linkedId', canActivate: [WizardEntryGuard], component: WizardHostComponent }
]

@NgModule({
  imports: [RouterModule.forChild(OverPaymentRoutes)],
  exports: [RouterModule]
})

export class OverPaymentRoutingModule {}
