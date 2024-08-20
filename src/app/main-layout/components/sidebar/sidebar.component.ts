import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ShareService } from 'src/app/@shared/services/share.service';
import { environment } from '../../../../environments/environment';
import { CommonService } from 'src/app/@shared/services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { BreakpointService } from 'src/app/@shared/services/breakpoint.service';
import { CreateChannelComponent } from 'src/app/@shared/modals/create-channel/create-channel-modal.component';
import { ChannelService } from 'src/app/@shared/services/channels.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  channel: any;
  featuredChannels: any;
  subscriptionsChannels: any = [];
  useDetails: any = {};
  backCanvas: boolean = true;
  apiUrl = environment.apiUrl + 'channels/';
  profileId: number;

  constructor(
    public shareService: ShareService,
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public authService: AuthService,
    public breakpointService: BreakpointService,
    private offcanvasService: NgbOffcanvas,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const channelId = this.route.snapshot.paramMap.get('id');
    this.profileId = +localStorage.getItem('profileId');
    this.channel = this.channelService.getChannelById(channelId);
    this.backCanvas = this.offcanvasService.hasOpenOffcanvas();
    this.channelService.getChannels();
    this.getSubscribeChannels();
    this.getChannels();
  }

  getChannels(): void {
    this.channelService.channels$.subscribe((channels) => {
      this.featuredChannels = channels;
    });
  }

  navigateToChannel(channel: any) {
    // console.log(channel);
    // this.router.navigate([`home/${channel?.unique_link}`, { data: channel }]);

    // this.router.navigate([`channel/${channel?.unique_link}`], {
    //   state: { data: channel },
    // });
    this.offcanvasService.dismiss();
  }

  isUserMediaApproved(): boolean {
    return this.useDetails?.MediaApproved === 1;
  }

  createChannel(): void {
    const modalRef = this.modalService.open(CreateChannelComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.title = `Create Channel`;
    modalRef.componentInstance.confirmButtonLabel = 'Save';
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.result.then((res) => {
      if (res === 'success') {
        // this.channelService.getChannels();
        // this.getChannels();
      }
    });
  }

  getSubscribeChannels(): void {
    this.commonService
      .get(
        `${environment.apiUrl}subscribe/getSubscribedChannel/${this.profileId}`
      )
      .subscribe({
        next: (res) => {
          this.subscriptionsChannels = res;
        },
        error(err) {
          console.log(err);
        },
      });
  }
}
