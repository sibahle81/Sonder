import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshService {
    private subjectName = new Subject<any>(); //need to create a subject

    triggerRefresh() { //the component that wants to update something, calls this fn
        this.subjectName.next({ refresh: true }); //next() will feed the value in Subject
    }

    getRefreshPolicyCommand(): Observable<any> { //the receiver component calls this function 
        return this.subjectName.asObservable(); //it returns as an observable to which the receiver funtion will subscribe
    }

    getRefreshMemberCommand(): Observable<any> { //the receiver component calls this function 
        return this.subjectName.asObservable(); //it returns as an observable to which the receiver funtion will subscribe
    }
}