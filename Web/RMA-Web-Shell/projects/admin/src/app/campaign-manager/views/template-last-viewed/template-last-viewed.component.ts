import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Template } from 'projects/admin/src/app/campaign-manager/shared/entities/template';
import { TemplateLastViewedDataSource } from 'projects/admin/src/app/campaign-manager/views/template-last-viewed/template-last-viewed.datasource';
import { ListComponent } from 'projects/shared-components-lib/src/lib/list-component/list.component';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

@Component({
  templateUrl: './template-last-viewed.component.html',
  selector: 'template-last-viewed'
})
export class TemplateLastViewedListComponent extends ListComponent implements OnInit {

  canAdd: boolean;
  canEdit: boolean;
  canRemove: boolean;

  get isLoading(): boolean { return this.templateDataSource.isLoading; }

  constructor(
    router: Router,
    alertService: AlertService,
    private readonly datePipe: DatePipe,
    private readonly templateDataSource: TemplateLastViewedDataSource
  ) {
    super(alertService, router, templateDataSource, 'campaign-manager/template-details', 'Template', 'Templates');
    this.hideAddButton = false;
  }

  ngOnInit(): void {
    this.setPermissions();
    super.ngOnInit();
  }

  setPermissions(): void {
    this.canAdd = userUtility.hasPermission('Add Campaign Template');
    this.canEdit = userUtility.hasPermission('Edit Campaign Template');
    this.canRemove = userUtility.hasPermission('Remove Campaign Template');
  }

  setupDisplayColumns(): void {
    this.columns = [
      { columnDefinition: 'name', header: 'Name', cell: (row: Template) => `${row.name}` },
      { columnDefinition: 'template', header: 'Template Type', cell: (row: Template) => `${row.template}` },
      { columnDefinition: 'dateViewed', header: 'Date Viewed', cell: (row: Template) => `${`${this.datePipe.transform(row.dateViewed, 'medium')}`}` }
    ];
  }

  onSelect(item: any): void {
    const itemType = item.campaignTemplateType === 1 ? 'Email' : 'Sms';
    this.router.navigate(['campaign-manager/template-details', itemType, item.id]);
  }
}
