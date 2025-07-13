import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'src/app/shared-utilities/app-events-manager/app-events-manager';
import { Datasource } from 'src/app/shared-utilities/datasource/datasource';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Wizard } from '../../shared/models/wizard';
import { WizardService } from '../../shared/services/wizard.service';

@Injectable()
export class WizardLastViewedListDataSource extends Datasource {

  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService,
    private readonly wizardService: WizardService) {
    super(appEventsManager, alertService);
  }

  getData() {
    this.isLoading = true;

    this.wizardService.getLastViewedWizards().subscribe(
      data => {
        this.dataChange.next(data);
        this.isLoading = false;
      });
  }

  connect(): Observable<Wizard[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice().filter(
        (item: Wizard) => {
          if (item && item.name) {
            const searchStr = (item.name + item.modifiedBy + item.type).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          }
        }
      );

      const sortedData = this.getSortedData(this.filteredData.slice());
      return sortedData;
    }));
  }
}
