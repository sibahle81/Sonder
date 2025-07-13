import { BehaviorSubject } from 'rxjs';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { Representative } from 'projects/clientcare/src/app/broker-manager/models/representative';
import { RepresentativeService } from 'projects/clientcare/src/app/broker-manager/services/representative.service';
import { RepresentativeTypeEnum } from 'projects/shared-models-lib/src/lib/enums/representative-type-enum';

@Component({
  selector: 'member-representative',
  templateUrl: './member-representative.component.html',
  styleUrls: ['./member-representative.component.css']
})
export class MemberRepresentativeComponent extends PermissionHelper implements OnChanges {

  addPermission = 'Add Member';
  editPermission = 'Edit Member';
  viewPermission = 'View Member';
  viewAuditPermission = 'View Audits';

  @Input() member: RolePlayer;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  representative: Representative;
  showSearch: boolean;

  requiredPermission = 'Manage Member Representative';

  constructor(
    private readonly representativeService: RepresentativeService,
    private readonly memberService: MemberService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.member.accountExecutiveId) {
      this.getRepresentative();
    }
  }

  delete() {
    this.representative = null;
    this.member.representativeId = null;
    this.save();
  }

  toggle() {
    this.showSearch = !this.showSearch;
  }

  representativeSelected($event: Representative) {
    this.representative = $event;
    this.member.representativeId = this.representative.id;
    this.toggle();
    this.save();
  }

  getRepresentative() {
    this.isLoading$.next(true);
    if (this.member.representativeId) {
      this.representativeService.getRepresentative(this.member.representativeId).subscribe(result => {
        if (result) {
          this.representative = result;
        }
        this.isLoading$.next(false);
      });
    } else {
      this.isLoading$.next(false);
    }
  }

  save() {
    if (!this.isWizard) {
      this.isLoading$.next(true);
      this.memberService.updateMember(this.member).subscribe(() => {
        this.isLoading$.next(false);
      });
    }
  }

  getRepresentativeType(representativeType: RepresentativeTypeEnum) {
    return this.formatLookup(RepresentativeTypeEnum[representativeType]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
