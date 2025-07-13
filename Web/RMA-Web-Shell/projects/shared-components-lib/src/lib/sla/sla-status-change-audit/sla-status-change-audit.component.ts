import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { SLAItemTypeConfiguration } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-item-type-configuration';
import { SLAStatusChangeAudit } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-status-change-audit';
import { SLAService } from 'projects/shared-services-lib/src/lib/services/sla/sla.service';
import { BehaviorSubject } from 'rxjs';
import { SLAStatusChangeAuditListDialogComponent } from './sla-status-change-audit-list-dialog/sla-status-change-audit-list-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { slaConfigurationsHelper } from 'projects/shared-utilities-lib/src/lib/sla-configurations/sla-configurations';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';

@Component({
  selector: 'sla-status-change-audit',
  templateUrl: './sla-status-change-audit.component.html',
  styleUrls: ['./sla-status-change-audit.component.css']
})
export class SlaStatusChangeAuditComponent extends UnSubscribe implements OnChanges, OnDestroy {

  @Input() slaItemType: SLAItemTypeEnum;
  @Input() itemId: number;
  @Input() triggerRefresh: boolean;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  slaItemTypeConfiguration: SLAItemTypeConfiguration;
  slaStatusChangeAudits: SLAStatusChangeAudit[];

  days$: BehaviorSubject<number> = new BehaviorSubject(0);
  calculatedSla$: BehaviorSubject<string> = new BehaviorSubject('');

  private calculationIntervalId: any;

  constructor(
    private readonly slaService: SLAService,
    public dialog: MatDialog
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.slaItemType && this.itemId) {
      this.slaItemTypeConfiguration = slaConfigurationsHelper.getSlaConfiguration(this.slaItemType);
      this.getSLAStatusChangeAudits();
    }
  }

  getSLAStatusChangeAudits() {
    this.slaService.getSLAStatusChangeAudits(this.slaItemType, this.itemId).subscribe(result => {
      this.slaStatusChangeAudits = result;
      this.calculateSLA();

      // Restart the interval safely
      this.clearCalculationInterval();
      this.startCalculating();

      this.isLoading$.next(false);
    });
  }

  startCalculating() {
    this.calculationIntervalId = setInterval(() => {
      this.calculateSLA();
    }, 30000); // every 30 seconds
  }

  clearCalculationInterval() {
    if (this.calculationIntervalId) {
      clearInterval(this.calculationIntervalId);
      this.calculationIntervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.clearCalculationInterval();
  }

  calculateSLA() {
    if (!this.slaStatusChangeAudits || this.slaStatusChangeAudits.length === 0) return;

    const workingHoursStart = 8;  // 8 AM
    const workingHoursEnd = 16;   // 4 PM
    const publicHolidays: string[] = slaConfigurationsHelper.getPublicHolidays();

    const startDate = new Date(this.slaStatusChangeAudits[0].effectiveFrom);
    const endDate = this.slaStatusChangeAudits[this.slaStatusChangeAudits.length - 1].effictiveTo
      ? new Date(this.slaStatusChangeAudits[this.slaStatusChangeAudits.length - 1].effictiveTo)
      : new Date();

    let current = new Date(startDate);
    let workingMinutes = 0;

    while (current < endDate) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
      const currentDateStr = current.toISOString().split('T')[0];

      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !publicHolidays.includes(currentDateStr)) {
        const hour = current.getHours();

        if (hour >= workingHoursStart && hour < workingHoursEnd) {
          workingMinutes++;
        }
      }

      current.setMinutes(current.getMinutes() + 1);
    }

    const days = Math.floor(workingMinutes / (60 * 8)); // 8-hour workday
    const hours = Math.floor((workingMinutes % (60 * 8)) / 60);
    const minutes = workingMinutes % 60;

    this.days$.next(days);
    this.calculatedSla$.next(`${days} days ${hours} hrs ${minutes} mins`);
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  isSlaRunning(): boolean {
    return this.slaStatusChangeAudits?.some(s => s.effictiveTo === null) ?? false;
  }

  openSLAStatusChangeAuditListDialog() {
    const dialogRef = this.dialog.open(SLAStatusChangeAuditListDialogComponent, {
      width: '70%',
      data: {
        slaItemType: this.slaItemType,
        currentQuery: this.itemId
      }
    });

    dialogRef.afterClosed().subscribe(results => {
      this.isLoading$.next(true);
      this.getSLAStatusChangeAudits();
    });
  }
}
