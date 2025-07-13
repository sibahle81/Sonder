import { Component, OnInit, ViewChild } from '@angular/core';
import { AuditLogComponent } from 'projects/shared-components-lib/src/lib/audit/audit-log.component';
import { BenefitDetailsComponent } from 'projects/clientcare/src/app/product-manager/views/benefit-details/benefit-details.component';
import { AuditRequest } from 'projects/shared-components-lib/src/lib/audit/audit-models';
import { NotesRequest } from 'projects/shared-components-lib/src/lib/notes/notes-request';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ItemType } from 'projects/clientcare/src/app/product-manager/models/item-type.enum';
import { BenefitNotesComponent } from 'projects/clientcare/src/app/product-manager/views/benefit-notes/benefit-notes.component';
import { BenefitRulesComponent } from 'projects/clientcare/src/app/product-manager/views/benefit-rules/benefit-rules.component';
import { BenefitService } from 'projects/clientcare/src/app/product-manager/services/benefit.service';
import { BreadcrumbProductService } from 'projects/clientcare/src/app/product-manager/services/breadcrumb-product.service';
import { BenefitDocumentsComponent } from 'projects/clientcare/src/app/product-manager/views/benefit-documents/benefit-documents.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './benefit-view.component.html'
})
export class BenefitViewComponent implements OnInit {
  @ViewChild(BenefitDetailsComponent, { static: true }) detailsComponent: BenefitDetailsComponent;
  @ViewChild(BenefitRulesComponent, { static: true }) rulesComponent: BenefitRulesComponent;
  @ViewChild(AuditLogComponent, { static: true }) auditLogComponent: AuditLogComponent;
  @ViewChild(BenefitNotesComponent, { static: true }) notesComponent: BenefitNotesComponent;
  @ViewChild(BenefitDocumentsComponent, { static: true }) documentsComponent: BenefitDocumentsComponent;

  canEdit: boolean;
  currentId: number;
  isLoading: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly benefitsService: BenefitService,
    private readonly breadCrumbService: BreadcrumbProductService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.checkUserAddPermission();
    this.breadCrumbService.setBreadcrumb('View Benefit');

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.currentId = params.id;
        this.benefitsService.getBenefit(params.id).subscribe(benefit => {
          this.detailsComponent.setViewData(benefit);
          this.rulesComponent.setViewData(benefit);
          this.documentsComponent.setViewData(benefit);

          this.getNotes(params.id, ServiceTypeEnum.BenefitManager, 'Benefit');
          this.getAuditDetails(params.id, ServiceTypeEnum.ProductManager, ItemType.Benefit);
          this.isLoading = false;
        });
      }
    });
  }

  private checkUserAddPermission(): void {
    this.canEdit = userUtility.hasPermission('Edit Benefit');
  }

  /** @description Gets the audit details for the selected details class */
  getAuditDetails(id: number, serviceType: number, itemType: number): void {
    const auditRequest = new AuditRequest(serviceType, itemType, id);
    this.auditLogComponent.getData(auditRequest);
  }

  /** @description Gets the notes for the selected details class */
  getNotes(id: number, serviceType: number, itemType: string): void {
    const noteRequest = new NotesRequest(serviceType, itemType, id);
    this.notesComponent.getData(noteRequest);
  }

  back(): void {
    this.router.navigate(['/clientcare/product-manager/benefit-list']);
  }

  edit(): void {
    this.router.navigate(['/clientcare/product-manager/benefit/benefit/new', this.currentId]);
  }
}
