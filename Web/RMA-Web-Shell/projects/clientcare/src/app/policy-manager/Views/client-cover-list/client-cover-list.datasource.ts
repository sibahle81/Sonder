import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { BenefitSetService } from '../../../product-manager/obsolete/benefit-set.service';
import { ProductOptionService } from '../../../product-manager/services/product-option.service';
import { ProductOptionCoverService } from '../../../product-manager/obsolete/product-option-cover.service';
import { ClientCover } from '../../shared/entities/client-cover';
import { BenefitSet } from '../../../product-manager/obsolete/benefit-set';
import { Product } from '../../../product-manager/models/product';
import { ProductOption } from '../../../product-manager/models/product-option';
import { ProductOptionCover } from '../../../product-manager/obsolete/product-option-cover';
import { ClientCoverView } from '../../shared/entities/client-cover-view';
import { ProductService } from '../../../product-manager/services/product.service';
import { map } from 'rxjs/operators';


@Injectable()
export class ClientCoverListDataSource extends Datasource {
    constructor(
        appEventsManager: AppEventsManager,
        alertService: AlertService,
        private readonly productService: ProductService,
        private readonly benefitSetService: BenefitSetService,
        private readonly productOptionService: ProductOptionService,
        private readonly productCoverOptionService: ProductOptionCoverService) {
        super(appEventsManager, alertService);
    }

    getData(clientCover: ClientCover[]): void {
        if (clientCover == null) { this.isLoading = false; return; }
        let coverIds = this.getIds(clientCover);
        this.benefitSetService.getBenefitSets().subscribe(benefitSets => {
            this.productService.getProducts().subscribe(products => {
                this.productOptionService.getProductOptions().subscribe(options => {
                    this.productCoverOptionService.getProductOptionCoverByIds(coverIds).subscribe(coverOptions => {
                        const resultantData =
                            this.combineData(clientCover, benefitSets, products, options, coverOptions);
                        this.dataChange.next(resultantData);
                        this.isLoading = false;
                    });
                });
            });
        }, error => this.showError(error));
    }

    getIds(clientCover: ClientCover[]): string {
        const options = new Array();
        clientCover.forEach(cc => {
            cc.clientCoverOptions.forEach(clientCoverOption => {
                    options.push(clientCoverOption);
                }
            );
        });

        return options.map(item => item.productOptionCoverId).join(',');
    }


    combineData(clientCovers: ClientCover[],
                benefitSets: BenefitSet[],
                products: Product[],
                productOptions: ProductOption[],
                productCoverOptions: ProductOptionCover[]): ClientCoverView[] {

        const view = new Array();

        clientCovers.forEach(clientCover => {
            if (clientCover.clientCoverOptions.length > 0) {
                clientCover.clientCoverOptions.forEach(clientCoverOption => {
                    const clientCoverView = new ClientCoverView();
                    const product = products.find(item => item.id === clientCover.productId);
                    const benefit = benefitSets.find(item => item.id === clientCover.benefitSetId);
                    const productOptionCover =
                        productCoverOptions.find(item => item.id === clientCoverOption.productOptionCoverId);
                    const productOption = productOptions.find(item => item.id === productOptionCover.productOptionId);


                    clientCoverView.productName = product.name;
                    clientCoverView.productCode = product.code;
                    clientCoverView.productDesc = product.description;
                    clientCoverView.productOptionName = productOption.name;
                    clientCoverView.benefitSetName = benefit ? benefit.description : '';
                    clientCoverView.premium = productOptionCover.premium.toString();
                    clientCoverView.numberOfEmployees = clientCoverOption.numberOfMembers.toString();
                    clientCoverView.productOptionCover = productOptionCover.name;
                    clientCoverView.productStatus = product.productStatusText;
                    view.push(clientCoverView);
                });

            } else {
                const clientCoverView = new ClientCoverView();
                const product = products.find(item => item.id === clientCover.productId);
                const benefit = benefitSets.find(item => item.id === clientCover.benefitSetId);

                clientCoverView.productCode = product.code;
                clientCoverView.productDesc = product.description;
                clientCoverView.productName = product.name;
                clientCoverView.benefitSetName = benefit ? benefit.description : '';
                // clientCoverView.premium = product.premium ? product.premium.toString() : 'n/a';
                clientCoverView.numberOfEmployees = clientCover.numberOfEmployees ? clientCover.numberOfEmployees.toString() : 'n/a';
                clientCoverView.productStatus = product.productStatusText;
                view.push(clientCoverView);
            }
        });

        return view;
    }

    connect(): Observable<ClientCoverView[]> {
        const displayDataChanges = [
            this.dataChange,
            this.sort.sortChange
        ];

        return merge(...displayDataChanges).pipe(map(() => {
            this.renderedData = this.getSortedData(this.data);
            return this.renderedData;
        }));
    }
}
