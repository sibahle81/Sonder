import { Component, OnInit, ViewChild } from '@angular/core';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AuthService } from '../core/services/auth.service';
import { ConstantPlaceholder } from '../shared/constants/constant-placeholder';

@Component({
  selector: 'app-idle-component',
  templateUrl: './idle.component.html',
  styleUrls: ['./idle.component.scss']
})
export class IdleComponent implements OnInit {

  idleState = ConstantPlaceholder.IdleState;
  proceed = ConstantPlaceholder.Proceed;
  timedOut = false;
  lastPing?: Date = null;

  @ViewChild('childModal') public childModal: ModalDirective;

  constructor(
    private idle: Idle,
    private authService: AuthService,
    private keepalive: Keepalive) {

    // sets an idle timeout of 15 min
    idle.setIdle(900);
    // gives you 15 seconds to make a decision
    idle.setTimeout(15);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = ConstantPlaceholder.NoLongerIdle;
      console.log(this.idleState);
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      this.childModal.hide();
      this.idleState = ConstantPlaceholder.TimedOut;
      this.timedOut = true;
      console.log(this.idleState);
      this.authService.logout();
    });

    idle.onIdleStart.subscribe(() => {
      this.idleState = ConstantPlaceholder.Proceed
      console.log(this.idleState);
      this.childModal.show();
    });

    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will logout in ' + countdown + ' seconds!'
      console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);

    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.authService.$loginChanged.subscribe(userLoggedIn => {
      if (userLoggedIn) {
        idle.watch()
        this.timedOut = false;
      } else {
        idle.stop();
      }
    })
  }

  ngOnInit(): void {
  }


  reset() {
    this.idle.watch();
    this.timedOut = false;
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  stay() {
    this.childModal.hide();
    this.reset();
  }

  signUserOut() {
    this.childModal.hide();
    this.authService.logout();
  }
}
