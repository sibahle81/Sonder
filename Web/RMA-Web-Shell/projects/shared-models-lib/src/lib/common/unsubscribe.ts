import { Injectable, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { PermissionHelper } from "./permission-helper";

@Injectable()
export abstract class UnSubscribe extends PermissionHelper implements OnDestroy {

  unSubscribe$ = new Subject<void>();

  ngOnDestroy() {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }
}
