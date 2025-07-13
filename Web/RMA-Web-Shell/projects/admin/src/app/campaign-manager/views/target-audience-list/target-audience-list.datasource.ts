import { Injectable, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, merge } from 'rxjs';

import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';

import { CampaignService } from '../../shared/services/campaign-service';
import { TargetAudience } from '../../shared/entities/target-audience';
import { TargetAudienceService } from '../../shared/services/target-audience.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

@Injectable()
export class TargetAudienceDataSource extends Datasource {
  groups: Lookup[];
  industries: Lookup[];
  industryClasses: Lookup[];

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly campaignService: CampaignService,
    private readonly audienceService: TargetAudienceService
  ) {
    super(appEventsManager, alertService);
    this.defaultSortColumn = 'itemType';
    this.loadGroups();
    this.loadIndustries();
    this.loadIndustryClasses();
  }

  loadGroups(): void {
    this.audienceService.getTargetCategoryItems('Group').subscribe(
      data => this.groups = data
    );
  }

  loadIndustries(): void {
    this.audienceService.getTargetCategoryItems('Industry').subscribe(
      data => this.industries = data
    );
  }

  loadIndustryClasses(): void {
    this.audienceService.getTargetCategoryItems('IndustryClass').subscribe(
      data => this.industryClasses = data
    );
  }

  getData(campaignId: number): void {
    this.isLoading = true;
    if (campaignId && campaignId > 0) {
      this.audienceService.getTargetAudience(campaignId).subscribe(
        (members) => {
          const clientIds = members.filter(d => d.itemType === 'Client').map(d => d.itemId);
          this.audienceService.getTargetClients(clientIds).subscribe(
            (clients) => {

              for (const client of clients) {
                const member = members.find(m => m.itemType === 'Client' && m.itemId === client.id);
                if (member) {
                  member.name = client.name;
                  member.email = this.getContactValue(member.email, client.email);
                  member.mobileNumber = this.getContactValue(member.mobileNumber, client.mobileNo);
                }
              }
              for (const member of members) {
                switch (member.itemType.toLowerCase()) {
                  case 'group':
                    member.name = this.groups.find(g => g.id === member.itemId).name;
                    break;
                  case 'industry':
                  case 'leadindustry':
                    member.name = this.industries.find(g => g.id === member.itemId).name;
                    break;
                  case 'industryclass':
                  case 'leadindustryclass':
                    member.name = this.industryClasses.find(g => g.id === member.itemId).name;
                    break;
                }
              }
              this.dataChange.next(members);
              this.stopLoading();
            }
          );
        }
      );
    } else {
      this.dataChange.next(new Array<TargetAudience>());
      this.stopLoading();
    }
  }

  getContactValue(current: string, value: string): string {
    if (!current) { return value; }
    if (current === '') { return value; }
    return current;
  }

  connect(): Observable<TargetAudience[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];
    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((item: TargetAudience) => {
        const searchStr = (`${item.itemType}|${item.name}|${item.email}|${item.mobileNumber}`).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });
      const sortedData = this.getSortedData(this.filteredData.slice());
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }
}
