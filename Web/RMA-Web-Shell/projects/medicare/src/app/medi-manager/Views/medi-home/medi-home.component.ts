import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medi-home',
  templateUrl: './medi-home.component.html',
  styleUrls: ['./medi-home.component.css']
})
export class MediHomeComponent implements OnInit {

  constructor(
    private router: Router) { 
      
    }

  ngOnInit() {

  }
  
  displayHolisticView($event: any) {
    this.router.navigate(['/medicare/view-search-results', $event.personEventId, 'holisticview', $event.claimId]);
  }
}
