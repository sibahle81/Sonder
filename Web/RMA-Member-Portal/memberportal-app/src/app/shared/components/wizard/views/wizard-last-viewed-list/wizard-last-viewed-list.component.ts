import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ListComponent } from '../../../list-component/list.component';
import { Wizard } from '../../shared/models/wizard';
import { WizardLastViewedListDataSource } from './wizard-last-viewed-list.datasource';

@Component({
    templateUrl: './wizard-last-viewed-list.component.html',
    styleUrls: ['./wizard-last-viewed-list.component.css'],
    // tslint:disable-next-line:component-selector
    selector: 'wizard-last-viewed'
})
export class WizardLastViewedListComponent extends ListComponent {
    get isLoading(): boolean { return this.privateDataSource.isLoading; }

    constructor(
        alertService: AlertService,
        private readonly privateRouter: Router,
        private readonly privateDataSource: WizardLastViewedListDataSource) {
        super(alertService, privateRouter, privateDataSource, 'wizard-manager/wizard-details', 'Wizard', 'Wizards');
        this.hideAddButton = false;
    }

    setupDisplayColumns(): void {
        this.columns = [
            { columnDefinition: 'name', header: 'Name', cell: (row: Wizard) => `${row.name}` },
            { columnDefinition: 'currentStep', header: 'Current Step', cell: (row: Wizard) => `${row.currentStep}` },
            { columnDefinition: 'type', header: 'Type', cell: (row: Wizard) => `${row.type}` },
            { columnDefinition: 'wizardStatusText', header: 'Status', cell: (row: Wizard) => `${row.wizardStatusText}` }
        ];
    }

    onSelect(item: Wizard): void {
        Wizard.redirect(this.router, item.type, item.id);
    }

    onViewDetails(wizard: Wizard): void {
        this.privateRouter.navigate(['wizard-manager/wizard-details', wizard.id]);
    }
}
