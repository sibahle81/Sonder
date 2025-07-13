import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { HealthcareProviderService } from 'projects/medicare/src/app/medi-manager/services/healthcareProvider.service';
import { UserHealthCareProvider } from 'projects/shared-models-lib/src/lib/security/user-healthCare-provider-model';
import { HealthCareProvider } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider';
import { isNullOrUndefined } from 'util';
import { HealthcareProviderAccessRights } from 'projects/medicare/src/app/medi-manager/models/healthcare-provider-access-rights';
import { Injectable } from '@angular/core';
import { MediCarePreAuthService } from 'projects/medicare/src/app/preauth-manager/services/medicare-preauth.service';
import { PreAuthPractitionerTypeSetting } from 'projects/medicare/src/app/medi-manager/models/preAuth-practitioner-type-setting';

@Injectable({
  providedIn: 'root'
})
export class HealthcareProviderPreAuthSegmentAccess {

  healthcareProviderPreAuthAccessRights: HealthcareProviderAccessRights;
  currentHealthCareProvider: HealthCareProvider = null;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly healthcareProviderService: HealthcareProviderService,
    private readonly mediCarePreAuthService: MediCarePreAuthService) { }


  checkAndSetHealthcareProviderPreAuthAccessRights(): HealthcareProviderAccessRights {
    this.healthcareProviderPreAuthAccessRights = new HealthcareProviderAccessRights();
    var currentUser = this.authService.getCurrentUser();
    let currentUserHCPs: UserHealthCareProvider[];
    this.userService.getUserHealthCareProviders(currentUser.email).subscribe((x) => {
      currentUserHCPs = x;
    },
      (error) => {
      },
      () => {
        if (!isNullOrUndefined(currentUserHCPs) && currentUserHCPs.length > 0) {
          this.healthcareProviderService.filterHealthCareProviders(currentUserHCPs[0].practiceNumber)
            .subscribe(healthCareProviders => {
              if (!isNullOrUndefined(healthCareProviders) && healthCareProviders.length > 0) {
                this.currentHealthCareProvider = healthCareProviders[0];
              }
            },
              () => { },
              () => {
                if (!isNullOrUndefined(this.currentHealthCareProvider)) {
                  sessionStorage.setItem('currentHealthCareProvider', JSON.stringify(this.currentHealthCareProvider));
                  this.setHealthcareProviderPreAuthAccessRights(this.currentHealthCareProvider.providerTypeId);            
                }
              }
            );
        }
      }
    );
    return this.healthcareProviderPreAuthAccessRights;
  }

  setHealthcareProviderPreAuthAccessRights(practitionerTypeId: number): void {
    let practitionerType;
    let preAuthPractitionerTypeSetting;
    this.mediCarePreAuthService.getPreAuthPractitionerTypeSetting(4, practitionerTypeId).subscribe(
      (result) => {
        preAuthPractitionerTypeSetting = result as unknown as PreAuthPractitionerTypeSetting;
      },
      (error) => {},
      () => { 
        if(!isNullOrUndefined(preAuthPractitionerTypeSetting)){
        this.healthcareProviderPreAuthAccessRights.canCaptureHospital = preAuthPractitionerTypeSetting.isHospital;
        this.healthcareProviderPreAuthAccessRights.canCaptureTreatingDoctor = preAuthPractitionerTypeSetting.isTreatingDoctor;
        this.healthcareProviderPreAuthAccessRights.canCapturePhysioOT = (!preAuthPractitionerTypeSetting.isHospital && !preAuthPractitionerTypeSetting.isTreatingDoctor);
        this.healthcareProviderService.setCurentHealthCareProviderDetailsAndAcessRights(this.currentHealthCareProvider, preAuthPractitionerTypeSetting, this.healthcareProviderPreAuthAccessRights);
        sessionStorage.setItem('healthcareProviderPreAuthAccessRights', JSON.stringify(this.healthcareProviderPreAuthAccessRights));
        }
      }
    );
  }

}