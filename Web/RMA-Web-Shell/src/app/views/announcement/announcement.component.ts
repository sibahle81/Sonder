import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Announcement } from 'projects/shared-models-lib/src/lib/common/announcement';
import { AnnouncementUserAcceptance } from 'projects/shared-models-lib/src/lib/common/AnnouncementUserAcceptance';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AnnouncementService } from 'projects/shared-services-lib/src/lib/services/announcement/announcement.service';
import { AnnouncementUserAcceptanceService } from 'projects/shared-services-lib/src/lib/services/announcement/announcementuseracceptance.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { Observable } from 'rxjs';

  @Component({
    selector: 'app-announcement',
    templateUrl: './announcement.component.html',
    styleUrls: ['./announcement.component.css']
  })
  
  export class AnnouncementComponent implements OnInit {
    currentUser: User;
    announcements: Announcement[];
    currentAnnouncement: Announcement;
    loading = false;
    fOnClick:(announcement:Announcement)=>void;

    constructor(
      private readonly router: Router,
      private readonly authService: AuthService,
      private readonly announcementService: AnnouncementService,
      private readonly userAcceptanceService: AnnouncementUserAcceptanceService
      ) {
        this.fOnClick = (announcement:Announcement=void 0)=>{return;};
    }

    ngOnInit() {
      this.currentUser = this.authService.getCurrentUser();
      this.loading = true
        this.announcementService.getAnnouncementsByUserId(this.currentUser.id).subscribe(result=>{
          this.announcements = result;
          this.currentAnnouncement = result[0];
          sessionStorage.setItem('announcement-count', this.announcements.length.toString());
             if(!result || result.length === 0) { this.navigateToPostLogin(); return; }
             this.loading = false;
        });
    }

    @HostListener("click", ['$event'])
    onClick(event: MouseEvent) {
        // If we don't have an anchor tag, we don't need to do anything.
        if (event.target instanceof HTMLAnchorElement === false) { 
          return;
        }
        // Prevent page from reloading
        event.preventDefault();
        let target = <HTMLAnchorElement>event.target;
        const fragment = target.href.split('#')[target.href.split('#').length - 1];
        
        // Navigate to the path in the link
      this.router.navigate(['/announcements'], { fragment, state: {data: history.state.data}});
    }

    get buttonDescription() {
      return this.currentAnnouncement.isMandatory  ? 'Accept' : 'Continue';
    }

    nextAnnouncement(): Announcement {
      if(this.announcements.length > 0) {
      this.announcements = this.announcements.filter(x => x.announcementId !== this.currentAnnouncement.announcementId);
      return this.announcements[0];
      } else {
        this.navigateToPostLogin();
        return;
      }
    }
    
    onAcceptChange() { 
      this.loading = true;     
      this.acceptUserAnnouncement(this.currentAnnouncement)
        .subscribe(() => {
          this.currentAnnouncement = this.nextAnnouncement();
          sessionStorage.setItem('announcement-count', this.announcements.length.toString());
          
          if(this.announcements.length === 0){ this.navigateToPostLogin(); return; }

           this.loading = false;
        });
     
    }

    navigateToPostLogin() : void {
        let postLoginUrl = history.state.data;
        
        this.router.navigate([`${postLoginUrl}`]);
    }

    acceptUserAnnouncement(announcement:Announcement) : Observable<number>{
      
      let userAcceptance = new AnnouncementUserAcceptance();
      userAcceptance.announcementId = announcement.announcementId;
      userAcceptance.userId = this.currentUser.id;
      userAcceptance.isAccepted = true;

      return this.userAcceptanceService.addAnnouncementUserAcceptance(userAcceptance);
    }
  }