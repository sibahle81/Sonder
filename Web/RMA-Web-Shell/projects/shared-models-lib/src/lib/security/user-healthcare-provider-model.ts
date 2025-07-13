export class UserHealthCareProvider {
  healthCareProviderId: number;
  name: string;
  practiceNumber: string;
  userId: number;
  compCareMSPId: number;

  static minimalNewUserHealthCareProvider(userId: number, healthCareProviderId: number) : UserHealthCareProvider
  {
    var newInstance = new UserHealthCareProvider();
    newInstance.healthCareProviderId = healthCareProviderId;
    newInstance.userId = userId;
    return newInstance;
  }
}
