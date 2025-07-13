import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';

import { RepresentativeDetailsComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-details/representative-details.component';
import { BreadcrumbBrokerService } from 'projects/clientcare/src/app/broker-manager/services/breadcrumb-broker.service';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { RepresentativeAddressComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-address/representative-address.component';
import { RepresentativeNotesComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-notes/representative-notes.component';
import { RepresentativeBrokerageLinkComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-brokerage-link/representative-brokerage-link.component';
import { RepresentativeDocumentsComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-documents/representative-documents.component';
import { RepresentativeChecksComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-checks/representative-checks.component';
import { RepresentativeAuthorisedRepresentativeComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-authorised-representative/representative-authorised-representative.component';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { RepresentativeBankingDetailsComponent } from 'projects/clientcare/src/app/broker-manager/views/representative-banking-details/representative-banking-details.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  selector: 'app-representative-view',
  templateUrl: './representative-view.component.html',
  styleUrls: ['./representative-view.component.css']
})
export class RepresentativeViewComponent implements OnInit {
  @ViewChild(RepresentativeDetailsComponent, { static: true }) detailsComponent: RepresentativeDetailsComponent;
  @ViewChild(RepresentativeBankingDetailsComponent, { static: true }) representativeBankingDetailsComponent: RepresentativeBankingDetailsComponent;
  @ViewChild(RepresentativeAddressComponent, { static: true }) addressComponent: RepresentativeAddressComponent;
  @ViewChild(RepresentativeBrokerageLinkComponent, { static: true }) linkComponent: RepresentativeBrokerageLinkComponent;
  @ViewChild(RepresentativeAuthorisedRepresentativeComponent, { static: true }) authorisedRepComponent: RepresentativeAuthorisedRepresentativeComponent;
  @ViewChild(RepresentativeDocumentsComponent, { static: true }) documentsComponent: RepresentativeDocumentsComponent;
  @ViewChild(RepresentativeNotesComponent, { static: true }) notesComponent: RepresentativeNotesComponent;
  @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
  @ViewChild(RepresentativeChecksComponent, { static: true }) representativeChecksComponent: RepresentativeChecksComponent;

  canAdd = false;
  canEdit = false;
  isLoading: boolean;

  broker: Representative;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly representativeService: RepresentativeService,
    private readonly breadCrumbService: BreadcrumbBrokerService,
    private readonly wizardService: WizardService) {
  }

  ngOnInit() {
    this.isLoading = true;
    this.checkUserPermissions();
    this.breadCrumbService.setBreadcrumb('View Brokerage');
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.representativeService.getRepresentative(params.id).subscribe(
          broker => {
            this.broker = broker;
            this.detailsComponent.setViewData(broker);
            this.representativeBankingDetailsComponent.setViewData(broker);
            this.addressComponent.setViewData(broker);
            this.linkComponent.setViewData(broker);
            this.authorisedRepComponent.setViewData(broker);
            this.documentsComponent.setViewData(broker);
            this.representativeChecksComponent.setViewData(broker);
            this.getNotes(params.id, ServiceTypeEnum.RepresentativeManager, 'Broker');
            this.getAuditDetails(params.id, ServiceTypeEnum.ClientManager, ClientItemTypeEnum.Representative);

            this.isLoading = false;
          }
        );
      }
    });
  }

  private checkUserPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Representative');
    this.canEdit = userUtility.hasPermission('Edit Representative');
  }

  getAuditDetails(id: number, serviceType: number, itemType: number): void {
    const request = new AuditRequest(serviceType, itemType, id);
    this.auditLogComponent.getData(request);
  }

  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }

  back(): void {
    this.router.navigate(['/clientcare/broker-manager']);
  }

  edit(): void {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'broker-manager';
    startWizardRequest.linkedItemId = this.broker.id;

    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.router.navigate(['/clientcare/broker-manager/broker-manager/continue/', wizard.id]);
    });
  }
}
