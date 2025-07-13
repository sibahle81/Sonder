import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
  selector: 'app-child-extension-manager-overview',
  templateUrl: './child-extension-manager-overview.component.html',
  styleUrls: ['./child-extension-manager-overview.component.css']
})
export class ChildExtensionManagerOverviewComponent implements OnInit {

  constructor(public readonly router: Router, readonly wizardService: WizardService) {
  }

  ngOnInit(): void {
  }

}
