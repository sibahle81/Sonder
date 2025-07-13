import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-tabbed-report-menu-layout',
  templateUrl: './tabbed-report-menu-layout.component.html',
  styleUrls: ['./tabbed-report-menu-layout.component.css']
})
export class TabbedReportMenuLayoutComponent implements OnInit {

  @Input() menuItems: { route: string, text: string, tab: string }[] = []
  @Output() menuSelectedHandler = new EventEmitter<boolean>();
  groupedMenuItems: { tab: string, items: { route: string, text: string, tab: string }[] }[] = [];

  ngOnInit(): void {
    let groups = []
    this.menuItems.forEach(element => {
      if (!groups.includes(element.tab)) {
        groups.push(element.tab);
      }
    });

    groups.forEach(c => {
      const items = this.menuItems.filter(k => k.tab === c);
      this.groupedMenuItems.push({ tab: c, items });
    })
    
  }
  
  menuClicked(){
    this.menuSelectedHandler.emit(true);
    }
}
