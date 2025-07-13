import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { MatTabGroup, MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { CampaignManagerBreadcrumbService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-manager-breadcrumb.service';
import { CampaignService } from 'projects/admin/src/app/campaign-manager/shared/services/campaign-service';
import { Campaign } from 'projects/admin/src/app/campaign-manager/shared/entities/campaign';
import { ItemType } from 'projects/admin/src/app/campaign-manager/shared/enums/item-type.enum';
import { TargetAudienceListComponent } from 'projects/admin/src/app/campaign-manager/views/target-audience-list/target-audience-list.component';
import { CampaignTemplateComponent } from 'projects/admin/src/app/campaign-manager/views/campaign-template/campaign-template.component';
import { CampaignReviewComponent } from 'projects/admin/src/app/campaign-manager/views/campaign-review/campaign-review.component';
import { CampaignReminderComponent } from 'projects/admin/src/app/campaign-manager/views/campaign-reminder/campaign-reminder.component';
import { DetailsComponent } from 'projects/shared-components-lib/src/lib/details-component/details-component';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BaseClass } from 'projects/shared-models-lib/src/lib/common/base-class';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { DateRangeValidator } from 'projects/shared-utilities-lib/src/lib/validators/date-range.validator';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { CampaignStatus } from 'projects/admin/src/app/campaign-manager/views/campaign-review/campaign-status';
import { Tenant } from 'projects/shared-models-lib/src/lib/security/tenant';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './campaign-details.component.html'
})
export class CampaignDetailsComponent extends DetailsComponent implements OnInit {

  @ViewChild(TargetAudienceListComponent, { static: true }) audienceComponent: TargetAudienceListComponent;
  @ViewChild(CampaignTemplateComponent, { static: true }) templateComponent: CampaignTemplateComponent;
  @ViewChild(CampaignReminderComponent, { static: true }) reminderComponent: CampaignReminderComponent;
  @ViewChild(CampaignReviewComponent, { static: true }) reviewComponent: CampaignReviewComponent;
  @ViewChild(MatTabGroup, { static: true }) matTabGroup: MatTabGroup;

  tabIndex: number;
  campaign: Campaign;
  tenant: Tenant;
  isLoading: boolean;

  products: Product[];
  selectProducts: Product[] = [];
  campaignCategories: Lookup[];
  campaignTypes: Lookup[];
  roles: Lookup[];
  campaignOwners: User[];

  ownerTypes: Lookup[] = [
    { id: 1, name: 'Person' } as Lookup,
    { id: 2, name: 'Role' } as Lookup
  ];

  get isCampaignOwner(): boolean {
    if (!this.campaign) { return false; }
    return this.campaign.owner === this.authService.getUserEmail();
  }

  get showPauseButton(): boolean {
    if (!this.showSaveButton) { return false; }
    if (this.campaign && this.campaign.id > 0) {
      if (this.isCampaignOwner && this.canEdit) {
        return !this.form.value.paused;
      }
    }
    return false;
  }

  get showUnpauseButton(): boolean {
    if (!this.showSaveButton) { return false; }
    if (this.campaign && this.campaign.id > 0) {
      if (this.isCampaignOwner && this.canEdit) {
        return this.form.value.paused;
      }
    }
    return false;
  }

  get hideOwnerPerson(): boolean {
    return this.form.value.ownerTypeId !== 1;
  }

  get hideOwnerRole(): boolean {
    return this.form.value.ownerTypeId !== 2;
  }

  constructor(
    router: Router,
    appEventsManager: AppEventsManager,
    private readonly location: Location,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly breadcrumbService: CampaignManagerBreadcrumbService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly campaignService: CampaignService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly lookupService: LookupService
  ) {
    super(appEventsManager, alertService, router, 'Campaign', '', 1);
    this.checkUserAddPermission();
    this.loadLookupLists();
    this.getCurrentTenant();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadingStart('Loading campaign details');
    this.createForm();
  }

  loadLookupLists(): void {
    this.loadCampaignOwners();
    this.loadCampaignRoles();
    this.loadCampaignCategories();
    this.loadCampaignTypes();
    this.loadProducts();
  }

  getCurrentTenant(): void {
    const user = this.authService.getCurrentUser();
    this.userService.getTenant(user.email).subscribe(
      tenant => {
        this.tenant = tenant;
      }
    );
  }

  loadCampaignOwners(): void {
    this.userService.getUsersByPermission('Campaign Owner').subscribe(
      data => {
        this.campaignOwners = data;
        this.loadCampaign();
      }
    );
  }

  loadCampaignRoles(): void {
    this.lookupService.getRoles().subscribe(
      data => {
        this.roles = data.sort(this.comparer);
      }
    );
  }

  loadCampaign(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.tab) {
        this.tabIndex = params.tab;
      }
      this.resetComponents();
      if (params.id) {
        this.breadcrumbService.setBreadcrumb('Edit campaign');
        this.readCampaign(params.id);
      } else {
        this.breadcrumbService.setBreadcrumb('Add campaign');
        this.campaign = this.getNewCampaign();
        this.getDisplayName(this.campaign);
        this.setForm(this.campaign);
        this.isLoading = false;
        this.loadingStop();
      }
    });
  }

  resetComponents(): void {
    if (this.audienceComponent) {
      this.audienceComponent.hasLoaded = false;
    }
    if (this.templateComponent) {
      this.templateComponent.clearTemplates();
    }
  }

  getNewCampaign(): Campaign {
    const campaign = new Campaign();
    campaign.id = 0;
    campaign.name = '';
    campaign.description = '';
    campaign.campaignCategory = 2;
    campaign.campaignType = 1;
    campaign.campaignStatus = CampaignStatus.New;
    campaign.productId = null;
    campaign.owner = this.authService.getUserEmail();
    campaign.startDate = this.getCurrentDate();
    campaign.endDate = null;
    campaign.paused = false;
    return campaign;
  }

  getDisplayName(baseClass: BaseClass): void {
    if (!this.lastModifiedByComponent) { return; }
    this.lastModifiedByComponent.getDisplayName(baseClass);
  }

  clearDisplayName(): void {
    if (!this.lastModifiedByComponent) { return; }
    this.lastModifiedByComponent.clearDisplayName();
  }

  loadCampaignCategories(): void {
    this.lookupService.getCampaignCategories().subscribe(
      data => {
        this.campaignCategories = data.sort(this.comparer);
      }
    );
  }

  loadCampaignTypes(): void {
    this.lookupService.getCampaignTypes().subscribe(
      data => {
        this.campaignTypes = data.sort(this.comparer);
      }
    );
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      data => {
        this.products = data.sort(this.comparer);
        this.products.unshift(this.getOperationalProduct());
        this.selectProducts = this.products;
      }
    );
  }

  comparer(a: any, b: any): number {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) { return -1; }
    if (nameA > nameB) { return 1; }
    return 0;
  }

  readCampaign(id: number): void {
    this.form.disable();
    this.campaignService.getCampaign(id).subscribe(
      campaign => {
        this.campaign = campaign;
        this.getDisplayName(this.campaign);
        this.setForm(this.campaign);
        this.getNotes(id, ServiceTypeEnum.CampaignManager, 'Campaign');
        this.getAuditDetails(id, ServiceTypeEnum.CampaignManager, ItemType.Campaign);
        this.matTabGroup.selectedIndex = this.tabIndex ? this.tabIndex : 0;
        this.isLoading = false;
        this.loadingStop();
      }
    );
  }

  checkUserAddPermission(): void {
    this.canAdd = userUtility.hasPermission('Add Campaign');
    this.canEdit = userUtility.hasPermission('Edit Campaign');
  }

  createForm(): void {
    this.clearDisplayName();
    this.form = this.formBuilder.group(
      {
        id: 0,
        tenantId: new UntypedFormControl(''),
        campaignName: new UntypedFormControl('', [Validators.required]),
        description: new UntypedFormControl(''),
        campaignCategoryId: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
        campaignTypeId: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
        productId: new UntypedFormControl('', [Validators.required, Validators.min(0)]),
        ownerTypeId: new UntypedFormControl(''),
        campaignOwnerId: new UntypedFormControl(''),
        campaignRoleId: new UntypedFormControl(''),
        startDate: new UntypedFormControl('', [Validators.required, DateRangeValidator.startBeforeEnd('endDate')]),
        endDate: new UntypedFormControl('', [DateRangeValidator.endAfterStart('startDate')]),
        status: new UntypedFormControl(''),
        paused: new UntypedFormControl('')
      }
    );
  }

  setForm(campaign: Campaign): void {
    this.form.setValue({
      id: campaign.id ? campaign.id : 0,
      tenantId: campaign.tenantId,
      campaignName: campaign.name ? campaign.name : '',
      description: campaign.description ? campaign.description : '',
      campaignCategoryId: campaign.campaignCategory,
      campaignTypeId: campaign.campaignType,
      productId: campaign.productId,
      ownerTypeId: campaign.owner ? 1 : 2,
      campaignOwnerId: campaign.owner ? this.getUserId(campaign.owner) : 0,
      campaignRoleId: this.getRoleId(campaign.role),
      startDate: campaign.startDate ? campaign.startDate : this.getCurrentDate(),
      endDate: campaign.endDate,
      status: campaign.campaignStatus,
      paused: campaign.paused
    });
    this.setOwnerValidators();
  }

  setOwnerValidators(): void {
    const ownerType = this.form.value.ownerTypeId;
    const ownerControl = this.form.get('campaignOwnerId');
    const roleControl = this.form.get('campaignRoleId');
    switch (ownerType) {
      case 1:
        ownerControl.setValidators([Validators.required, Validators.min(1)]);
        roleControl.setValidators(null);
        break;
      case 2:
        ownerControl.setValidators(null);
        roleControl.setValidators([Validators.required, Validators.min(1)]);
        break;
    }
    ownerControl.updateValueAndValidity();
    roleControl.updateValueAndValidity();
  }

  getCurrentDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  getUserId(email: string): number {
    if (!email) { return 0; }
    if (!this.campaignOwners) { return 0; }
    const user = this.campaignOwners.find(usr => usr.email.toLowerCase() === email.toLowerCase());
    return user ? user.id : 0;
  }

  getUserName(id: number): string {
    if (!this.campaignOwners) { return ''; }
    const user = this.campaignOwners.find(usr => usr.id === id);
    return user ? user.email : null;
  }

  getRoleId(name: string): number {
    if (!name) { return 0; }
    if (!this.roles) { return 0; }
    const role = this.roles.find(r => r.name.toLocaleLowerCase() === name.toLowerCase());
    return role ? role.id : null;
  }

  getRoleName(id: number): string {
    if (!this.roles) { return ''; }
    const role = this.roles.find(r => r.id === id);
    return role ? role.name : '';
  }

  getOperationalProduct(): Product {
    const product = new Product();
    product.id = null;
    product.name = '- No product -';
    return product;
  }

  readForm(): void {
    const model = this.form.value;
    this.campaign.tenantId = this.tenant.id as number;
    this.campaign.id = model.id as number;
    this.campaign.name = model.campaignName as string;
    this.campaign.description = model.description as string;
    this.campaign.campaignCategory = model.campaignCategoryId as number;
    this.campaign.campaignType = model.campaignTypeId as number;
    this.campaign.productId = model.productId as number;
    this.campaign.owner = model.ownerTypeId === 1 ? this.getUserName(model.campaignOwnerId) : null;
    this.campaign.role = model.ownerTypeId === 2 ? this.getRoleName(model.campaignRoleId) : null;
    this.campaign.startDate = this.adjustDate('startDate', model.startDate);
    this.campaign.endDate = this.adjustDate('endDate', model.endDate);
    this.campaign.campaignStatus = model.status as number;
    this.campaign.paused = model.paused as boolean;
  }

  adjustDate(control: string, date: Date): Date {
    if (!date) { return null; }
    if (this.form.get(control).dirty) {
      return this.getAdjustedDate(date);
    }
    return date;
  }

  getAdjustedDate(date: Date): Date {
    const diff = date.getTimezoneOffset();
    const dtm = new Date(date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes() - diff,
      0);
    return dtm;
  }

  tabChanged(event: MatTabChangeEvent): void {
    switch (event.index) {
      case 1:
        if (this.audienceComponent) {
          this.audienceComponent.getMembers(this.campaign);
        }
        break;
      case 2:
        if (this.templateComponent) {
          this.templateComponent.getTemplates(this.campaign);
        }
        break;
      case 3:
        if (this.reminderComponent) {
          this.reminderComponent.setCampaign(this.campaign);
        }
        break;
      case 4:
        if (this.reviewComponent) {
          this.reviewComponent.getApprovals(this.campaign);
        }
        break;
    }
  }

  edit(): void {
    this.submittedCount = 0;
    this.form.enable();
  }

  save(): void {
    this.saveCampaign(true);
  }

  saveCampaign(updateStatus: boolean): void {
    if (!this.form.valid) { return; }
    this.form.disable();
    this.readForm();
    this.loadingStart(`Saving campaign ${this.campaign.name}`);
    if (this.campaign.id > 0) {
      if (updateStatus) {
        this.campaign.campaignStatus = CampaignStatus.Updated;
      }
      this.editCampaign(this.campaign);
    } else {
      this.addCampaign(this.campaign);
    }
  }

  editCampaign(campaign: Campaign): void {
    this.campaignService.editCampaign(campaign).subscribe(
      () => {
        this.loadingStart('Reloading campaign...');
        this.campaign = campaign;
        this.getAuditDetails(campaign.id, ServiceTypeEnum.CampaignManager, ItemType.Campaign);
        this.showDone(campaign, 'updated');
      }
    );
  }

  addCampaign(campaign: Campaign): void {
    this.campaignService.addCampaign(campaign).subscribe(
      (data) => {
        this.resetComponents();
        this.campaign = campaign;
        this.campaign.id = data;
        this.setForm(this.campaign);
        this.campaign.campaignSmses = [];
        this.campaign.campaignEmails = [];
        this.loadingStart('Reloading campaign...');
        this.getNotes(data, ServiceTypeEnum.CampaignManager, 'Campaign');
        this.getAuditDetails(data, ServiceTypeEnum.CampaignManager, ItemType.Campaign);
        this.showDone(campaign, 'added');
      }
    );
  }

  showDone(campaign: Campaign, action: string): void {
    this.loadingStop();
    this.alertService.success(`Campaign has been ${action} successfully`, 'Campaign');
  }

  pause(paused: boolean): void {
    this.form.patchValue({ paused });
    this.saveCampaign(false);
  }

  back(): void {
    this.location.back();
  }
}
