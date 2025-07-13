import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { CachedRolePlayerModel } from './model/cached-role-player-model';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

@Component({
  selector: 'role-player-display-name',
  templateUrl: './role-player-display-name.component.html',
  styleUrls: ['./role-player-display-name.component.css']
})
export class RolePlayerDisplayNameComponent extends UnSubscribe implements OnChanges {

  @Input() rolePlayerId: number;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  rolePlayer: CachedRolePlayerModel;
  message: string;

  constructor(
    private readonly rolePlayerService: RolePlayerService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.getRolePlayerWithCache();
    } else {
      this.message = 'N/A';
      this.isLoading$.next(false);
    }
  }

  getRolePlayerWithCache(): void {
    this.isLoading$.next(true);
    this.message = null;

    const cacheKey = `rolePlayer_${this.rolePlayerId}`;
    const cachedEncrypted = sessionStorage.getItem(cacheKey);

    if (cachedEncrypted) {
      try {
        const decrypted = EncryptionUtility.decryptData(cachedEncrypted);
        this.rolePlayer = JSON.parse(decrypted);
      } catch (error) {
        console.error('Error decrypting cached role player:', error);
        this.rolePlayer = null;
        this.message = 'N/A';
      }
      this.isLoading$.next(false);
    } else {
      this.fetchRolePlayerAndCache(cacheKey);
    }
  }

  private fetchRolePlayerAndCache(cacheKey: string): void {
    this.rolePlayerService.getRolePlayer(this.rolePlayerId).subscribe(
      (result: RolePlayer) => {
        if (result) {
          this.rolePlayer = new CachedRolePlayerModel();
          this.rolePlayer.displayName = result.displayName;
          this.rolePlayer.finPayeNumber = result.finPayee?.finPayeNumber ?? null;
          this.rolePlayer.idNumber = result.person?.idNumber ?? null;

          try {
            const encrypted = EncryptionUtility.encryptData(JSON.stringify(this.rolePlayer));
            sessionStorage.setItem(cacheKey, encrypted);
          } catch (encryptionError) {
            console.error('Failed to encrypt role player before caching:', encryptionError);
          }
        } else {
          this.message = 'N/A';
        }
        this.isLoading$.next(false);
      },
      (error) => {
        console.error('Error fetching role player:', error);
        this.message = 'N/A';
        this.isLoading$.next(false);
      }
    );
  }
}
