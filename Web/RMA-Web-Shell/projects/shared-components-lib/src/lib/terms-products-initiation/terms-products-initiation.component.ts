import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { RolePlayer } from "projects/clientcare/src/app/policy-manager/shared/entities/roleplayer";
import { Product } from "projects/clientcare/src/app/product-manager/models/product";
import { ProductOption } from "projects/clientcare/src/app/product-manager/models/product-option";
import { ProductOptionService } from "projects/clientcare/src/app/product-manager/services/product-option.service";
import { ProductService } from "projects/clientcare/src/app/product-manager/services/product.service";
import { DebtorProductBalance } from "projects/fincare/src/app/billing-manager/models/debtor-product-balance";
import { TermArrangementService } from "projects/fincare/src/app/shared/services/term-arrangement.service";
import { ProductClassEnum } from "projects/shared-models-lib/src/lib/enums/product-class-enum";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "terms-products-initiation",
  templateUrl: "./terms-products-initiation.component.html",
  styleUrls: ["./terms-products-initiation.component.css"],
})
export class TermsProductsInitiationComponent implements OnInit {
  @Input() rolePlayer: RolePlayer;

  message: string;
  showMessage: boolean;
  products: Product[];
  termsProductOptions: ProductOption[];

  displayedColumns = ["productName", "amount"];
  isLoadingPolicies$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  datasource = new MatTableDataSource<DebtorProductBalance>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  hasZeroBalance = false;
  productsSearched = false;

  constructor(
    private readonly termArrangementService: TermArrangementService,
    private readonly productOptionService: ProductOptionService,
    private readonly productService: ProductService,
  ) {}

  ngOnInit(): void {
    if(this.rolePlayer) {
      this.getDebtorPolicies();
    }
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getDebtorPolicies() {
    this.message = "";
    this.isLoadingPolicies$.next(true);
    this.termArrangementService
      .getDebtorTermProductBalances(this.rolePlayer.rolePlayerId, 0)
      .pipe(
        map((data) => {
          if (data.length > 0) {
            this.datasource.data = [...data];
            const total = this.datasource.data
              .reduce((a, b) => a + b.balance, 0)
              .toFixed(2);
            if (+total === 0) {
              this.productsSearched = true;
              this.hasZeroBalance = true;
            } else {
              this.hasZeroBalance = false;
            }
          } else {
            this.message = "No none funeral policies found for debtor";
          }
          this.isLoadingPolicies$.next(false);
        })
      )
      .subscribe();
  }

  getProductsForTerms() {
    const productClassIds = this.getEnumValues(ProductClassEnum).filter(pc => pc === +ProductClassEnum.Assistance || pc === +ProductClassEnum.Life).join(',');
    if (productClassIds.length > 0) {
      this.productService.getProductsExcludingCertainClasses(productClassIds).subscribe(data => {
        this.products = [...data];
        this.getProductOptionsForTerms(this.products);
      });
    }
  }

  getProductOptionsForTerms(products: Product[]) {
    const productClassIds = products.map(p => p.id).join(',');
    if (productClassIds.length > 0) {
      this.productOptionService.getProductOptionsByProductIds(productClassIds).subscribe(data => {
        this.termsProductOptions = [...data];
      });
    }
  }

  getEnumValues(enums: any): number[] {
    const results = [];
    const keys = Object.values(enums)
      .filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push(key);
      }
    }
    return results;
  }

  getProductTotals(): number {
    const total = this.datasource.data.reduce((a, b) => a + b.balance, 0).toFixed(2);   
    return +total;
  }
}
