import { Component, Input, OnInit } from '@angular/core';
import { RolePlayer } from 'src/app/shared/models/roleplayer';

@Component({
  selector: 'view-member-documents',
  templateUrl: './view-member-documents.component.html',
  styleUrls: ['./view-member-documents.component.css']
})
export class ViewMemberDocumentsComponent implements OnInit {

  @Input() member: RolePlayer = new RolePlayer();
  isViewMode: boolean;
  memberNumber: string;
  constructor() { }

  ngOnInit() {
    if (this.member.finPayee) {
      this.memberNumber = this.member.finPayee.finPayeNumber;
    }
  }

  cancel() {
    this.view();
  }

  view() {
    this.isViewMode =! this.isViewMode;
  }

}
