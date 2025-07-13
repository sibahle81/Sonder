import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationSharedComponent } from 'src/app/shared/components/notification/notification-shared.component';
import { WizardService } from 'src/app/shared/components/wizard/shared/services/wizard.service';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  taskWizardConfigIds = '';
  notificationWizardConfigIds = ConstantPlaceholder.BrokerNotificationConfigIds;
  numberOfNotifications = 0;
  numberOfTasks = 0;
  currentUser: any;

  @Input() public isLoggedIn: boolean;

  @Output() public sidenavToggle = new EventEmitter();
  @Output() public login = new EventEmitter();
  @Output() public logout = new EventEmitter();


  constructor(
    private readonly wizardService: WizardService,
    public dialog: MatDialog,
    private authService: AuthService) {
  }

  public ngOnInit(): void {
    this.authService.loginChangedSubject.subscribe(isUser => {
      this.currentUser = this.authService.getCurrentUser();

      if (this.currentUser) {
        switch (this.currentUser.roleName) {
          case ConstantPlaceholder.MemberPortalAdministratorRole: break;
          case ConstantPlaceholder.MemberPortalIndividualRole:
            break;
          case ConstantPlaceholder.MemberPortalBrokerRole:
            this.taskWizardConfigIds = ConstantPlaceholder.BrokerTaskConfigIds;
            this.notificationWizardConfigIds = ConstantPlaceholder.BrokerNotificationConfigIds;
            this.getNotificationAndTasksForUser(this.notificationWizardConfigIds, ConstantPlaceholder.brokerNotificationsTitle)
            break;
          case '': break;
          default: break;
        }

        // Updating wizards every 25 seconds
        setInterval(() => {
          // this.getNotificationAndTasksForUser(this.taskWizardConfigIds, ConstantPlaceholder.BrokerTasksTitle);
          this.getNotificationAndTasksForUser(this.notificationWizardConfigIds, ConstantPlaceholder.brokerNotificationsTitle);
        }, 25000);
      }
    })

    // When Notification gets updated from wizard side or on Refresh
    this.authService.notificationChange$.subscribe(data => {
      if (data) {
        // this.getNotificationAndTasksForUser(this.taskWizardConfigIds, ConstantPlaceholder.BrokerTasksTitle);
        this.getNotificationAndTasksForUser(this.notificationWizardConfigIds, ConstantPlaceholder.brokerNotificationsTitle);
      }
    })
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  public onLogin = () => {
    this.login.emit();
  }

  public onLogout = () => {
    this.logout.emit();
  }

  public onRegister = () => {
    this.login.emit();
  }

  notificationDialog(): void {
    this.dialog.open(NotificationSharedComponent, {
      width: '1500px',
      height: '600px',
      data: {
        wizardConfigIds: this.notificationWizardConfigIds,
        title: 'My Notifications',
        type: 'notifications'
      }
    });
  }

  taskDialog(): void {
    this.dialog.open(NotificationSharedComponent, {
      width: '1500px',
      height: '600px',
      data: {
        wizardConfigIds: this.taskWizardConfigIds,
        title: 'My Tasks',
        type: 'tasks'
      }
    });
  }

  getNotificationAndTasksForUser(wizardConfigIds: string, title: string): void {
    if (wizardConfigIds == '') return;
    if (this.currentUser && this.currentUser.roleName === ConstantPlaceholder.MemberPortalBrokerRole) {
      this.wizardService.getUserWizards(wizardConfigIds, false).subscribe(data => {
        if (data.length > 0) {
          this.numberOfNotifications = data.length;
        }
      });
    }
  }
}
