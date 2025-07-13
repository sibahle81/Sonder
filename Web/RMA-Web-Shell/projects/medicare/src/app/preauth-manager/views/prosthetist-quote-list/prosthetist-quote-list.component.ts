import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { InvoiceDetails } from '../../../medical-invoice-manager/models/medical-invoice-details';
import { MedicalInvoiceSearchCriteria } from '../../../medical-invoice-manager/models/medical-invoice-search-criteria';
import { MedicareMedicalInvoiceCommonService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-common.service';
import { MedicareMedicalInvoiceSwitchBatchService } from '../../../medical-invoice-manager/services/medicare-medical-invoice-switch-batch.service';
import { MedicalInvoiceService } from '../../../medical-invoice-manager/services/medicare-medical-invoice.service';
import { ProsthetistQuoteListDatasource } from '../../../medi-manager/datasources/prosthetist-quote-list-datasource';
import { MediCarePreAuthService } from '../../services/medicare-preauth.service';
import { ProsthetistQuote } from '../../models/prosthetistquote';
import { ProstheticQuoteStatusEnum } from '../../../medi-manager/enums/prosthetic-quote-status-enum';
import { ProstheticQuotationTypeEnum } from '../../../medi-manager/enums/prosthetic-quotation-type-enum';
import { ProstheticTypeEnum } from '../../../medi-manager/enums/prosthetic-type-enum';
import { SelectionModel } from '@angular/cdk/collections';
import { MedicareUtilities } from '../../../shared/medicare-utilities';
import { PreauthTypeEnum } from '../../../medi-manager/enums/preauth-type-enum';


@Component({
  selector: 'app-prosthetist-quote-list',
  templateUrl: './prosthetist-quote-list.component.html',
  styleUrls: ['./prosthetist-quote-list.component.css']
})
export class ProsthetistQuoteListComponent implements OnInit {

  @Input() isCaptureMode: boolean = false;//determines whether comp is use for preauth capture or only as table display
  @Output() isProstheticQuoteLinkedEvent = new EventEmitter<ProsthetistQuote>();
  @Output() isProstheticQuoteSelectedEvent = new EventEmitter<ProsthetistQuote>();
  @Input() PreAuthIdLinkedToQuote: number = 0;
  @Input() claimId: number = 0;
  isViewInvoice: boolean;
  isShowInvoices: boolean;
  authType: string;

  navigating = false;
  @Input() personEventId = 0;
  @Input() searchByHealthCareProvider = false;
  isExternalUser: boolean = false;

  constructor(private medicalInvoiceService: MedicalInvoiceService,
    private medicareMedicalInvoiceCommonService: MedicareMedicalInvoiceCommonService,
    private readonly mediCarePreAuthService: MediCarePreAuthService,
    private medicareMedicalInvoiceSwitchBatchService: MedicareMedicalInvoiceSwitchBatchService,
    private router: Router,
    activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly wizardService: WizardService,
    readonly confirmservice: ConfirmationDialogsService,
    private readonly alertService: AlertService,
    public dialog: MatDialog,
    private readonly confirmService: ConfirmationDialogsService) {

  }

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource: ProsthetistQuoteListDatasource;
  pageSize: number = 5;
  pageIndex: number = 0;
  orderBy: string = "prosthetistQuoteId";
  sortDirection: string = "desc";
  searchParams = new ProsthetistQuote();

  @Output() onSortPagingSearchedInvoiceTable: EventEmitter<[string, string, number, number]> = new EventEmitter();
  @Input() medicalInvoiceDetailsListSearchCrateria: InvoiceDetails[] = [];
  @Input() previousUrl: string;//for navigation between screens
  @Input() previousSearchParams: MedicalInvoiceSearchCriteria;//search screen search params
  prostheticQuoteStatusEnum: typeof ProstheticQuoteStatusEnum = ProstheticQuoteStatusEnum;
  prostheticQuotationTypeEnum: typeof ProstheticQuotationTypeEnum = ProstheticQuotationTypeEnum;
  prostheticTypeEnum: typeof ProstheticTypeEnum = ProstheticTypeEnum;

  loading$ = new BehaviorSubject<boolean>(false);
  processing$ = new BehaviorSubject<boolean>(false);
  currentUrl = this.router.url;

  selection = new SelectionModel<ProsthetistQuote>(false, []);
  selectedItem = <ProsthetistQuote>{};
  selectItem(row: ProsthetistQuote) {
    this.selection.toggle(row);
    this.selectedItem = row;
    this.isProstheticQuoteSelectedEmitter(this.selectedItem)
  }

  radioLabel(row?: ProsthetistQuote): string {
    return 'select';
  }

  isProstheticQuoteSelectedEmitter(value: ProsthetistQuote) {
    this.isProstheticQuoteSelectedEvent.emit(value)
  }

  isProstheticQuoteLinkedEmitter(result:ProsthetistQuote) {
    this.isProstheticQuoteLinkedEvent.emit(result)
  }

  columnDefinitions = []

  getDisplayedColumns(): string[] {
    return this.columnDefinitions.filter(cd => cd.visible).map(cd => cd.def);
  }

  menus: { title: string; url: string; disable: boolean }[];

  filterMenu(item: ProsthetistQuote) {
    this.menus = [];
    this.menus = [
      { title: 'View', url: '', disable: false },
      {
        title: 'Edit', url: '',
        disable: true //will be fully implemented later
      }
    ];

  }

  onMenuItemClick(quote: ProsthetistQuote, menu: any): void {
    switch (menu.title) {
      case 'View':
        this.onViewSelectedProsthetistQuote(quote)
        break;
      case 'Edit':
        this.onEditSelectedProsthetistQuote(quote);
        break;
    }

  }

  ngOnInit() {
    this.authType = MedicareUtilities.getPreauthTypeName(this.currentUrl);
    this.isExternalUser = !this.authService.getCurrentUser().isInternalUser
    this.dataSource = new ProsthetistQuoteListDatasource(this.mediCarePreAuthService);

    this.previousUrl = this.currentUrl;

    this.searchParams.createdBy = this.authService.getCurrentUser().email;
    this.searchParams.rolePlayerId = this.authService.getCurrentUser().id;
    this.searchParams.isInternalUser = this.authService.getCurrentUser().isInternalUser;
    this.searchParams.preAuthId = this.PreAuthIdLinkedToQuote;
    this.searchParams.claimId = this.claimId;
    this.dataSource.getDataSubject.subscribe(results => {
      if(results?.length> 0){
        this.isProstheticQuoteLinkedEmitter(results[0]);
      }

    });
    this.loadData()

    this.columnDefinitions = [//all comments below will be removed once functionality is fully implemented
    {
      def: "select", 
      label: "#", 
      visible: this.isCaptureMode
      //hide when wizard is false
    },
    {
      def: "preauthNumber",//preauthnumber by prosthetistQuoteId
      label: "PreauthNumber",
      visible: true
    },
    {
      def: "healthCareProviderName",//-HCPName by rolePlayerId
      label: "healthCareProviderName",
      visible: true
    },
    {
      def: "quotationAmount",
      label: "quotationAmount",
      visible: true
    },
    {
      def: "prostheticType",//ProsthetistType -- needs to be an enum - dispay discription
      label: "prostheticType",
      visible: true
    },
    {
      def: "reviewedDateTime",
      label: "reviewedDateTime",
      visible: true
    },
    {
      def: "signedBy",
      label: "signedBy",
      visible: true
    },
    {
      def: "isApproved",//isApproved & isAutoApproved
      label: "isApproved",
      visible: true
    },
    {
      def: "isSentForReview",
      label: "isSentForReview",
      visible: true
    },
    {
      def: "isRejected",
      label: "isRejected",
      visible: true
    },
    {
      def: "isRequestInfo",
      label: "isRequestInfo",
      visible: true
    },
    {
      def: "quotationStatus",//new field - based on enum- all quote statuses (approved,rejected)
      label: "quotationStatus",
      visible: true
    },
    {
      def: "actions",
      label: "actions",
      visible: !this.isCaptureMode
    }
  ];
  }


  loadData(): void {

    this.sortDirection = isNullOrUndefined(this.sort.direction) || this.sort.direction == "" ? "desc" : this.sort.direction;
    this.orderBy = isNullOrUndefined(this.sort.active) || this.sort.active == "" ? "prosthetistQuoteId" : this.sort.active;
    this.pageIndex = this.paginator.pageIndex;
    this.pageSize = this.paginator.pageSize > 0 ? this.paginator.pageSize : 5;

    this.dataSource.getData(this.pageIndex + 1, this.pageSize, this.orderBy, this.sortDirection, JSON.stringify(this.searchParams));

  }

  ngAfterViewInit(): void {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          tap(() => this.loadData())
        )
        .subscribe();
  }

  onViewSelectedProsthetistQuote(quote: ProsthetistQuote) {
    this.router.navigate(['/medicare/prosthetist-quote-view', quote.prosthetistQuoteId]);
  }

  refreshList() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  onEditSelectedProsthetistQuote(value) {
    //implimentation will come later
  }

}
