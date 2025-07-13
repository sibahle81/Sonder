import { LinkedUserMember } from 'projects/clientcare/src/app/policy-manager/shared/entities/linked-user-member';
import { Permission } from 'projects/shared-models-lib/src/lib/security/permission';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthcare-provider-model';
import { EncryptionUtility } from '../encryption-utility/encryption-utility';

export class userUtility {

  static hasPermission(permissionName: string): boolean {
    const permissionsString = EncryptionUtility.decryptData(sessionStorage.getItem('auth-permissions'));
    const model: Permission[] = permissionsString == null ? null : JSON.parse(permissionsString);

    if (!model) { return false; }

    return model.find(x => x.name === permissionName) != null;
  }

  static setSelectedLinkedUserContext(linkedUserMember: LinkedUserMember) {
    sessionStorage.setItem('linked-user-context', JSON.stringify(linkedUserMember));
  }

  static getSelectedMemberContext(): LinkedUserMember {
    const linkedUserContext = sessionStorage.getItem('linked-user-context');
    return JSON.parse(linkedUserContext) as LinkedUserMember;
  }

  static clearSelectedLinkedUserContext() {
    sessionStorage.setItem('linked-user-context', null);
  }

  static setMemberContextReady(isReady: boolean) {
    sessionStorage.setItem('user-context-ready', JSON.stringify(isReady));
  }

  static isMemberContextReady(): boolean {
    const isReady = sessionStorage.getItem('user-context-ready');
    return isReady ? JSON.parse(isReady) as boolean : false;
  }

  static setSelectedHCPContext(linkedHCP: UserHealthCareProvider) {
    sessionStorage.setItem('linked-hcp-context', JSON.stringify(linkedHCP));
  }

  static setHCPContextReady(isReady: boolean) {
    sessionStorage.setItem('hcp-context-ready', JSON.stringify(isReady));
  }

  static clearSelectedHCPContext() {
    sessionStorage.setItem('linked-hcp-context', null);
  }

  static getSelectedHCPContext(): UserHealthCareProvider {
    const linkedHCPContext = sessionStorage.getItem('linked-hcp-context');
    return JSON.parse(linkedHCPContext) as UserHealthCareProvider;
  } 

  static isHCPContextReady(): boolean {
    const isReady = sessionStorage.getItem('hcp-context-ready');
    return isReady ? JSON.parse(isReady) as boolean : false;
  }  
}
