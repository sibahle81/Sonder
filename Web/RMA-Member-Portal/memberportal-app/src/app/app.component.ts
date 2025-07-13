import { AuthService } from './core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AlertService } from './shared/services/alert.service';
import { ToastrManager, Toastr } from 'ng6-toastr-notifications';
import { BehaviorSubject, observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'RMA - Member Portal';
  public isLoggedIn = false;
  public lastToast: Toastr;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private readonly toastr: ToastrManager) {
  }

  public ngOnInit(): void {
    this.authService.$loginChanged.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });

    this.authService.isLoggedIn().then(loggedIn => {
      this.isLoggedIn = loggedIn;
      this.authService.changeNotifications(true);
    });

    this.setAlertService();
  }

  public login(): void {
    this.authService.login();
  }

  public logout(): void {
    this.authService.logout();
  }

  /** @description Listens for any alerts that have been requested, and then displays them. */
  setAlertService(): void {
    this.alertService.getMessage().subscribe(
      message => {

        if (!message) { return; }
        if (message.type == null || message.type === '') { return; }

        const title = this.setAlertTitle(message.title, message.type);

        switch (message.type.toLowerCase()) {
          case 'success':
            this.lastToast = this.toastr.successToastr(message.text, title);
            break;
          case 'error':
            this.lastToast = this.toastr.errorToastr(message.text, title);
            break;
          case 'loading':
            this.lastToast = this.toastr.warningToastr(message.text, title);
            break;
          default:
            if (!this.lastToast) { return; }
            this.toastr.dismissAllToastr();
          // this.toastr.dismissToastr(this.lastToast);
        }
      }
    );
  }

  /**
   * @description Checks if the title was empty, if so sets the title to the type of toast.
   * @param string title The title for the toast.
   * @param string type The type of toast that will be displayed.
   */
  setAlertTitle(title: string, type: string): string {
    return title !== null && title !== '' ? title : type;
  }
}
