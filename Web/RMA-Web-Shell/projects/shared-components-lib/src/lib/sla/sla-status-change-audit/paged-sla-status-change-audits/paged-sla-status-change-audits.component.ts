import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SLAService } from 'projects/shared-services-lib/src/lib/services/sla/sla.service';
import { PagedSLAStatusChangeAuditsDataSource } from './paged-sla-status-change-audits.datasource';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { SLAStatusChangeAudit } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-status-change-audit';
import { BehaviorSubject } from 'rxjs';
import { slaConfigurationsHelper } from 'projects/shared-utilities-lib/src/lib/sla-configurations/sla-configurations';

@Component({
  selector: 'paged-sla-status-change-audits',
  templateUrl: './paged-sla-status-change-audits.component.html',
  styleUrls: ['./paged-sla-status-change-audits.component.css']
})
export class PagedSLAStatusChangeAuditsComponent extends UnSubscribe implements OnInit, OnChanges {

  @Input() currentQuery = '';
  @Input() slaItemType: SLAItemTypeEnum;
  @Input() isDialog = false;
  @Input() triggerRefresh: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: PagedSLAStatusChangeAuditsDataSource;
  calculatedSla$: BehaviorSubject<string> = new BehaviorSubject(String.Empty);

  today: Date;

  constructor(private readonly slaService: SLAService) {
    super();
    this.dataSource = new PagedSLAStatusChangeAuditsDataSource(this.slaService);
  }

  ngOnInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.today = new Date();
    this.getData();
  }

  getData() {
    this.dataSource.slaItemType = this.slaItemType;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery)
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'status', show: true },
      { def: 'reason', show: true },
      { def: 'effectiveFrom', show: true },
      { def: 'effictiveTo', show: true },
      { def: 'modifiedBy', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize > 10 },
      { def: 'modifiedByConverted', show: this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10 },
      { def: 'duration', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  calculateSLA(slaStatusChangeAudit: SLAStatusChangeAudit) {
    if (!slaStatusChangeAudit) return;

    const startDate = new Date(slaStatusChangeAudit.effectiveFrom);
    const endDate = slaStatusChangeAudit.effictiveTo ? new Date(slaStatusChangeAudit.effictiveTo) : this.today;

    const publicHolidays: string[] = slaConfigurationsHelper.getPublicHolidays();
    const workingHoursStart = 8; // 8 AM
    const workingHoursEnd = 16; // 4 PM

    let totalMinutes = 0;
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      const currentDay = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const currentDateString = currentDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Check if it's a weekend or public holiday
      if (currentDay !== 0 && currentDay !== 6 && !publicHolidays.includes(currentDateString)) {
        const currentHour = currentDate.getHours();

        // Check if it's within working hours
        if (currentHour >= workingHoursStart && currentHour < workingHoursEnd) {
          totalMinutes++;
        }
      }

      // Move to the next minute
      currentDate.setMinutes(currentDate.getMinutes() + 1);
    }

    const days = Math.floor(totalMinutes / (60 * 8)); // 8-hour workdays
    const hours = Math.floor((totalMinutes % (60 * 8)) / 60);
    const minutes = totalMinutes % 60;

    const text = totalMinutes !== 0 ? `${days} days ${hours} hrs ${minutes} mins` : 'SLA Stopped';
    this.calculatedSla$.next(text);
  }

  isSlaRunning(): boolean {
    return this.dataSource && this.dataSource.data && this.dataSource.data.data ? this.dataSource.data.data.some(s => s.effictiveTo === null) : false;
  }

  isSlaPaused(): boolean {
    const now = new Date();
    const hours = now.getHours();
    return hours < 8 || hours >= 16;
  }

  getSLAItemType(id: number) {
    return this.formatText(SLAItemTypeEnum[id]);
  }

  formatText(text: string): string {
    return text && text?.length > 0 ? (text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim()).replace(/\s\s+/g, ' ') : 'No data';
  }
}
