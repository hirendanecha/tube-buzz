import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
// import { CustomerService } from './customer.service';
// import { CommunityService } from './community.service';
// import { PostService } from './post.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChannelService } from './channels.service';
import { AuthService } from './auth.service';
// import { CustomerService } from './customer.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  isDark = true;
  userData: any = {};
  notificationList: any = [];
  isNotify = false;
  linkMetaData: {};
  advertizementLink: any = [];
  onlineUserList: any = [];

  private isRoomCreatedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(
    public modalService: NgbModal,
    private spinner: NgxSpinnerService,
    // private customerService: CustomerService,
    private authService: AuthService,
    private channelService: ChannelService,
    private route: ActivatedRoute
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const name = paramMap.get('name');
      if (!name) {
        this.advertizementLink = [];
      }
    });
    if (localStorage.getItem('theme') === 'dark') {
      this.changeDarkUi();
    } else {
      this.changeLightUi();
    }
  }

  changeDarkUi() {
    this.isDark = true;
    document?.body.classList.remove('dark-ui');
    // document.body.classList.add('dark-ui');
    localStorage.setItem('theme', 'dark');
  }

  changeLightUi() {
    this.isDark = false;
    document?.body.classList.add('dark-ui');
    // document.body.classList.remove('dark-ui');
    localStorage.setItem('theme', 'light');
  }

  toggleUi(): void {
    if (this.isDark) {
      this.changeLightUi();
    } else {
      this.changeDarkUi();
    }
  }

  getUserDetails() {
    const profileId = localStorage.getItem('profileId');
    if (profileId) {
      // const localUserData = JSON.parse(localStorage.getItem('userData'));
      // if (localUserData?.ID) {
      //   this.userData = localUserData;
      // }
      this.spinner.show();
      this.channelService.getProfile(profileId).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          const data = res?.data;
          if (data) {
            this.userData = data;
            this.authService.setUserData(this.userData)
            localStorage.setItem('userData', JSON.stringify(this.userData));
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
    }
  }

  isUserMediaApproved(): boolean {
    return this.userData?.MediaApproved === 1;
  }

  getNotificationList() {
    const id = localStorage.getItem('profileId');
    const data = {
      page: 1,
      size: 20,
    };
    this.channelService.getNotificationList(Number(id), data).subscribe({
      next: (res: any) => {
        this.isNotify = false;
        this.notificationList = res.data.filter((ele) => {
          ele.notificationToProfileId === id;
          return ele;
        });
        // this.notificationList = res?.data;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // getAdvertizeMentLink(id): void {
  //   if (id) {
  //     this.communityService.getLinkById(id).subscribe({
  //       next: (res: any) => {
  //         if (res.data) {
  //           if (res.data[0]?.link1 || res.data[0]?.link2) {
  //             this.advertizementLink = [];
  //             if (res.data[0]?.link1) {
  //               this.getMetaDataFromUrlStr(res.data[0]?.link1);
  //             }
  //             if (res.data[0]?.link2) {
  //               this.getMetaDataFromUrlStr(res.data[0]?.link2);
  //             }
  //           }
  //         }
  //       },
  //       error: (err) => {
  //         console.log(err);
  //       },
  //     });
  //   } else {
  //     this.advertizementLink = null;
  //   }
  // }

  getMetaDataFromUrlStr(url): void {
    this.channelService.getMetaData({ url }).subscribe({
      next: (res: any) => {
        const meta = res?.meta;
        const urls = meta?.image?.url;
        const imgUrl = Array.isArray(urls) ? urls?.[0] : urls;
        const linkMetaData = {
          title: meta?.title,
          metadescription: meta?.description,
          metaimage: imgUrl,
          metalink: meta?.url || url,
          url: url,
        };
        // if (res?.meta?.meta?.image) {
        // }
        this.advertizementLink.push(linkMetaData);
        console.log(this.advertizementLink);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  updateIsRoomCreated(value: boolean): void {
    this.isRoomCreatedSubject.next(value);
  }

  // Method to get an Observable that emits isRoomCreated changes
  getIsRoomCreatedObservable(): Observable<boolean> {
    return this.isRoomCreatedSubject.asObservable();
  }
}
