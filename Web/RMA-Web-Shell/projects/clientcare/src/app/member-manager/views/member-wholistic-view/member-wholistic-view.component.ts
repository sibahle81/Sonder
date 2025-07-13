import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './member-wholistic-view.component.html',
  styleUrls: ['./member-wholistic-view.component.css']
})
export class MemberWholisticViewComponent implements OnInit {
  rolePlayerId: number;
  defaultPolicyId: number;
  tabIndex: number;
  triggerRefresh: boolean;

  constructor(
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.defaultPolicyId = params.policyId ? params.policyId : 0;
      this.rolePlayerId = params.id;
      this.tabIndex = params.tabIndex ? params.tabIndex : 0;
    });
  }

  refresh($event: boolean) {
    this.triggerRefresh = !this.triggerRefresh;
  }
}
