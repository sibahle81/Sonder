import { Component, OnInit } from '@angular/core';
import { WizardBreadcrumbService } from '../../shared/services/wizard-breadcumb.service';

@Component({
    templateUrl: './wizard-home.component.html'
})
export class WizardHomeComponent  {
    constructor(
        private readonly breadcrumbService: WizardBreadcrumbService) {
    }

}
