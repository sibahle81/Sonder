import { Component, Input, OnInit } from '@angular/core';
import { UserProfileType } from '../shared/enums/user-profile-type.enum';

@Component({
  selector: 'app-external-user-registration',
  templateUrl: './external-user-registration.component.html',
  styleUrls: ['./external-user-registration.component.scss']
})
export class ExternalUserRegistrationComponent implements OnInit {

  @Input() isReadOnly = false;
  @Input() isWizard = false;
  userProfileTypeEnum = UserProfileType;
  userProfileTypes: UserProfileType[];
  profileTypeSelected: string = '';

  constructor() { }

  ngOnInit(): void {
    this.getLookups();
  }

  getLookups() {
    this.userProfileTypes = this.ToArray(UserProfileType).filter(x => x.toString() !== UserProfileType[UserProfileType.None]);
    console.log(this.userProfileTypes)
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    //convert enum to array
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }


}
