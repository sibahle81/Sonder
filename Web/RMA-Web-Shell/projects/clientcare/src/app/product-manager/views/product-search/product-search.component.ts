import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { ProductSearchDataSource } from '../../datasources/product-search.datasource';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { DialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { ToastrManager } from 'ng6-toastr-notifications';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';

@Component({
    templateUrl: './product-search.component.html',
    // tslint:disable-next-line: component-selector
    selector: 'product-search',
    styleUrls: ['./product-search.component.css']
})
export class ProductSearchComponent implements OnInit, AfterViewInit {
    form: UntypedFormGroup;
    displayedColumns = ['name', 'code', 'description', 'modifiedBy', 'modifiedDate', 'productStatusText', 'actions'];
    currentQuery: string;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;
    dataSource: ProductSearchDataSource;

    constructor(
        public readonly productService: ProductService,
        private readonly router: Router,
        private readonly appEventsManager: AppEventsManager,
        private readonly wizardService: WizardService,
        private readonly alertService: ToastrManager,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.dataSource = new ProductSearchDataSource(this.productService);
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
    }

    onSelect(item: Product): void {
        this.router.navigate(['clientcare/product-manager/product-details', item.id]);
    }

    onSelectReport(item: Product): void {
        this.router.navigate(['clientcare/product-manager/product-report', item.id]);
    }

    search() {
        this.paginator.pageIndex = 0;
        this.loadData();
    }

    loadData(): void {
        this.currentQuery = this.filter.nativeElement.value;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
    }

    addProduct(): void {
        const question = `Are you sure you want to start a new product wizard?`;
        const hideCloseBtn = true;
        const dialogRef = this.dialog.open(DialogComponent, {
            width: '500px',
            data: { question, hideCloseBtn }
        });

        dialogRef.afterClosed().subscribe(response => {
            if (response !== null) {
                this.appEventsManager.loadingStart('Please wait..');
                this.startWizard();
            }
        });
    }

    startWizard() {
        const startWizardRequest = new StartWizardRequest();
        startWizardRequest.type = 'product';
        this.wizardService.startWizard(startWizardRequest).subscribe(result => {
            this.alertService.successToastr('Product wizard started successfully');
            this.router.navigate(['/clientcare/product-manager']);
        });
    }
}
