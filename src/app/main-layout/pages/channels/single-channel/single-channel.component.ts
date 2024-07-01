import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, filter } from 'rxjs';
import { Pagination } from 'src/app/@shared/interfaces/pagination';
import { CreateChannelComponent } from 'src/app/@shared/modals/create-channel/create-channel-modal.component';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { ChannelService } from 'src/app/@shared/services/channels.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { ShareService } from 'src/app/@shared/services/share.service';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-single-channel',
  templateUrl: './single-channel.component.html',
  styleUrls: ['./single-channel.component.scss'],
})
export class SingleChannelComponent implements OnInit, OnDestroy {
  useDetails: any = {};
  channelDetails: any = {};
  videoList: any = [];
  apiUrl = environment.apiUrl;
  activeTab = 1;
  categoryName: string = 'Tube.buzz';
  activeFeturePage = 0;
  hasMoreData: boolean = false;
  pagination: Pagination = {
    activePage: 1,
    perPage: 20,
    totalItems: 0,
  };
  routerSubscription: Subscription | undefined;

  constructor(
    private commonService: CommonService,
    private channelService: ChannelService,
    public authService: AuthService,
    private toasterService: ToastService,
    public shareService: ShareService,
    private modalService: NgbModal,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.routerSubscription = this.router.events.subscribe((event: any) => {
      const name = event?.routerEvent?.url.split('/')[2];
      const url = this.router.routerState.snapshot.url;
      if (name) {
        if (url.includes('category')) {
          this.getPostByCategory(String(name));
          this.categoryName = String(name);
        } else {
          this.getChannelDetailsById(String(name));
        }
      }
    });

    this.useDetails = JSON.parse(this.authService.getUserData() as any);
    // if (this.useDetails?.MediaApproved === 1) {
    //   return;
    // } else {
    //   this.router.navigate(['/home']);
    // }
  }

  ngOnInit(): void {}

  onPageChange(config: Pagination, category): void {
    this.pagination = config;
    if (this.channelDetails?.unique_link) {
      this.getChannelDetailsById(this.channelDetails?.unique_link);
    } else {
      this.getPostByCategory(category);
    }
  }

  getPostByCategory(category): void {
    const size = this.pagination.perPage;
    const page = this.pagination.activePage;
    if (category !== 'independentmedia') {
      this.commonService
        .get(
          `${this.apiUrl}channels/posts/${category}?page=${page}&size=${size}`
        )
        .subscribe({
          next: (res: any) => {
            if (res?.data) {
              this.videoList = res.data;
              // this.videoList = this.videoList.concat(res.data);
              this.pagination.totalItems = res?.pagination?.totalItems;
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
    } else if (category === 'independentmedia') {
      const api = `https://api.freedom.buzz/api/v1/channels/`;
      this.commonService
        .post(`${api}posts`, {
          size: size,
          page: page,
        })
        .subscribe({
          next: (res: any) => {
            if (res?.data) {
              this.videoList = res.data;
              this.pagination.totalItems = res?.pagination?.totalItems;
            }
          },
          error: (error) => {
            console.log(error);
          },
        });
    }
  }

  getChannelDetailsById(id): void {
    this.spinner.show();
    const profileParam = this.useDetails?.profileId
      ? `?profileId=${this.useDetails?.profileId}`
      : '';
    this.commonService
      .get(`${this.apiUrl}channels/${id}${profileParam}`)
      .subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.channelDetails = res.data;
          if (this.channelDetails?.id) {
            this.getPostVideosById(this.channelDetails?.id);
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
        },
      });
  }

  getPostVideosById(channelid): void {
    this.commonService
      .post(`${this.apiUrl}channels/my-posts`, {
        id: channelid,
        size: this.pagination.perPage,
        page: this.pagination.activePage,
      })
      .subscribe({
        next: (res: any) => {
          this.videoList = res.data;
          this.pagination.totalItems = res?.pagination?.totalItems;
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  channelSubscribe(subscribe) {
    const data = {
      ProfileId: this.useDetails?.profileId,
      SubscribeChannelId: this.channelDetails?.id,
      channelUserProfileId: this.channelDetails.profileid,
    };
    if (!subscribe) {
      this.channelService.subscribeChannel(data).subscribe({
        next: (res: any) => {
          this.toasterService.success(res.message);
          this.getChannelDetailsById(this.channelDetails?.unique_link);
        },
        error: (error) => {
          console.log(error);
        },
      });
    } else {
      this.channelService.unsubscribeChannel(data).subscribe({
        next: (res: any) => {
          this.toasterService.success(res.message);
          this.getChannelDetailsById(this.channelDetails?.unique_link);
        },
        error: (error) => {
          console.log(error);
        },
      });
    }
  }

  editChannel(channelData) {
    const modalRef = this.modalService.open(CreateChannelComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.title = `Edit Channel Details`;
    modalRef.componentInstance.channelEditData = channelData;
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
