import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductOption } from '../../../product-manager/models/product-option';
import { BenefitTypeEnum } from 'projects/shared-models-lib/src/lib/enums/benefit-type-enum';
import { GroupPolicyBenefitsDataSource } from './group-policy-benefits.datasource';
import { Case } from '../../shared/entities/case';
import { CoverMemberTypeEnum } from 'projects/shared-models-lib/src/lib/enums/cover-member-type-enum';
import { Benefit } from '../../../product-manager/models/benefit';
import { RolePlayer } from '../../shared/entities/roleplayer';

@Component({
  selector: 'group-policy-benefits',
  templateUrl: './group-policy-benefits.component.html',
  styleUrls: ['./group-policy-benefits.component.css']
})
export class GroupPolicyBenefitsComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input() selectedProductOption: ProductOption;
  @Input() parentModel: Case;
  @Input() title: string;

  model: RolePlayer;

  displayedColumns = ['selected', 'benefitType', 'coverMemberType', 'code', 'name', 'benefitBaseRateLatest', 'benefitRateLatest'];
  results: Benefit[];

  constructor(
    private readonly productOptionService: ProductOptionService,
    public readonly dataSource: GroupPolicyBenefitsDataSource
  ) { }

  ngOnInit() {
    this.dataSource.setControls(this.paginator, this.sort);
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
      this.dataSource.isLoading = true;

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
        this.dataSource.getData(this.results);
        this.dataSource.isLoading = false;
      });
    }
  }

  getCoverMemberTypeDesc(id: number): string {
    let coverMemberType = CoverMemberTypeEnum[id];
    coverMemberType = coverMemberType.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
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
