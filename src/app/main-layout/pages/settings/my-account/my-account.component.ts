import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Pagination } from 'src/app/@shared/interfaces/pagination';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { ChannelService } from 'src/app/@shared/services/channels.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { ShareService } from 'src/app/@shared/services/share.service';
import { SocketService } from 'src/app/@shared/services/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit, OnDestroy{
  userData: any;
  videoList: any = [];
  channelDetails: any = {};
  apiUrl = environment.apiUrl + 'channels';
  channelData: any = [];
  channelList: any = [];
  activePage = 0;
  channelId: number;
  countChannel: number;
  hasMoreData = false;
  userChannelCount: number;
  isHistoryPage: boolean = false;
  pagination: Pagination = {
    activePage: 1,
    perPage: 20,
    totalItems: 0,
  };
  routerSubscription: Subscription | undefined;
  
  constructor(
    private commonService: CommonService,
    private channelService: ChannelService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
    public shareService: ShareService,
    private router: Router,
    private socketService: SocketService
  ) {
    // this.channelId = +localStorage.getItem('channelId');
    this.userData = this.authService.getUserData() as any;
    this.channelId = this.userData?.channelId;

    this.routerSubscription = this.router.events.subscribe((event: any) => {
      console.log(event);
      if (event.routerEvent.url.includes('history')) {
        this.isHistoryPage = true;
        this.getViewHistory();
      } else {
        this.isHistoryPage = false;
        this.channelService.getMyChannels();
        this.loadMore();
      }
    });
  }

  ngOnInit(): void {
    this.channelService.myChannels$.subscribe((channels) => {
      this.channelList = channels;
      this.countChannel = this.channelList.length;
    });
  }

  // getPostVideosById(): void {
  //   if (this.channelId) {
  //     this.loadMore();
  //   }
  // }

  onPageChange(config: Pagination): void {
    this.pagination = config;
    if (this.isHistoryPage) {
      this.getViewHistory();
    } else if (!this.isHistoryPage) {
      this.loadMore();
    }
  }

  loadMore() {
    this.activePage++;
    this.spinner.show();
    this.commonService
      // id: this.channelId,
      .post(`${this.apiUrl}/my-posts`, {
        profileId: this.userData.profileId,
        // id: this.channelId,
        size: this.pagination.perPage,
        page: this.pagination.activePage,
      })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res?.data?.length > 0) {
            this.videoList = res.data;
            // this.videoList = this.videoList.concat(res.data);
            this.pagination.totalItems = res?.pagination?.totalItems;
          }
          // else {
          //   this.hasMoreData = false;
          // }
          // if (this.activePage < res.pagination.totalPages) {
          //   this.hasMoreData = true;
          // }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
  }

  // getChannelByUserId(): void {
  //   const url = environment.apiUrl
  //   this.commonService.get(`${url}channels/my-channel/${this.userData.UserID}`).subscribe({
  //     next: (res) => {
  //       if (res) {
  //         this.channelData = res;
  //         this.userChannelCount = this.channelData.length
  //         console.log(this.channelData.length);
  //       }
  //     },
  //     error: (error) => {
  //       console.log(error);
  //     },
  //   });
  // }
  getChannels(): void {
    const userId = this.userData.UserID;
    this.channelService.getMyChannels();
    // const apiUrl = `${environment.apiUrl}channels/get-channels/${userId}`;
    // this.commonService.get(apiUrl).subscribe({
    //   next: (res) => {
    //     if(res){
    //     this.channelList = res.data;
    //     this.countChannel=this.channelList.length
    //     let channelIds = this.channelList.map(e => e.id);
    //     localStorage.setItem('get-channels', JSON.stringify(channelIds));
    //     }
    //   },
    //   error(err) {
    //     console.log(err);
    //   },
    // });
  }

  getViewHistory(): void {
    this.socketService.getViewHistory(
      { profileId: this.userData.profileId, size: 20, page: this.activePage },
      (res) => {
        console.log('video List', res);
        this.videoList = res.data;
        this.pagination.totalItems = res?.pagination?.totalItems;
      }
    );
  }
  
  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
