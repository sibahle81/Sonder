import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  @Input() dataSource: any;
  @Input() pageMetaData: any;
  @Output() onActionClick = new EventEmitter();

  onMenuItemClick(item, menu): void {
    let obj = {
      item: item,
      menu: menu
    }
    this.onActionClick.emit(obj)
  }

}
