import { Component } from '@angular/core';

import { TargetAudienceBaseComponent } from '../shared/target-audience-base.component';
import { TargetAudienceService } from '../../shared/services/target-audience.service';
import { LookupItem } from 'projects/shared-models-lib/src/lib/lookup/lookup-item';


@Component({
  styleUrls: ['./target-audience-leads.component.css'],
  templateUrl: './target-audience-leads.component.html',
  // tslint:disable-next-line:component-selector
  selector: 'target-audience-lead'
})
export class TargetAudienceLeadComponent extends TargetAudienceBaseComponent {

  get showLeadCategories(): boolean {
    return this.targetCategoryId > 2;
  }

  get selectLead(): boolean {
    return this.targetCategoryId === 2;
  }

  constructor(
    audienceService: TargetAudienceService
  ) {
    super('Lead', audienceService);
  }

  setTargetCategories(items: any[], includeIndividual: boolean): void {
    this.targetCategories = items;
    if (includeIndividual) {
      this.targetCategories.unshift(this.getLookupItem(2, 'SelectLead'));
    }
    this.targetCategories.unshift(this.getLookupItem(1, 'AllLeads'));
  }

  loadEntityList(): void {
    this.entityList = [];
  }

}
