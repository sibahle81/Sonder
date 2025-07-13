import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { PensionCaseContextEnum } from '../../../shared-penscare/enums/pensioncase-context-enum';
import { PensionLedgerService } from '../../services/pension-ledger.service';
import { CorrectiveEntryListDataSource } from './corrective-entry-list-datasource';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EntryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/entry-type-enum';
import { ScheduleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/schedule-type-enum';
import { EntryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/entry-status-enum';
import { CorrectiveEntry } from 'projects/shared-components-lib/src/lib/models/corrective-entry.model';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { CorrectiveEntryNotification } from 'projects/shared-components-lib/src/lib/models/corrective-entry-notification.model';
import 'src/app/shared/extensions/string.extensions';

class ComponentInputData {
  pensionCaseContext: PensionCaseContextEnum;
  id: number;
  pensionLedger?: PensionLedger;
}

@Component({
  selector: 'app-corrective-entry-list',
  templateUrl: './corrective-entry-list.component.html',
  styleUrls: ['./../../../styles/penscare.css','./corrective-entry-list.component.css'],
  providers: [CorrectiveEntryListDataSource]
})
export class CorrectiveEntryListComponent implements OnInit {
  @Input() componentInputData: ComponentInputData;
  @ViewChild('editTypeInput', { static: true }) editTypeInput: ElementRef;
  entryType = EntryTypeEnum;
  scheduleType = ScheduleTypeEnum;
  entryStatus = EntryStatusEnum;
  pensionCaseContext = PensionCaseContextEnum;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('searchField', { static: false }) filter: ElementRef;
  form: UntypedFormGroup;


  currentQuery: string;
  elementKeyUp: Subscription;
  canEdit = false;
  menus: { title: string, action: string, disable: boolean}[];

  displayedColumns = [
    'pensionCaseNumber',
    'entryType',
    'scheduleType',
    'recipient',
    'beneficiary',
    'amount',
    'entryDate',
    'entryStatus'
  ];
  creatingWizard: boolean;

  get isLoading(): boolean { return this.dataSource.isLoading; }
  get isError(): boolean { return this.dataSource.isError; }

  constructor(
    public readonly dataSource: CorrectiveEntryListDataSource,
    private readonly pensionLedgerService: PensionLedgerService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private wizardService: WizardService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private readonly router: Router) {
  }

  ngOnInit(): void {
    this.createForm();
    this.activatedRoute.params.subscribe(
			(params: any) => {
				if (params.pensionLedgerId) {
					this.componentInputData = new ComponentInputData()
          this.componentInputData['pensionCaseContext'] = PensionCaseContextEnum.PensionCaseCorrectiveEntries; // Gerald
          this.componentInputData['id'] = params.pensionLedgerId;
				}
			}
		);
  }


  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();

    this.search(true);
  }

  loadData() {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.componentInputData.pensionCaseContext, this.componentInputData.id);
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  search(isInitialLoad?: boolean): void {
    this.paginator.pageIndex = 0;
    if (this.form.valid) {
        this.currentQuery = this.readForm();
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery, this.componentInputData.pensionCaseContext, this.componentInputData.id);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5 , 'PensionCaseNumber', '', '',  this.componentInputData.pensionCaseContext, this.componentInputData.id);
    }
  }

  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  editCorrectiveEntry(correctiveEntry: CorrectiveEntry) {
    const correctiveEntryNotification: CorrectiveEntryNotification = {
      action: 'edit',
      correctiveEntry
    }
    this.startWizard(correctiveEntryNotification);
  }

  addCorrectiveEntry() {
    if (!this.componentInputData.pensionLedger) {
      this.creatingWizard = true;
      this.pensionLedgerService.getPensionLedgerById(this.componentInputData.id).subscribe(
        response => {
          this.startWizard(this.createNotification('add', response));
        }
      )
    } else {
      this.startWizard(this.createNotification('add', this.componentInputData.pensionLedger));
    }
  }

  createNotification(action: string, pensionLedger: PensionLedger): CorrectiveEntryNotification {
    const correctiveEntryNotification: CorrectiveEntryNotification = {
      action: action,
      ledger: pensionLedger
    }
    return correctiveEntryNotification;
  }


  startWizard(data: CorrectiveEntryNotification) {
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'corrective-entry';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.creatingWizard = false;
      this.alertService.success(String.capitalizeFirstLetter(data.action) + ' corrective entry wizard started successfully');
      this.router.navigateByUrl(`/penscare/pensioncase-manager/corrective-entry/continue/${result.id}`);
    });
  }
}
