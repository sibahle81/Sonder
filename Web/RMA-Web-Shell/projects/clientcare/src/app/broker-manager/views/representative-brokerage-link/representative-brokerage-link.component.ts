import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource } from '@angular/material/table';

import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';

import { Representative } from '../../models/representative';
import { Brokerage } from '../../models/brokerage';
import { BrokerageService } from '../../services/brokerage.service';
import { BrokerageRepresentative } from '../../models/brokerage-representative';
import { RepresentativeService } from '../../services/representative.service';

@Component({
  selector: 'app-representative-brokerage-link',
  templateUrl: './representative-brokerage-link.component.html',
  styleUrls: ['./representative-brokerage-link.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})
export class RepresentativeBrokerageLinkComponent extends WizardDetailBaseComponent<Representative> {
  brokerages: Brokerage[] = [];
  repRoles: Lookup[] = [];
  errors: string[] = [];

  loadingRepresentatives = false;
  loadingJuristiceReps = false;

  dataSource = new MatTableDataSource<BrokerageRepresentative>();
  displayedColumns = ['fspNumber', 'code', 'name', 'juristicRepId', 'startDate', 'endDate'];

  representatives: Representative[] = [];

  get loadingReps(): boolean {
    return this.loadingRepresentatives || this.loadingJuristiceReps;
  }

  get isJuristicRep() {
    if (!this.model) { return false; }
    return this.model.repType === 2;
  }

  get canLink(): boolean {
    return !this.isDisabled;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly brokerageService: BrokerageService,
    private readonly representativeService: RepresentativeService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.loadRepRoles();
  }

  loadRepRoles(): void {
    this.lookupService.getRepRoles().subscribe(
      data => this.repRoles = data
    );
  }

  getRepresentatives(brokerageId: number): Representative[] {
    return this.representatives.filter(r => r.id === 0 || (r.activeBrokerage ? r.activeBrokerage.brokerageId : -1) === brokerageId);
  }

  loadBrokerageRepresentatives(): void {
    this.dataSource.data = [];
    if (!this.model.brokerageRepresentatives) {
      this.model.brokerageRepresentatives = [];
    }
    for (const rep of this.model.brokerageRepresentatives) {
      if (!rep.brokerage || !rep.brokerage.id) {
        const brokerage = this.brokerages.find(b => b.id === rep.brokerageId);
        rep.brokerage = brokerage ? brokerage : new Brokerage();
      }
    }
    this.dataSource.data = this.model.brokerageRepresentatives.filter(br => br.repRole !== 1);
    this.loadingRepresentatives = false;
  }

  loadJuristicRepresentatives(): void {
    this.representatives = [];
    if (this.model.repType === 2) {
      this.loadingJuristiceReps = false;
      return;
    }
    const brokerageIds = this.model.brokerageRepresentatives.map(br => br.brokerageId);
    if (!brokerageIds || brokerageIds.length === 0)
    {
      this.loadingJuristiceReps = false;
      return;
    }
    this.representativeService.getJuristicRepresentatives(brokerageIds).subscribe(
      data => {
        this.representatives = data;
        this.representatives.forEach(rep => {
          if (rep.activeBrokerage && !rep.activeBrokerage.juristicRepId) {
            rep.activeBrokerage.juristicRepId = 0;
          }
        });
        const none = new Representative();
        none.id = 0;
        none.code = '';
        none.name = ' - none - ';
        this.representatives.unshift(none);
        this.loadingJuristiceReps = false;
      }
    );
  }

  getRepRole(repRoleId: number): string {
    const repRole = this.repRoles.find(rr => rr.id === repRoleId);
    return repRole ? repRole.name : 'unknown';
  }

  createForm(id: number): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      dateOfAppointment: ['', [Validators.required]]
    });
  }

  populateForm(): void {
    this.loadingRepresentatives = true;
    this.loadingJuristiceReps = true;
    this.brokerageService.getBrokerages().subscribe(
      data => {
        this.brokerages = data;
        this.loadBrokerageRepresentatives();
        this.loadJuristicRepresentatives();
        this.form.patchValue(
          {
            name: `${this.model.code} - ${this.model.name}`,
            dateOfAppointment: this.model.dateOfAppointment
          }
        );
        this.form.get('name').disable();
        this.form.get('dateOfAppointment').disable();
      }
    );
  }

  populateModel(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    this.validateDates();
    this.validateLinkedBrokerages();
    validationResult.errorMessages = this.errors;
    validationResult.errors = this.errors.length;
    return validationResult;
  }

  validateLinkedBrokerages(): void {
    if (this.model.brokerageRepresentatives.length === 0) {
      this.errors.push('The agent has not been linked to any brokerages.');
    }
  }

  validateDates(): void {
    this.errors = [];
    const latest = Math.max.apply(Math, this.model.brokerageRepresentatives.filter(r => r.repRole !== 1).map(br => this.getTimeStamp(br.startDate)));
    for (const rep of this.dataSource.data) {
      /*
        1. Start date for all records is required.
        2. Start date cannot be before date of appointment.
        3. Active start dates cannot duplicate.
        4. End dates of 'inactive' brokerage cannot be null.
        5. Start date must be before end date.
        6. Date ranges do not overlap.
        7. End date of active link cannot be back dated.
      */
      const startDate = this.getTimeStamp(rep.startDate);
      const endDate = this.getTimeStamp(rep.endDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const today = this.getTimeStamp(now);

      if (!rep.startDate) {
        this.errors.push(`Start date for brokerage ${rep.brokerage.fspNumber}/${rep.brokerage.name} is required.`);
        continue;
      }
      if (startDate < this.getTimeStamp(this.model.dateOfAppointment)) {
        this.errors.push(`Start date for brokerage ${rep.brokerage.fspNumber}/${rep.brokerage.name} cannot be before the appointment date.`);
        continue;
      }
      if (startDate === latest) {
        const duplicates = this.dataSource.data.filter(br => br.id !== rep.id && this.getTimeStamp(br.startDate) === latest);
        if (duplicates && duplicates.length > 0) {
          this.errors.push(`Active start date ${this.getDate(latest)} duplicates on brokerage ${rep.brokerage.fspNumber}/${rep.brokerage.name}.`);
          continue;
        }
        const datesAfter = this.dataSource.data.filter(br => br.id !== rep.id && this.getTimeStamp(br.endDate) >= latest);
        for (const brokerRep of datesAfter) {
          this.errors.push(`End date of brokerage ${brokerRep.brokerage.fspNumber}/${brokerRep.brokerage.name} must be before ${this.getDate(latest)}.`);
          continue;
        }
      } else if (!rep.endDate) {
        this.errors.push(`End date for brokerage ${rep.brokerage.fspNumber}/${rep.brokerage.name} is required.`);
        continue;
      }
      if (endDate && endDate <= startDate) {
        this.errors.push(`End date for brokerage ${rep.brokerage.fspNumber}/${rep.brokerage.name} must be after the start date.`);
        continue;
      }
      const rangeOverlap = this.dataSource.data.filter(br => br.id !== rep.id && startDate >= this.getTimeStamp(br.startDate) && startDate <= this.getTimeStamp(br.endDate));
      if (rangeOverlap && rangeOverlap.length > 0) {
        this.errors.push(`Date range of brokerage ${rep.brokerage.fspNumber}/${rep.brokerage.name} overlaps with another brokerage.`);
      }
    }
  }

  updateJuristicRep(event: any, broker: BrokerageRepresentative): void {
    broker.juristicRepId = event.source.value ? event.source.value : 0;
  }

  getDate(timeStamp: number): string {
    const dtm = new Date(timeStamp);
    const month = `${dtm.getMonth() + 1}`.padStart(2, '0');
    const date = `${dtm.getDate()}`.padStart(2, '0');
    return `${dtm.getFullYear()}-${month}-${date}`;
  }

  getTimeStamp(dtm: Date): number {
    return new Date(dtm).getTime();
  }

  updateStartDate(event: any, broker: BrokerageRepresentative): void {
    broker.startDate = event.value ? event.value : null;
    this.validateDates();
  }

  updateEndDate(event: any, broker: BrokerageRepresentative): void {
    broker.endDate = event.value ? event.value : null;
    this.validateDates();
  }
}
