import { Injectable } from '@angular/core';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { InsuredLife } from '../entities/insured-life';
import { Policy } from '../entities/policy';
import { Breadcrumb } from 'projects/shared-models-lib/src/lib/menu/breadcrumb';
import { PolicyService } from './policy.service';

@Injectable()
export class BreadcrumbPolicyService {

    constructor(
        private readonly appEventsManager: AppEventsManager,
        private readonly policyService: PolicyService) {
    }

    private createPolicyManagerBreadcrumb(): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = 'Policy Manager';
        breadcrumb.url = 'policy-manager';
        return breadcrumb;
    }

    private createPolicyBreadcrumb(policy: Policy): Breadcrumb {
        const breadcrumb = new Breadcrumb();
        breadcrumb.title = `Policy - ${policy.policyNumber}`;
        breadcrumb.url = `policy-manager/policy-details/${policy.policyId}`;
        return breadcrumb;
    }

    setBreadcrumb(title: string): void {
        const breadcrumbs = new Array<Breadcrumb>();
        breadcrumbs.push(this.createPolicyManagerBreadcrumb());

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadcrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadcrumbs);
    }

    setInsuredLifeBreadcrumb(title: string, policy: Policy): void {
        const breadcrumbs = new Array<Breadcrumb>();
        breadcrumbs.push(this.createPolicyManagerBreadcrumb());

        const policyBreadcrumb = this.createPolicyBreadcrumb(policy);
        breadcrumbs.push(policyBreadcrumb);

        const currentBreadcrumb = new Breadcrumb();
        currentBreadcrumb.title = title;
        breadcrumbs.push(currentBreadcrumb);

        this.appEventsManager.setBreadcrumb(breadcrumbs);
    }

    setBeneficiaryLifeBreadcrumb(title: string, insuredLife: InsuredLife, policyId: number, insuredLifeId: number): void {
        const breadcrumbs = new Array<Breadcrumb>();
        breadcrumbs.push(this.createPolicyManagerBreadcrumb());

        this.policyService.getPolicy(policyId).subscribe(policy => {
            const policyBreadcrumb = this.createPolicyBreadcrumb(policy);
            breadcrumbs.push(policyBreadcrumb);

            const insuredLifeBreadcrumb = new Breadcrumb();
            if (insuredLife) {
                insuredLifeBreadcrumb.title = `Insured Life - ${insuredLife.name} ${insuredLife.surname}`;
            } else {
                insuredLifeBreadcrumb.title = `Insured Life`;
            }

            insuredLifeBreadcrumb.url = `policy-manager/insured-life-details/edit/${insuredLifeId}`;
            breadcrumbs.push(insuredLifeBreadcrumb);

            const currentBreadcrumb = new Breadcrumb();
            currentBreadcrumb.title = title;
            breadcrumbs.push(currentBreadcrumb);

            this.appEventsManager.setBreadcrumb(breadcrumbs);
        });
    }
}
