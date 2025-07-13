import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CampaignManagerBreadcrumbService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-manager-breadcrumb.service';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { CampaignListDataSource } from 'projects/admin/src/app/campaign-manager/views/campaign-list/campaign-list.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  styleUrls: ['./campaign-list.component.css'],
  templateUrl: './campaign-list.component.html'
})
export class CampaignListComponent extends ListComponent implements OnInit {

  campaign = new Campaign();
  products: Product[];
  campaignTypes: Lookup[];
  campaignStatuses: Lookup[];

  canAdd: boolean;
  canEdit: boolean;
  canRemove: boolean;
  isDeleting = false;
  isCopying = false;
  ownerCampaigns = false;

  get isLoading(): boolean {
    return this.campaignDataSource.isLoading;
  }

  get confirmAction(): boolean {
    return this.isCopying || this.isDeleting;
  }

  constructor(
    router: Router,
    alertService: AlertService,
    breadcrumbService: CampaignManagerBreadcrumbService,
    private readonly datePipe: DatePipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly campaignService: CampaignService,
    private readonly appEventsManager: AppEventsManager,
    private readonly campaignDataSource: CampaignListDataSource,
    private readonly authService: AuthService,
    private readonly lookupService: LookupService,
    private readonly productService: ProductService
  ) {
    super(alertService, router, campaignDataSource, 'campaign-manager/campaign-details', 'Campaign', 'Campaigns');
    breadcrumbService.setBreadcrumb('My Campaigns');
    this.hideAddButton = !this.canAddCampaigns();
    this.loadLookupData();
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'name', header: 'Name', cell: (row: Campaign) => row.name },
      { columnDefinition: 'description', header: 'Description', cell: (row: Campaign) => row.description },
      { columnDefinition: 'status', header: 'Status', cell: (row: Campaign) => this.getStatus(row.campaignStatus) },
      { columnDefinition: 'paused', header: 'Paused', cell: (row: Campaign) => this.getPausedStatus(row.paused) },
      { columnDefinition: 'campaignTypeId', header: 'Type', cell: (row: Campaign) => this.getCampaignType(row.campaignType) },
      { columnDefinition: 'productId', header: 'Product', cell: (row: Campaign) => this.getProductName(row.productId) },
      { columnDefinition: 'startDate', header: 'Start Date', cell: (row: Campaign) => this.datePipe.transform(row.startDate, 'mediumDate') }
    ];
  }

  ngOnInit(): void {
    this.setPermissions();
    this.activatedRoute.params.subscribe(
      (params: any) => {
        this.setActions(params);
        super.ngOnInit();
      }
    );
  }

  setPermissions(): void {
    this.ownerCampaigns = false;
    this.canAdd = userUtility.hasPermission('Add Campaign');
    this.canEdit = userUtility.hasPermission('Edit Campaign');
    this.canRemove = userUtility.hasPermission('Remove Campaign');
  }

  setActions(params: any): void {
    if (params.action) {
      switch (params.action.toLowerCase()) {
        case 'mine':
          this.campaignDataSource.campaignOwner = this.authService.getUserEmail();
          this.ownerCampaigns = true;
          break;
      }
    }
  }

  getStatus(statusId: number): string {
    const status = this.campaignStatuses.find(s => s.id === statusId);
    if (!status) { return ''; }
    return status.name;
  }

  filterData(event: any): void {
    if (this.dataSource) {
      this.dataSource.filter = this.filter.nativeElement.value;
    }
  }

  loadLookupData(): void {
    this.loadCampaignTypes();
    this.loadCampaignStatuses();
    this.loadProducts();
  }

  loadCampaignTypes(): void {
    this.lookupService.getCampaignTypes().subscribe(
      data => {
        this.campaignTypes = data;
      }
    );
  }

  loadCampaignStatuses(): void {
    this.lookupService.getCampaignStatuses().subscribe(
      data => {
        this.campaignStatuses = data;
      }
    );
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      data => {
        this.products = data;
      }
    );
  }

  getPausedStatus(paused: boolean): string {
    return paused ? 'Yes' : '';
  }

  getCampaignType(id: number): string {
    if (!this.campaignTypes) { return 'loading...'; }
    const campaignType = this.campaignTypes.find(ct => ct.id === id);
    return campaignType ? campaignType.name : '- No type -';
  }

  getProductName(id: number): string {
    if (!this.products) { return 'loading...'; }
    const product = this.products.find(p => p.id === id);
    return product ? product.name : '- No product -';
  }

  canAddCampaigns(): boolean {
    return userUtility.hasPermission('Add Campaign');
  }

  confirmCopyCampaign(campaign: any): void {
    this.campaign = campaign;
    this.isCopying = true;
  }

  copyCampaign(): void {
    this.appEventsManager.loadingStart('Copying campaign...');
    this.campaignService.copyCampaign(this.campaign).subscribe(
      data => {
        this.isCopying = false;
        this.campaignDataSource.getData();
        this.appEventsManager.loadingStop();
        this.alertService.success('Campaign successfully copied.');
      },
      error => {
        this.alertService.error(error);
      }
    );
  }

  confirmRemoveCampaign(campaign: any): void {
    this.campaign = campaign;
    this.isDeleting = true;
  }

  removeCampaign(): void {
    this.appEventsManager.loadingStart('Removing campaign...');
    this.campaignService.deleteCampaign(this.campaign.id).subscribe(
      data => {
        this.isDeleting = false;
        this.campaignDataSource.getData();
        this.appEventsManager.loadingStop();
        this.alertService.success('Campaign successfully removed.');
      },
      error => {
        this.alertService.error(error);
      }
    );
  }

  cancelCampaignAction(): void {
    this.isDeleting = false;
    this.isCopying = false;
  }
}
