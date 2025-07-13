import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { CachedUserModel } from './model/cached-user-model';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { EncryptionUtility } from 'projects/shared-utilities-lib/src/lib/encryption-utility/encryption-utility';

@Component({
  selector: 'user-display-name',
  templateUrl: './user-display-name.component.html',
  styleUrls: ['./user-display-name.component.css']
})
export class UserDisplayNameComponent extends UnSubscribe implements OnChanges {

  @Input() userId: number;
  @Input() userName: string;
  @Input() displayUserRole = false;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  user: CachedUserModel;
  currentUser: User;
  message: string;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userId || this.userName) {
      if (this.userName && !this.userName.includes('@')) {
        this.message = this.userName;
        this.isLoading$.next(false);
      } else if (this.currentUser.id === this.userId || this.currentUser.email === this.userName) {
        this.message = 'You';
        this.isLoading$.next(false);
      } else {
        this.getUserWithCache();
      }
    } else {
      this.message = 'N/A';
      this.isLoading$.next(false);
    }
  }

  getUserWithCache(): void {
    this.isLoading$.next(true);
    this.message = null;

    const cacheKey = this.userId ? `user_${this.userId}` : `user_${this.userName}`;
    const cachedEncrypted = sessionStorage.getItem(cacheKey);

    if (cachedEncrypted) {
      try {
        const decryptedJson = EncryptionUtility.decryptData(cachedEncrypted);
        this.user = JSON.parse(decryptedJson);
      } catch (error) {
        console.error('Error decrypting cached user data', error);
        this.user = null;
        this.message = this.userName || '-';
      }
      this.isLoading$.next(false);
    } else {
      this.fetchUserAndCache(cacheKey);
    }
  }

  private fetchUserAndCache(cacheKey: string): void {
    const userObservable = this.userId
      ? this.userService.getUser(this.userId)
      : this.userService.getUserDetails(this.userName);

    userObservable.subscribe(
      (result: User) => {
        if (result && result.id > 0) {
          this.user = new CachedUserModel();
          this.user.username = result.username;
          this.user.email = result.email;
          this.user.roleName = result.roleName ? result.roleName : 'N/A';
          this.user.displayName = result.displayName;

          try {
            const encrypted = EncryptionUtility.encryptData(JSON.stringify(this.user));
            sessionStorage.setItem(cacheKey, encrypted);
          } catch (encryptionError) {
            console.error('Failed to encrypt user before caching:', encryptionError);
          }
        } else {
          this.message = this.userName ? this.userName : '-';
        }
        this.isLoading$.next(false);
      },
      (error) => {
        console.error('Error fetching user', error);
        this.message = this.userName ? this.userName : '-';
        this.isLoading$.next(false);
      }
    );
  }
}
