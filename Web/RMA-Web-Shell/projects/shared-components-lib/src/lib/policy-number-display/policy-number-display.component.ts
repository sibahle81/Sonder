import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { CachedPolicyModel } from './model/cached-policy-model';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

@Component({
  selector: 'policy-number-display',
  templateUrl: './policy-number-display.component.html',
  styleUrls: ['./policy-number-display.component.css']
})
export class PolicyNumberDisplayComponent extends UnSubscribe implements OnChanges {

  @Input() policyId: number;
  @Input() isReadOnly: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  policy: CachedPolicyModel;
  message: string;

  constructor(
    private readonly policyService: PolicyService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.policyId) {
      this.getPolicyWithCache();
    } else {
      this.message = 'N/A';
      this.isLoading$.next(false);
    }
  }

  getPolicyWithCache(): void {
    this.isLoading$.next(true);
    this.message = null;

    const cacheKey = `policy_${this.policyId}`;
    const cachedEncrypted = sessionStorage.getItem(cacheKey);

    if (cachedEncrypted) {
      try {
        const decrypted = EncryptionUtility.decryptData(cachedEncrypted);
        this.policy = JSON.parse(decrypted);
      } catch (error) {
        console.error('Error decrypting cached policy data', error);
        this.policy = null;
        this.message = 'N/A';
      }
      this.isLoading$.next(false);
    } else {
      this.fetchPolicyAndCache(cacheKey);
    }
  }

  private fetchPolicyAndCache(cacheKey: string): void {
    this.policyService.getPolicyWithProductOptionByPolicyId(this.policyId).subscribe(
      (result: Policy) => {
        if (result) {
          this.policy = new CachedPolicyModel();
          this.policy.policyOwnerId = result.policyOwnerId;
          this.policy.policyId = result.policyId;
          this.policy.policyNumber = result.policyNumber;
          this.policy.productOptionCode = result.productOption?.code ?? null;

          try {
            const encrypted = EncryptionUtility.encryptData(JSON.stringify(this.policy));
            sessionStorage.setItem(cacheKey, encrypted);
          } catch (encryptionError) {
            console.error('Failed to encrypt policy before caching:', encryptionError);
          }
        } else {
          this.message = this.policy?.policyNumber ?? 'N/A';
        }
        this.isLoading$.next(false);
      },
      (error) => {
        console.error('Error fetching policy:', error);
        this.message = this.policy?.policyNumber ?? 'N/A';
        this.isLoading$.next(false);
      }
    );
  }
}
