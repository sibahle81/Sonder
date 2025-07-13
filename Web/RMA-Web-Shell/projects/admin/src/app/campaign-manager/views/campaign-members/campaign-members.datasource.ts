import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

import { TargetAudienceMemberService } from '../../shared/services/target-audience-member.service';
import { TargetAudienceMember } from '../../shared/entities/target-audience-member';

@Injectable()
export class CampaignMembersDataSource extends Datasource {

  constructor(
    alertService: AlertService,
    appEventsManager: AppEventsManager,
    private readonly targetAudienceMemberService: TargetAudienceMemberService
  ) {
    super(appEventsManager, alertService);
    this.defaultSortColumn = 'name';
  }

  getData(campaignId: any): void {
    this.isLoading = true;
    if (campaignId && campaignId > 0) {
      this.targetAudienceMemberService.getTargetAudienceMembers(campaignId).subscribe(
        data => {
          this.dataChange.next(data);
          this.stopLoading();
        }
      );
    } else {
      this.dataChange.next(new Array<TargetAudienceMember>());
      this.stopLoading();
    }
  }

  getClientRecords(itemType: string, itemId: number) {
    this.isLoading = true;
    this.targetAudienceMemberService.getTargetAudienceClientMembers(itemType, itemId).subscribe(
      data => {
        this.dataChange.next(data);
        this.stopLoading();
      }
    );
  }

  getLeadRecords(itemType: string, itemId) {
    this.isLoading = true;
    this.targetAudienceMemberService.getTargetAudienceLeadMembers(itemType, itemId).subscribe(
      data => {
        this.dataChange.next(data);
        this.stopLoading();
      }
    );
  }

  connect(): Observable<any[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];
    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter((member: TargetAudienceMember) => {
        const searchStr = (`${member.name}|${member.email}|${member.mobileNo}|${member.phoneNo}`).toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });
      const sortedData = this.getSortedData(this.filteredData.slice());
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }
}
