import { Permission } from "src/app/core/models/security/permission";
import { UserHealthCareProvider } from "src/app/core/models/security/user-healthcare-provider-model";
import { LinkedUserMember } from "src/app/shared/models/linked-user-member";

export class userUtility {

  static hasPermission(permissionName: string): boolean {
    const permissionsString = sessionStorage.getItem('auth-permissions');
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
}
