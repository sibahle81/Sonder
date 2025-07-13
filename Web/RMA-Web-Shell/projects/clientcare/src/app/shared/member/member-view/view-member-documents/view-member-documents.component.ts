import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RolePlayer } from '../../../../policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'view-member-documents',
  templateUrl: './view-member-documents.component.html',
  styleUrls: ['./view-member-documents.component.css']
})
export class ViewMemberDocumentsComponent implements OnInit {

  @Input() member: RolePlayer = new RolePlayer();
  @Output() requiredDocumentsUploaded: EventEmitter<boolean> = new EventEmitter();
  isViewMode: boolean;
  constructor() { }

  ngOnInit() { }

  cancel() {
    this.view();
  }

  view() {
    this.isViewMode = !this.isViewMode;
  }

  checkRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded.emit($event);
  }
}
