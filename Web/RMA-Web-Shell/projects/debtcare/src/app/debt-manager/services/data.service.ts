import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  details: any | undefined;
  constructor() { }

  private user = new BehaviorSubject<string>(null);
   
   setActionStatus(key: string){
     this.user.next(key); 
   }

   getActionStatus(): Observable<string>{
    return this.user.asObservable();
   }

  setData(data: any): void{
    this.details = data;
  }

  getData(): any{
    return this.details;
  }
}
