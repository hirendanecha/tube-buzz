import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
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
export class SingleChannelComponent implements OnInit {
  useDetails: any = {};
  channelDetails: any = {};
  videoList: any = [];
  apiUrl = environment.apiUrl;
  activeTab = 1;
  constructor(
    private commonService: CommonService,
    private channelService: ChannelService,
    public authService: AuthService,
    private toasterService: ToastService,
    public shareService: ShareService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.router.events.subscribe((event: any) => {
      const name = event?.routerEvent?.url.split('/')[2];
      if (name) {
        this.getChannelDetailsById(String(name));
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

  getChannelDetailsById(id): void {
    const profileParam = this.useDetails?.profileId ? `?profileId=${this.useDetails?.profileId}` : '';
    this.commonService
      .get(`${this.apiUrl}channels/${id}${profileParam}`)
      .subscribe({
        next: (res: any) => {
          this.channelDetails = res.data;
          if (this.channelDetails?.id) {
            this.getPostVideosById(this.channelDetails?.id);
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  getPostVideosById(channelid): void {
    this.commonService
      .post(`${this.apiUrl}channels/my-posts`, {
        id: channelid,
        size: 10,
        page: 1,
      })
      .subscribe({
        next: (res: any) => {
          this.videoList = res.data;
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

  editChannel(channelData){
    const modalRef = this.modalService.open(CreateChannelComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.title = `Edit Channel Details`;
    modalRef.componentInstance.channelEditData = channelData;
  }
}
