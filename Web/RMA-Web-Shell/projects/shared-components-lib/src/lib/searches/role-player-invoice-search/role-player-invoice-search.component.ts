import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Invoice } from 'projects/fincare/src/app/shared/models/invoice';
import { RolePlayerInvoiceSearchDataSource } from './role-player-invoice-search.datasource';
import { InvoiceService } from 'projects/fincare/src/app/shared/services/invoice.service';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
    selector: 'role-player-invoice-search',
    templateUrl: './role-player-invoice-search.component.html',
    styleUrls: ['./role-player-invoice-search.component.css']
})

export class RolePlayerInvoiceSearchComponent extends PermissionHelper implements OnInit, OnChanges {

    @Input() rolePlayer: RolePlayer;

    @Input() isReadOnly: boolean;
    @Input() invoiceStatusFilter: InvoiceStatusEnum;
    @Input() triggerReset: boolean;

    @Output() invoiceSelectedEmit = new EventEmitter<Invoice>();
    @Output() invoicesEmit = new EventEmitter<Invoice[]>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: RolePlayerInvoiceSearchDataSource;
    selectedInvoice: Invoice;

    constructor(
        private readonly invoiceService: InvoiceService
    ) {
        super();
        this.dataSource = new RolePlayerInvoiceSearchDataSource(this.invoiceService);
    }

    ngOnInit() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.rolePlayer) {
            this.dataSource.rolePlayerId = this.rolePlayer.rolePlayerId;
            this.dataSource.invoiceStatusFilter = this.invoiceStatusFilter;

            this.getData();
        }
    }

    getData() {
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, '');
    }

    invoiceSelected(invoice: Invoice) {
        this.selectedInvoice = invoice;
        this.invoiceSelectedEmit.emit(this.selectedInvoice);
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'invoiceNumber', show: true },
            { def: 'policyId', show: true },
            { def: 'invoiceDate', show: true },
            { def: 'amount', show: true },
            { def: 'balance', show: true },
            { def: 'invoiceStatus', show: true },
            { def: 'actions', show: !this.isReadOnly }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }

    getInvoiceStatus(invoiceStatus: InvoiceStatusEnum) {
        return this.formatLookup(InvoiceStatusEnum[invoiceStatus]);
    }

    getOutstandingInvoices() {
        this.invoiceService
    }
}
