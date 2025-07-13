
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
// TODO CAMERON YOUNG / RYAN MAREE -- Depricated component 
// import { PolicyDetailsWidgetComponent } from 'projects/clientcare/src/app/client-dashboard/views/policy-details-widget/policy-details-widget.component';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { BrokerageService } from 'projects/clientcare/src/app/broker-manager/services/brokerage.service';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { UntypedFormBuilder } from '@angular/forms';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { ClaimCareService } from '../../Services/claimcare.service';
import { MatDialog } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'claims-policy-detail',
  templateUrl: './claim-policy-details.component.html'
})

export class ClaimsPolicyDetailComponent implements OnInit {

  rolePlayerId: number;

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.rolePlayerId = params.id as number;
      }
    });
  }
}
