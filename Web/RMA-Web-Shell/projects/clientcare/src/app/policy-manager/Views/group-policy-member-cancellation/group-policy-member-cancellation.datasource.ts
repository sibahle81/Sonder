import { Injectable } from '@angular/core';
import { PolicyInsuredLifeService } from '../../shared/Services/policy-insured-life.service';
import { PagedDataSource } from 'projects/shared-utilities-lib/src/lib/datasource/pagedDataSource';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { PolicyMember } from '../../shared/entities/policy-member';
import { IdTypeEnum } from '../../shared/enums/idTypeEnum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { of } from 'rxjs';
import { catchError, filter, finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GroupPolicyMemberCancellationDatasource extends PagedDataSource<PolicyMember> {

  public isLoading = false;

  constructor(
    private readonly insuredLifeService: PolicyInsuredLifeService
  ) {
    super();
  }

  getData(query: any) {
    this.isLoading = true;
    this.loadingSubject.next(true);
    if (query.filter.length === 0)
      query.filter = query.query;
    this.insuredLifeService.getInsuredLivesFiltered(query.status, query.filter, query.query, query.pageNumber, query.pageSize, query.orderBy, query.sortDirection).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      data => {        
        this.data = data as PagedRequestResult<PolicyMember>;
       this.data.data.forEach(
          member => {
            member.memberName = member.rolePlayer.displayName;
            member.idType = (IdTypeEnum[member.rolePlayer.person.idType]).replace(/_/g, ' ');
            member.idNumber = member.rolePlayer.person.idNumber || member.rolePlayer.person.passportNumber;
            member.rolePlayerType = (RolePlayerTypeEnum[member.rolePlayerTypeId]).replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
            member.memberStatus = (PolicyStatusEnum[member.insuredLifeStatus]).replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
            member.dateOfBirth = member.rolePlayer.person.dateOfBirth;
            member.age = member.rolePlayer.person.age;
            member.dateOfDeath = member.rolePlayer.person.dateOfDeath;
            member.isBeneficiary = member.rolePlayer.person.isBeneficiary;
            
          }
        );
        let approvalMode = query.readOnly;
        if (approvalMode)
        { 
          this.dataSubject.next(this.data.data.filter(d => d.policyStatusId === PolicyStatusEnum.RequestCancel));
          this.rowCountSubject.next(this.data.data.filter(d => d.policyStatusId === PolicyStatusEnum.RequestCancel).length);
        }
        else
        {
          this.dataSubject.next(this.data.data);
          this.rowCountSubject.next(this.data.rowCount);
        }
        
        this.isLoading = false;
      }
    );
  }
}
