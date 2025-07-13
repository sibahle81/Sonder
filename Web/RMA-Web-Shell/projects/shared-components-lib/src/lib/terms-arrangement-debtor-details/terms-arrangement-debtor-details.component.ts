import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { UntypedFormBuilder, UntypedFormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { RolePlayerService } from "projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service";
import { RolePlayer } from "projects/clientcare/src/app/policy-manager/shared/entities/roleplayer";
import { TermArrangement } from "projects/fincare/src/app/billing-manager/models/term-arrangement";
import { TermScheduleComponent } from "projects/fincare/src/app/billing-manager/views/terms-arrangement/term-schedule/term-schedule.component";
import { FinPayee } from "projects/fincare/src/app/shared/models/finpayee";
import { TermArrangementService } from "projects/fincare/src/app/shared/services/term-arrangement.service";
import { DocumentSetEnum } from "projects/shared-models-lib/src/lib/enums/document-set.enum";
import { TermArrangementStatusEnum } from "projects/shared-models-lib/src/lib/enums/term-arrangement-status";
import { LookupService } from "projects/shared-services-lib/src/lib/services/lookup/lookup.service";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "terms-arrangement-debtor-details",
  templateUrl: "./terms-arrangement-debtor-details.component.html",
  styleUrls: ["./terms-arrangement-debtor-details.component.css"],
})
export class TermsArrangementDebtorDetailsComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() rolePlayer: RolePlayer;

  debtor: FinPayee;
  form: UntypedFormGroup;
  menus: {title: string, action: string, disable: boolean}[];
  ssrsBaseUrl: string;
  debtorTermArrangements: TermArrangement[] = [];
  termStatuses: { id: number, name: string }[];
  termArrangementId: number;
  selectedTabIndex = 0;
  isLoadingTermArrangements$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  displayedColumns = ['startDate', 'endDate', 'termMonths', 'totalAmount', 'balance', 'createdDate', 'termStatus', 'active', 'actions'];
  datasource = new MatTableDataSource<TermArrangement>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  termArrangementDocumentSet = DocumentSetEnum.TermsArrangementDocuments;
  docuemntsTabIndex = 2;
  moaTabIndex = 1;
  termArrangementSupportingDocumentSet = DocumentSetEnum.TermsSupportingDocuments;
  constructor(
    private readonly termArrangementService: TermArrangementService,
    private readonly router: Router,
    private readonly memoOfAgreementDialog: MatDialog,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService
  ) {}

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getTermArrangement();
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({});
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
    })

    this.menus =  [
      { title: 'MOA', action: 'moa', disable: false },
      { title: 'Schedule', action: 'schedule', disable: false },
      { title: 'Documents', action: 'documents', disable: false },
    ];
  }

  getTermArrangement() {
    this.isLoadingTermArrangements$.next(true);
    this.termArrangementService.getTermArrangementsByRolePlayerId(this.rolePlayer.rolePlayerId)
      .subscribe(data => {
        if(data) {
          this.datasource.data = [...data];
          this.isLoadingTermArrangements$.next(false);
        } else {
          this.isLoadingTermArrangements$.next(false);
        }
      });
      this.termStatuses = this.ToKeyValuePair(TermArrangementStatusEnum);
  }

  onMenuItemClick(item: TermArrangement, menu: any): void {
    switch (menu.action) {
      case 'moa':
        this.onMOASelected(item);
        break;
      case 'schedule':
        this.openTermScheduleDialog(item);
        break;
      case 'documents':
        this.onDocumentsSelected(item);
        break;
    }
  } 

  openTermScheduleDialog(item: TermArrangement) {
    this.memoOfAgreementDialog.open(TermScheduleComponent, {
      width: '800px', height: '800px',
      data: {
        termschedule: [...item.termArrangementSchedules]
      }
    });
  }

  onDocumentsSelected(item: TermArrangement) {
    this.termArrangementId = item.termArrangementId;
    this.selectedTabIndex = this.docuemntsTabIndex;
  }

  onMOASelected(item: TermArrangement) {
    this.ssrsBaseUrl = this.ssrsBaseUrl
    this.termArrangementService.termArrangementDetails$.next({ termArrangementId: item.termArrangementId, balance: item.balanceCarriedToNextCycle, year: new Date(item.endDate).getFullYear(), reportServerAudit: this.ssrsBaseUrl, bankaccountId:item.bankaccountId });
    this.selectedTabIndex = this.moaTabIndex;
  }

  getActiveStatus(status: boolean): string {
    if (status) {
      return 'True';
    }
    return 'False';
  }

  GetStatus(statusId: number): string {
    let status = 'Unknown';
    if (this.termStatuses.filter(c => c.id == statusId)[0].name) {
      status = this.formatLookup(this.termStatuses.filter(c => c.id == statusId)[0].name)
    }
    return status;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  back() {
    this.router.navigateByUrl("member/member-manager/home");
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }
}
