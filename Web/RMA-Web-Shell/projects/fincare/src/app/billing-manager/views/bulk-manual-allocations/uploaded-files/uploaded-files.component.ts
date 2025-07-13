import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { BehaviorSubject } from 'rxjs';
import { CollectionsService } from '../../../services/collections.service';
import { UploadedFilesDatasource } from './uploaded-files.datasource';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Industry } from 'projects/clientcare/src/app/client-manager/shared/Entities/industry';
import { InterBankTransferService } from '../../../services/interbanktransfer.service';
import { RmaBankAccount } from '../../../models/rmaBankAccount';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { AllocatedFilesRequest } from 'projects/fincare/src/app/shared/models/allocation-files-request';
import { isThisHour } from 'date-fns';

@Component({
  selector: 'app-uploaded-files',
  templateUrl: './uploaded-files.component.html',
  styleUrls: ['./uploaded-files.component.css']
})
export class UploadedFilesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  searchText: string;
  noData = false;
  placeHolder = 'Search by filename';
  isLoading$ = new BehaviorSubject<boolean>(false);
  industries: Lookup[] = [];
  loadingIndustries = true;
  loadingProducts = true;
  maxDate: Date;
  isLoading = false;
  rmaBankAccounts: RmaBankAccount[];
  selectedBankAccountId: number;
  selectedBankAccount: RmaBankAccount;

  displayedColumns: string[] = ['fileName', 'totalLines', 'totalExceptions', 'createdBy', 'createdDate', 'actions'];
  products: Product[] = [];
  productLookup: Lookup[] = [];
  startDate: Date;
  endDate: Date;
  form: FormGroup;
  productCategories : ProductCategoryTypeEnum[];

  constructor(private readonly collectionService: CollectionsService,
    private router: Router,
    private alert: ToastrManager,
    public datasource: UploadedFilesDatasource,
    private readonly lookupService: LookupService,
    private toastr: ToastrManager,
    private readonly productService: ProductService,
    private formBuilder: FormBuilder,
    private readonly interBankTransferService: InterBankTransferService,
  ) { }


  createForm() {
    this.form = this.formBuilder.group({
      startDate: [],
      endDate: []
    });
  }

  ngOnInit(): void {
    this.createForm();
    this.datasource = new UploadedFilesDatasource(this.collectionService);  
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.datasource.rowCount$.subscribe(count => this.paginator.length = count);   
    this.productCategories = this.ToKeyValuePair(ProductCategoryTypeEnum);    
  }  

  loadData(searchRequest: AllocatedFilesRequest): void {
    this.datasource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      searchRequest
    );
  }

  viewFileDetails(id: number) {
    this.router.navigate([`fincare/billing-manager/bulk-file-details/${id}`]);
  }

  back() {
    this.router.navigate(['fincare/billing-manager/']);
  }

  reset() {
    this.form.reset();
  }  

  startDateChange(value: Date) {
    this.startDate = new Date(value);
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
  }  

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }

  getData(){
    const values = this.form.value;
   const searchRequest: AllocatedFilesRequest= {
    startDate: new Date(this.startDate) ,
    endDate: new Date(this.endDate)
   }; 
    this.datasource.getData(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      searchRequest
    );
  }
}
