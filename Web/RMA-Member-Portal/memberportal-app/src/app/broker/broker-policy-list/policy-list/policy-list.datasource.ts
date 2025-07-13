import { MemberPortalBrokerService } from "src/app/member/services/member-portal-broker-service";
import { PagedDataSource } from "src/app/shared-utilities/datasource/pagedDataSource";
import { Policy } from "src/app/shared/models/policy";
import { BehaviorSubject, of } from 'rxjs';


export class PolicyListDataSource extends PagedDataSource<Policy> {

    policies: Policy[] = [];
    havePolicies$ = new BehaviorSubject<boolean>(false);

    constructor(private readonly memberPortalBrokerService: MemberPortalBrokerService) {
        super();
    }

    getData(pageNumber: number = 1, pageSize: number = 5, orderBy: string = 'policyNumber', sortDirection: string = 'asc', query: string = '') {
        this.loadingSubject.next(true);

        this.memberPortalBrokerService.search(pageNumber, pageSize, orderBy, sortDirection, query).subscribe(result => {
            this.data = result
            this.policies = [];
            this.data.data.forEach(policy => {
                this.policies.push(policy)
            })
            this.havePolicies$.next(true);
            this.policies.push()
            this.dataSubject.next(this.data.data);
            this.rowCountSubject.next(this.data.rowCount);
            this.loadingSubject.next(false);
        });
    }
}