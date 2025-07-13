import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-onboarding-home',
  templateUrl: './onboarding-home.component.html',
  styleUrls: ['./onboarding-home.component.css']
})
export class OnboardingHomeComponent extends PermissionHelper implements OnInit {

  selectedTabIndex = 0;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  constructor(
    private readonly activatedRoute: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.selectedTabIndex) {
        this.selectedTabIndex = params.selectedTabIndex;
      }
    });
  }
}
