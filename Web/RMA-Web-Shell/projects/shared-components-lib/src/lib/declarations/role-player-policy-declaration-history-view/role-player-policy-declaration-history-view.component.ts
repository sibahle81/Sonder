import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';

@Component({
  selector: 'role-player-policy-declaration-history-view',
  templateUrl: './role-player-policy-declaration-history-view.component.html',
  styleUrls: ['./role-player-policy-declaration-history-view.component.css']
})
export class RolePlayerPolicyDeclarationHistoryViewComponent implements OnChanges {

  @Input() policy: Policy;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  _policy: Policy; // deep copy as not to affect existing functionality

  constructor(
    private readonly declarationService: DeclarationService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading$.next(true);
    this._policy = null;
    
    if (this.policy) {
      this.getAllRolePlayerPolicyDeclarations();
    }
  }

  getAllRolePlayerPolicyDeclarations() {
    this.declarationService.getAllRolePlayerPolicyDeclarations(this.policy).subscribe(result => {
      if (result) {
        this._policy = result;
      }
      this.isLoading$.next(false);
    });
  }
}
