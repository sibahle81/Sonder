import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  claimNumber: string,
  policyNumber: string,
  customerName: string,
  createdDate: string,
  date: string,
  status: string,
  acknowledgement: string
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  userDetails: any | undefined;
  accessRoles: any | undefined;

  private user = new BehaviorSubject<number>(2);

  constructor() { }

  setData(dataValue: any): void {
    this.userDetails = dataValue
  }

  getData(): any | undefined {
    return this.userDetails;
  }

  setData1(dataValue: any, accessRolesVal: any = null, assignedAdvisor: any = null,): void {
    this.userDetails = dataValue
    this.accessRoles = accessRolesVal
  }

  getData1(): any | undefined {
    return this.userDetails;
  }
   
   setCurrentStatus(newUser: any): void{
     this.user.next(newUser); 
   }

   getUpdatedStatus(): Observable<number>{
    return this.user.asObservable();
   }

}
