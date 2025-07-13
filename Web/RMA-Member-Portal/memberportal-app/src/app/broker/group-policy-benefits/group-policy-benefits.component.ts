import { Component, OnInit, ViewChild, Input, AfterViewInit } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BehaviorSubject } from "rxjs";
import { BenefitTypeEnum } from "src/app/shared/enums/benefit-type-enum";
import { CoverMemberTypeEnum } from "src/app/shared/enums/cover-member-type-enum";
import { Benefit } from "src/app/shared/models/benefit";
import { Case } from "src/app/shared/models/case";
import { ProductOption } from "src/app/shared/models/product-option";
import { RolePlayer } from "src/app/shared/models/roleplayer";
import { ProductOptionService } from "src/app/shared/services/product-option.service";


@Component({
  selector: 'group-policy-benefits',
  templateUrl: './group-policy-benefits.component.html',
  styleUrls: ['./group-policy-benefits.component.css']
})
export class GroupPolicyBenefitsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  public dataSource = new MatTableDataSource<Benefit>();
  isLoading$ = new BehaviorSubject<boolean>(false);

  @Input() selectedProductOption: ProductOption;
  @Input() parentModel: Case;
  @Input() title: string;

  model: RolePlayer;

  displayedColumns = ['selected', 'benefitType', 'coverMemberType', 'code', 'name', 'benefitBaseRateLatest', 'benefitRateLatest'];
  results: Benefit[];

  constructor(
    private readonly productOptionService: ProductOptionService,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  populateForm(parentModel: Case) {
    this.parentModel = parentModel;
    if (this.parentModel) {
      if (this.parentModel.mainMember.policies) {
        this.model = this.parentModel.mainMember;
        if (this.model) {
          if (this.parentModel.mainMember.policies[0].productOption) {
            if (!this.selectedProductOption) {
              this.getData(this.parentModel.mainMember.policies[0].productOption);
            }
          }
        }
      }
    }
  }



  onSelectedOptionChanged(selectedProductOption: ProductOption): void {
    this.selectedProductOption = selectedProductOption;
    if (this.selectedProductOption) {
      this.getData(this.selectedProductOption);
    }
  }

  getData(productOption: any) {
    if (productOption && productOption.id) {
      this.isLoading$.next(true);

      if (this.results && this.results.length > 0) {
        this.results.forEach(element => {
          element.selected = false;
        });
        this.results = [];
      }

      this.productOptionService.getBenefitsForOption(productOption.id).subscribe(results => {
        this.results = results;
        this.results.forEach(element => {
          const benefitRate = element.benefitRates.find(br => br.benefitRateStatusText === 'Current');
          element.benefitBaseRateLatest = benefitRate ? benefitRate.baseRate : element.benefitBaseRateLatest;
          element.benefitRateLatest = benefitRate ? benefitRate.benefitAmount : element.benefitRateLatest;
          element.selected = true;
        });
        this.getDataSourceData(this.results);
        this.isLoading$.next(false);
      });
    }
  }

  getDataSourceData(benefits: Benefit[]) {
    this.dataSource.data = benefits;
  }


  getCoverMemberTypeDesc(id: number): string {
    let coverMemberType = CoverMemberTypeEnum[id];
    coverMemberType = coverMemberType.replace(/([A-Z])/g, ' $1').trim();
    return coverMemberType;
  }

  getBenefitTypeDesc(id: number): string {
    const benefitType = BenefitTypeEnum[id];
    return benefitType;
  }

  populateModel(): void {
    if (this.model) {
      if (this.parentModel.mainMember.policies.length > 0 && this.parentModel.mainMember.policies[0].benefits) {
        for (let x = this.parentModel.mainMember.policies[0].benefits.length - 1; x >= 0; x--) {
          if (this.parentModel.mainMember.policies[0].benefits[x]) {
            this.parentModel.mainMember.policies[0].benefits.splice(x, 1);
          }
        }
      } else {
        this.parentModel.mainMember.policies[0].benefits = [];
      }
      if (this.results) {
        for (let x = this.results.length - 1; x >= 0; x--) {
          this.parentModel.mainMember.policies[0].benefits.push(this.results[x]);
        }
      }
    }
  }

  clearBenefits(): void {
    this.results = [];
  }
}
