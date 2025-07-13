import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ToastrManager } from 'ng6-toastr-notifications';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { Person } from 'projects/shared-components-lib/src/lib/models/person.model';
import { CertificateOfLifeStatusEnum } from 'projects/shared-models-lib/src/lib/enums/certificate-of-life-status-enum';
import { PensionLedgerStatusEnum } from 'projects/shared-models-lib/src/lib/enums/pension-ledger-status.enum';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { PensionLedgerService } from '../../../pensioncase-manager/services/pension-ledger.service';
import { PensionCaseContextEnum } from '../../../shared-penscare/enums/pensioncase-context-enum';
import { CertificateOfLifeDetail } from '../../../shared-penscare/models/certificate-of-life-detail';
import { CertificateOfLifeListDataSource } from './certificate-of-life-list-datasource';

@Component({
  selector: 'app-certificate-of-life-list',
  templateUrl: './certificate-of-life-list.component.html',
  styleUrls: ['./certificate-of-life-list.component.css', './../../../styles/penscare.css'],
  providers: [CertificateOfLifeListDataSource]
})
export class CertificateOfLifeListComponent implements OnInit {

  @ViewChild('searchField', { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  elementKeyUp: Subscription;
  form: UntypedFormGroup;
  currentQuery: string;
  creatingWizard = false;

  pensionCaseContext = PensionCaseContextEnum;

  idType = IdTypeEnum;

  pensionLedgerStatus = PensionLedgerStatusEnum;

  certificateOfLifeStatus = CertificateOfLifeStatusEnum;

  pensionCaseContextInput = PensionCaseContextEnum;

  menus: { title: string, action: string, disable: boolean}[];
  displayedColumns = [
    'pensionCaseNumber',
    'industryNumber',
    'name',
    'surname',
    'benefitCode',
    'status',
    'dateOfBirth',
    'idNumber',
    'passportNumber',
    'pensionLedgerStatus',
    'processedDate',
    'actions'
  ];
  selectedCertificateOfLife: CertificateOfLifeDetail;
  editMode: boolean;
  creatingFile = false;
  certificateOfLife: any;
  constructor(
    public readonly dataSource: CertificateOfLifeListDataSource,
    private readonly pensionLedgerService: PensionLedgerService,
    private formBuilder: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
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

  onSelect(col: CertificateOfLifeDetail) {
  }

  loadData(): void {
    this.currentQuery = this.filter.nativeElement.value;
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }


  createForm(): void {
    if (this.form) { return; }
    this.form = this.formBuilder.group({ query: new UntypedFormControl('', [Validators.minLength(3), Validators.required]) });
  }

  search(isInitialLoad?: boolean): void {
    if (this.form.valid) {
        this.currentQuery = this.readForm();
        this.dataSource.getData(1, 5 , 'desc', '', this.currentQuery);
    }

    if (isInitialLoad) {
      this.dataSource.getData(1, 5 , 'desc', '', '');
    }
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query as string;
  }

  filterMenu(item: CertificateOfLifeDetail) {
    this.menus = null;
    this.menus =
      [
        { title: 'View Pension Case', action: 'view', disable: false },
        { title: 'Edit', action: 'edit', disable: false }
      ];
  }

  onMenuItemClick(item: CertificateOfLifeDetail, menu: any): void {
    switch (menu.action) {
      case 'view':
        this.router.navigate(['penscare/view-pensioncase/', item.pensionCaseId]);
        break;
      case 'edit':
        this.selectedCertificateOfLife = item;
        this.editMode = true;
        break;
    }
  }

  onBackToSearch() {
    this.editMode = false;
  }

  exporttoCSV(): void {
    this.creatingFile = true;
    this.pensionLedgerService.getProofOfLifeList().subscribe(
      response => {
        this.creatingFile = false;
        const tebaFileData = response.map(item => {
          return {
            'PensionRefNo': item.pensionCaseNumber,
            'IndustryNo': item.industryNumber,
            'Names': item.name,
            'Surname'	: item.surname,
            'BenefitCode'	: item.benefitCode,
            'Status': CertificateOfLifeStatusEnum.NotReceived,
            'DateOfBirth': moment(item.dateOfBirth).format('M/DD/yyyy'),
            'IDNo': item.idType === IdTypeEnum.SA_ID_Document ? item.idNumber : '',
            'PassportNo': item.idType !== IdTypeEnum.SA_ID_Document ? item.idNumber : '',
            'PensionStatus': this.pensionLedgerStatus[item.ledgerStatusId],
            'ProcessedDate': moment(item.processedDate).format('DD/MM/yyyy')
          }
        })
        this.download(tebaFileData)
      }
    )
  }

  download(data) {
    const csvData = this.convertToCSV(data);
    const a = document.createElement('a');
    a.setAttribute('style', 'display:none;');
    document.body.appendChild(a);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    const x: Date = new Date();
    const link: string = 'TEBA' + '_' + x.getFullYear() + '-' + x.getMonth() + '-' + x.getDay() + '.csv';
    a.download = link.toLocaleLowerCase();
    a.click();
  }

  convertToCSV(objArray) {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';

    // tslint:disable-next-line:forin
    for (const index1 in objArray[0]) {
      row += index1 + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < array.length; i++) {
      let line = '';
      // tslint:disable-next-line:forin
      for (const index in array[i]) {
        if (line !== '') {
          line += ',';
        }

        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }
}

