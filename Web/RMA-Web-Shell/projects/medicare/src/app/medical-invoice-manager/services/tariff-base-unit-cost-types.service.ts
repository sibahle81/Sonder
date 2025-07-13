import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { TariffBaseUnitCostType } from 'projects/medicare/src/app/medical-invoice-manager/models/tariff-base-unit-cost-type';


@Injectable({
  providedIn: 'root'
})
export class TariffBaseUnitCostTypesService {
  private apiUrlInvoice = 'med/api/TariffBaseUnitCostType';

  constructor(
    private readonly commonService: CommonService) {
  }

  GetTariffBaseUnitCostTypes(): Observable<TariffBaseUnitCostType> {
    return this.commonService.getAll<TariffBaseUnitCostType>(this.apiUrlInvoice + `/GetTariffBaseUnitCostTypes`);
  }

}



