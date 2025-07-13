// wiki: http://bit.ly/2B2EQcO
// Gets the menu data.

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { MenuGroup } from 'projects/shared-models-lib/src/lib/menu/menugroup';
import { MenuItem } from 'projects/shared-models-lib/src/lib/menu/menuitem';

/** @description Gets the menu data. */
@Injectable()
export class MenuService {
  private apiUrl = 'mdm/api/menu';

  constructor(
    private readonly commonService: CommonService) {
  }

  /** @description Get the menu data from the service. */
  getMenu(): Observable<MenuGroup[]> {
    return this.commonService.getAll(this.apiUrl);
  }

  /** @description Get the menu data from the service. */
  GetMenuGroups(): Observable<MenuGroup[]> {
    const svcResult = this.commonService.getAll<MenuGroup[]>(`${this.apiUrl}/GetMenuGroups`);
    return svcResult;
  }
}
