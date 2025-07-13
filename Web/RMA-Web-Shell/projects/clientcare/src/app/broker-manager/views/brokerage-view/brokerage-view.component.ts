import { BrokerageService } from '../../services/brokerage.service';
import { BrokerageDetailsComponent } from '../brokerage-details/brokerage-details.component';
import { BrokerageNotesComponent } from '../brokerage-notes/brokerage-notes.component';
import { OnInit, Component, ViewChild } from '@angular/core';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbBrokerService } from '../../services/breadcrumb-broker.service';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { BrokerageBankingDetailsComponent } from '../brokerage-banking-details/brokerage-banking-details.component';
import { BrokerageContactDetailsComponent } from '../brokerage-contact-details/brokerage-contact-details.component';
import { BrokerageConsultantComponent } from '../brokerage-consultant/brokerage-consultant.component';
import { BrokerageProductOptionsComponent } from '../brokerage-product-options/brokerage-product-options.component';
import { BrokerageAddressListComponent } from '../brokerage-address-list/brokerage-address-list.component';
import { BrokerageCategoriesListComponent } from '../brokerage-categories-list/brokerage-categories-list.component';
import { BrokerageDocumentsComponent } from '../brokerage-documents/brokerage-documents.component';
import { BrokerageAuthorizedRepresentativeComponent } from '../brokerage-authorized-representative/brokerage-authorized-representative.component';
import { BrokerageChecksComponent } from '../brokerage-checks/brokerage-checks.component';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ProductOptionConfigurationComponent } from '../product-option-configuration/product-option-configuration.component';
import { BrokerageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/brokerage-type-enum';

@Component({
  templateUrl: './brokerage-view.component.html',
  styleUrls:['./brokerage-view.component.css']
})
export class BrokerageViewComponent implements OnInit {
  @ViewChild(BrokerageDetailsComponent, { static: true }) detailsComponent: BrokerageDetailsComponent;
  @ViewChild(BrokerageBankingDetailsComponent, { static: true }) brokerageBankingDetailsComponent: BrokerageBankingDetailsComponent;
  @ViewChild(BrokerageContactDetailsComponent, { static: true }) brokerageContactDetailsComponent: BrokerageContactDetailsComponent;
  @ViewChild(BrokerageConsultantComponent, { static: true }) brokerageConsultantComponent: BrokerageConsultantComponent;
  @ViewChild(BrokerageProductOptionsComponent, { static: true }) brokerageProductOptionsComponent: BrokerageProductOptionsComponent;
  @ViewChild(ProductOptionConfigurationComponent, { static: true }) productOptionConfigurationComponent: ProductOptionConfigurationComponent;
  @ViewChild(BrokerageAuthorizedRepresentativeComponent, { static: true }) brokerageAuthorizedRepresentativeComponent: BrokerageAuthorizedRepresentativeComponent;
  @ViewChild(BrokerageNotesComponent, { static: true }) notesComponent: BrokerageNotesComponent;
  @ViewChild(BrokerageAddressListComponent, { static: true }) brokerageAddressListComponent: BrokerageAddressListComponent;
  @ViewChild(BrokerageCategoriesListComponent, { static: true }) brokerageCategoriesListComponent: BrokerageCategoriesListComponent;
  @ViewChild(BrokerageDocumentsComponent, { static: true }) documentsComponent: BrokerageDocumentsComponent;
  @ViewChild(BrokerageChecksComponent, { static: true }) brokerageChecksComponent: BrokerageChecksComponent;
  @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;

  canEdit: boolean;
  currentId: number;
  isLoading: boolean;
  brokerageType: BrokerageTypeEnum;
  brokerageTitle = 'Brokerage';

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly brokerageService: BrokerageService,
    private readonly breadCrumbService: BreadcrumbBrokerService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.checkUserAddPermission();
    this.breadCrumbService.setBreadcrumb('View Brokerage');
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.currentId = params.id;
        this.brokerageService.getBrokerage(params.id)
          .subscribe(brokerage => {
            this.brokerageType = brokerage.brokerageType;
            this.setTitle();

            this.detailsComponent.setViewData(brokerage, false);
            this.brokerageBankingDetailsComponent.setViewData(brokerage, false);
            this.brokerageAddressListComponent.setViewData(brokerage, false);
            this.brokerageContactDetailsComponent.setViewData(brokerage, false);
            this.brokerageConsultantComponent.setViewData(brokerage, false);
            this.brokerageCategoriesListComponent.setViewData(brokerage, false);
            this.brokerageAuthorizedRepresentativeComponent.setViewData(brokerage, false);
            this.brokerageProductOptionsComponent.setViewData(brokerage, false);
            this.productOptionConfigurationComponent.setViewData(brokerage, false);
            this.documentsComponent.setViewData(brokerage, false);
            this.brokerageChecksComponent.setViewData(brokerage, false);
            this.getNotes(params.id, ServiceTypeEnum.BrokerageManager, 'Brokerage');
            this.getAuditDetails(params.id, ServiceTypeEnum.BrokerageManager, ClientItemTypeEnum.Brokerage);
            this.isLoading = false;
          });
      }
    });
  }

  setTitle() {
    if (this.brokerageType === BrokerageTypeEnum.Brokerage) {
      this.brokerageTitle = 'Brokerage Details';
    } else {
      this.brokerageTitle = 'Binder Partner Details';
    }
  }

  private checkUserAddPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Brokerage');
  }

  /** @description Gets the audit details for the selected details class */
  getAuditDetails(id: number, serviceType: number, itemType: number): void {
    const request = new AuditRequest(serviceType, itemType, id);
    this.auditLogComponent.getData(request);
  }

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }

  back(): void {
    this.router.navigate(['/clientcare/broker-manager']);
  }

  edit(): void {
        this.router.navigate(['/clientcare/broker-manager/create-broker/brokerage-manager/new', this.currentId]);
  }
}
