import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { SeoService } from 'src/app/@shared/services/seo.service';
import { ShareService } from 'src/app/@shared/services/share.service';
import { SocketService } from 'src/app/@shared/services/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  apiUrl = environment.apiUrl + 'channels/';
  useDetails: any = [];
  channelData: any = {};
  videoList: any = [];
  recommendedVideoList: any = [];
  isNavigationEnd = false;
  activePage = 0;
  activeFeturePage = 0;
  hasMoreData = false;
  hasRecommendedData = false;
  channelName = '';
  channelId: number;
  receivedSearchText: string = '';
  activeTab: string = 'Videos';
  searchChannelData: any = [];
  searchPostData: any = [];
  searchResults: number;

  notificationId: number;
  searchText: string;
  categorizedVideos: any = [];
  categoryName: any = [];
  independentMedia: any = [];
  hasindependentMedia: boolean = false;
  independentMediaPage: number = 0;
  routerSubscription: Subscription | undefined;
  desiredOrder = [
    'recentPosted',
    'sports',
    'gaming',
    'finance',
    'news',
    'entertainment',
    'cooking',
    'science',
    'music',
    'featuredVideos'
];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private socketService: SocketService,
    private authService: AuthService,
    private shareService: ShareService,
    private seoService: SeoService,
  ) {
    this.useDetails = this.authService.getUserData() as any;
    this.channelId = +localStorage.getItem('channelId');

    this.routerSubscription = this.route.paramMap.subscribe((paramMap) => {
      // https://facetime.opash.in/
      const name = paramMap.get('name');
      this.channelName = name;
      this.videoList = [];
      if (name) {
        this.channelName = name;
        this.getChannelDetails(name);
        if (this.searchResults) {
          this.searchChannelData = null;
          this.searchPostData = null;
          this.searchResults = null;
        }
      } else {
        if (this.useDetails.UserID) {
          // this.getChannelByUserId(this.useDetails?.UserID);
        }
      }
    });
    const data = {
      title: `Tube.buzz`,
      description: '',
    };
    this.seoService.updateSeoMetaData(data);
  }

  ngOnInit() {
    this.recommendedLoadMore();
    this.independentMediaLoadMore();
  }

  ngAfterViewInit(): void {
    if (!this.socketService?.socket?.connected) {
      this.socketService?.socket?.connect();
    }

    this.socketService?.socket?.emit('join', { room: this.useDetails.profileId });
    this.socketService?.socket?.on('notification', (data: any) => {
      console.log(data);
      if (data) {
        this.notificationId = data.id;
        this.shareService.isNotify = true;
        if (this.notificationId) {
          this.commonService.getNotification(this.notificationId).subscribe({
            next: (res) => {
              console.log(res);
              localStorage.setItem('isRead', res.data[0]?.isRead);
            },
            error: (error) => {
              console.log(error);
            },
          });
        }
      }
    });
    const isRead = localStorage.getItem('isRead');
    if (isRead === 'N') {
      this.shareService.isNotify = true;
    }
  }

  getChannelByUserId(value): void {
    this.commonService.get(`${this.apiUrl}my-channel/${value}`).subscribe({
      next: (res) => {
        // console.log(res.data);
        if (res) {
          this.channelData = res[0];
          // localStorage.setItem('channelId', this.channelData.id);
          // console.log(this.channelData);
          const data = {
            title: `Tube.buzz ${this.channelData.firstname}`,
            url: `${location.href}`,
            description: '',
          };
          this.seoService.updateSeoMetaData(data);
          this.getPostVideosById();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getChannelDetails(value): void {
    this.commonService.get(`${this.apiUrl}${value}`).subscribe({
      next: (res) => {
        // console.log(res.data);
        if (res.data.length) {
          this.channelData = res.data[0];
          const data = {
            title: `Tube.buzz ${this.channelData.firstname}`,
            url: `${location.href}`,
            description: '',
          };
          this.seoService.updateSeoMetaData(data);
          // console.log(this.channelData);
          this.getPostVideosById();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  // getPostVideosById(): void {
  //   this.commonService
  //     .post(this.apiUrl, { id: this.channelData?.profileid, size: 10, page: this.activePage })
  //     .subscribe({
  //       next: (res: any) => {
  //         this.videoList = res.data;
  //         console.log(res);
  //       },
  //       error: (error) => {
  //         console.log(error);
  //       },
  //     });
  // }

  getPostVideosById(): void {
    this.activePage = 0;
    if (this.channelData?.profileid) {
      this.loadMore();
    }
  }

  loadMore() {
    this.activePage++;
    this.spinner.show();
    this.commonService
      .post(`${this.apiUrl}my-posts`, {
        id: this.channelData?.id,
        size: 12,
        page: this.activePage,
      })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res?.data?.length > 0) {
            this.videoList = this.videoList.concat(res.data);
          } else {
            this.hasMoreData = false;
          }
          if (this.activePage < res.pagination.totalPages) {
            this.hasMoreData = true;
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
  }

  recommendedLoadMore() {
    this.activeFeturePage++;
    this.spinner.show();
    this.commonService
      .post(`${this.apiUrl}posts`, {
        profileId: this.useDetails?.profileId,
        size: 100,
        // page: this.activeFeturePage,
      })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res?.data) {
            // this.recommendedVideoList = this.recommendedVideoList.concat(
            //   res.data
            // );
            this.recommendedVideoList = res.data
            // this.categoryName = Object.keys(this.recommendedVideoList)
            this.categoryName = this.desiredOrder.filter(category => Object.keys(this.recommendedVideoList).includes(category));
          } else {
            this.hasRecommendedData = false;
          }
          if (this.activeFeturePage < res.pagination.totalPages) {
            this.hasRecommendedData = true;
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
  }
  switchTab(tabName: string) {
    this.activeTab = tabName;
    console.log(tabName);
  }

  onSearchData(searchText: string) {
    console.log(searchText);
    this.searchText = searchText;

    this.spinner.show();
    this.commonService
      .post(`${this.apiUrl}search-all`, { search: searchText })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.searchChannelData = res.channels;
          this.searchPostData = res.posts;
          this.searchResults =
            this.searchChannelData.length + this.searchPostData.length;
          if (res.channels.length === 0) {
            this.activeTab = 'Videos';
          }
          // console.log(this.searchResults);
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
  }

  clearSearchData() {
    this.searchChannelData = null;
    this.searchPostData = null;
    this.searchResults = null;
  }

  categoryViewAll(category){
    this.router.navigate([`category/${category}`]);
  }

  independentViewAll(){
    this.router.navigate([`category/independentmedia`]);
  }

  independentMediaLoadMore() {
    this.independentMediaPage++;
    this.spinner.show();
    const api = `https://api.freedom.buzz/api/v1/channels/`
    this.commonService
      .post(`${api}posts`, {
        size: 8,
        page: this.independentMediaPage,
      })
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res?.data?.length > 0) {
            this.independentMedia = res.data;
            // this.independentMedia = this.independentMedia.concat(
            //   res.data
            // );
            // this.hasindependentMedia = false;
          } 
          // else {
          //   this.hasindependentMedia = true;
          // }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
