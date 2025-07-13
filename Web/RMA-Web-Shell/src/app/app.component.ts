import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ToastrManager, Toastr } from 'ng6-toastr-notifications';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Error } from 'projects/shared-models-lib/src/lib/common/error';
import { ErrorComponent } from './views/error/error.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(ErrorComponent, { static: false })

  errorComponent: ErrorComponent;
  error: Error;
  lastToast: Toastr;
  title = 'Rand Mutual Assurance Portal';

  constructor(
    private readonly alertService: AlertService,
    private readonly toastr: ToastrManager) {
  }

  ngOnInit() {
    this.setAlertService();
  }

  ngAfterViewInit() {
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
