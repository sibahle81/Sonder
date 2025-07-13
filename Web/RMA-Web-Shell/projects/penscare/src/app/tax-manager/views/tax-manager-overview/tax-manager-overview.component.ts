import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
  selector: 'tax-manager-overview',
  templateUrl: './tax-manager-overview.component.html',
  styleUrls: ['./tax-manager-overview.component.css']
})
export class TaxManagerOverviewComponent implements OnInit {

  constructor(public readonly router: Router, readonly wizardService: WizardService) {
  }

  ngOnInit(): void {
  }

}
