import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth-failure',
  templateUrl: './auth-failure.component.html',
  styleUrls: ['./auth-failure.component.css']
})
export class AuthFailureComponent implements OnInit {

  message:string;

  constructor(
    private _location: Location,
    private router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.message) { 
        this.message = params.message; 
      }
     });
    }



  backClicked() {
    this._location.back();
  }
}
