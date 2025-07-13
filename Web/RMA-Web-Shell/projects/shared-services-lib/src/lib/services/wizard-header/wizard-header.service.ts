import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class WizardClickService {

  private _headerClick$ = new BehaviorSubject<boolean>(false);
  headerClick$ = this._headerClick$.asObservable();
  private _nextClick$ =new BehaviorSubject<boolean>(true);
  nextClick$ = this._nextClick$.asObservable();

  constructor() { }

  setHeaderClick(value: boolean):void {
    this._headerClick$.next(value);
  }

  setNextClick(value: boolean): void {
    this._nextClick$.next(value);
  }
}