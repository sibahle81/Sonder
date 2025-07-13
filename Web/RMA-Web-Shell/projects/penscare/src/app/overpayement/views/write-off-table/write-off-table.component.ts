import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OutstandingOverpayment, OverPaymentsWriteOff } from '../../models/overpayment';
import { OverPaymentService } from '../../services/overpayment.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { WriteOffDataSource } from '../../lib/writeoff-dataSource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { writeOffType } from '../../lib/enums/write-off-type-enum';

@Component({
  selector: 'app-write-off-table',
  templateUrl: './write-off-table.component.html',
  styleUrls: ['./write-off-table.component.css']
})
export class WriteOffTableComponent implements OnInit {

  @Input() pageMetaData: any;
  @Input() type: writeOffType;

  @ViewChild("searchField", { static: false }) filter: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Output() refreshDate = new EventEmitter();

  form: FormGroup;
  isLoading = false;
  currentQuery: string;
  private subscription: Subscription;
  startMin: Date;
  startMax: Date = new Date();
  endMin: Date;
  endMax: Date = new Date();

  writeOffAmt = 0;
  ITypes = writeOffType;



  constructor(private _fb: FormBuilder,
              public readonly dataSource: WriteOffDataSource,
              private _overpayService: OverPaymentService,
              private alertService: AlertService,
              private readonly datePipe: DatePipe,) { }

  ngOnInit(): void {
    this.createForm();
    this.addFormSubscriptions();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.rowCount$.subscribe((count) => (this.paginator.length = count));
    fromEvent(this.filter?.nativeElement, "keyup")
      .pipe(debounceTime(200), distinctUntilChanged(), tap(() => {
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
          }
    })).subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadData()))
      .subscribe();

    this.search(true);
  }

  createForm() {
    let startDate = new Date()
    this.form = this._fb.group({
        startDate: new FormControl(new Date(startDate.getFullYear(), 0,1), { validators: Validators.required }),
        endDate: new FormControl(new Date(), { validators: Validators.required }),
    });
  }

  addFormSubscriptions():void {

    this.form.get('startDate').valueChanges.subscribe(value => {
      this.endMin = new Date(value)
      this.search(false);
    });

    this.form.get('endDate').valueChanges.subscribe(value => {
      this.startMax = new Date(value);
      this.search(false);
    });
  }

  loadData(): void {
    this.dataSource.getWriteOffData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort?.active,
      this.sort?.direction,
      this.currentQuery,
      this.datePipe.transform(this.form.value.startDate, 'yyyy-MM-dd'),
      this.datePipe.transform(this.form.value.endDateDate, 'yyyy-MM-dd'),
      this.type
    );
  }

  readForm(): string {
    const formModel = this.form.value;
    return formModel.query;
  }

  search(isInitialLoad?: boolean): void {
    let sDate = this.datePipe.transform(this.form.value.startDate, 'yyyy-MM-dd'),
        eDate = this.datePipe.transform(this.form.value.endDate, 'yyyy-MM-dd')

    if (isInitialLoad || !this.currentQuery) {
      this.dataSource.getWriteOffData(1, 5, "desc", "", "", sDate, eDate, this.type);
    }
    else {
      this.currentQuery = this.readForm();
      this.dataSource.getWriteOffData(1, 5, "desc", "", "", sDate, eDate, this.type);
    }

    this.writeOffAmt = 0;
  }

  onMenuItemClick(item, menu) {
    if (menu['action'] == 'process') {
      const obj = new OverPaymentsWriteOff(item['outstandingOverpaymentId'], item['overpaymentBalanceAmount']);
      this._overpayService.writeOffOverPayment(obj).subscribe((res) => {
        if(res) {
          this.alertService.success('Overpayment has been successfully written off');
          this.search(false);
        }
      })
    }
  }

  onButtonClick() {
    console.log(this.dataSource)
    let arrObj: OverPaymentsWriteOff[] = []

    this.dataSource.data.data.forEach(item => {
      if (item['checkBox']) {
        const obj = new OverPaymentsWriteOff(item['outstandingOverpaymentId'], item['overpaymentBalanceAmount']);
        arrObj.push(obj)
      }
    });

    this._overpayService.writeOffOverPayments(arrObj).subscribe((res) => {
      if(res) {
        this.alertService.success('Overpayment has been successfully written off');
        this.search(false);
      }
    })

  }

  onCheckboxClick(data) {
    if(!data['checkBox'] ) {
      this.writeOffAmt += data['overpaymentBalanceAmount'];
    }
    else {
      this.writeOffAmt -= data['overpaymentBalanceAmount'];
    }
    data['checkBox'] != data['checkBox'];
  }

}
