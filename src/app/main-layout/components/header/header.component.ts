import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointService } from 'src/app/@shared/services/breakpoint.service';
import { ShareService } from 'src/app/@shared/services/share.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonService } from 'src/app/@shared/services/common.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { VideoPostModalComponent } from 'src/app/@shared/modals/video-post-modal/video-post-modal.component';
import { NotificationsModalComponent } from '../notifications-modal/notifications-modal.component';
import { ToastService } from 'src/app/@shared/services/toast.service';
import { CustomerService } from 'src/app/@shared/services/customer.service';
import { CreateChannelComponent } from 'src/app/@shared/modals/create-channel/create-channel-modal.component';
import { ChannelService } from 'src/app/@shared/services/channels.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  userDetails: any;
  apiUrl = environment.apiUrl + 'customers/logout';
  userMenusOverlayDialog: any;
  channelList: any = [];

  constructor(
    public shareService: ShareService,
    private breakpointService: BreakpointService,
    private offcanvasService: NgbOffcanvas,
    private customerService: CustomerService,
    public authService: AuthService,
    private router: Router,
    private commonService: CommonService,
    private channelService: ChannelService,
    private toastService: ToastService,
    private modalService: NgbModal
  ) {
    const isRead = localStorage.getItem('isRead');
    if (isRead === 'N') {
      this.shareService.isNotify = true;
    }
  }

  ngOnInit(): void {
    this.userDetails = JSON.parse(this.authService.getUserData() as any);
  }

  ngAfterViewInit(): void {}

  myAccountNavigation(): void {
    const id = this.shareService.userDetails.Id;
    // location.href = `https://freedom.buzz/settings/view-profile/${id}`;
    const url = `https://tube.buzz/settings/view-profile/${id}`;
    window.open(url, '_blank');
  }

  toggleSidebar(): void {
    if (this.breakpointService.screen.getValue().md.gatherThen) {
      this.shareService.toggleSidebar();
    } else {
      this.offcanvasService.open(SidebarComponent);
    }
  }

  logout(): void {
    // this.isCollapsed = true;
    // this.cookieService.delete('auth-user', '/', environment.domain);
    // location.href = environment.logoutUrl;
    // location.href = "https://freedom-api.opash.in/api/v1/customers/logout";
    this.customerService.logout().subscribe({
      next: (res) => {
        const theme = localStorage.getItem('theme');
        localStorage.clear();
        sessionStorage.clear();
        this.toastService.success('Logout successfully');
        localStorage.setItem('theme', theme);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  isUserMediaApproved(): boolean {
    return this.userDetails?.MediaApproved === 1;
  }

  // openVideoUploadPopUp(): void {
  //   const modalRef = this.modalService.open(VideoPostModalComponent, {
  //     centered: true,
  //     size: 'lg',
  //   });
  //   modalRef.componentInstance.title = `Upload Video`;
  //   modalRef.componentInstance.confirmButtonLabel = 'Upload Video';
  //   modalRef.componentInstance.cancelButtonLabel = 'Cancel';
  //   modalRef.result.then((res) => {
  //     console.log(res);
  //   });
  // }

  openNotificationsModal(): void {
    this.userMenusOverlayDialog = this.modalService.open(
      NotificationsModalComponent,
      {
        keyboard: true,
        modalDialogClass: 'notifications-modal',
      }
    );
  }

  openVideoUploadPopUp(): void {
    const modalRef = this.modalService.open(VideoPostModalComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.title = `Upload Video`;
    modalRef.componentInstance.confirmButtonLabel = 'Upload Video';
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.componentInstance.channelList = this.channelList;
    modalRef.result.then((res) => {
      if (res === 'success') {
        window.location.reload();
      }
    });
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
      }
    });
  }

  getChannels(): void {
    const userId = this.userDetails?.UserID;
    this.channelService.getMyChannels();
    this.channelService.myChannels$.subscribe(channels => {
      this.channelList = channels;
    });
    // const apiUrl = `${environment.apiUrl}channels/get-channels/${userId}`;
    // this.commonService.get(apiUrl).subscribe({
    //   next: (res) => {
    //     this.channelList = res.data;
    //     let channelIds = this.channelList.map((e) => e.id);
    //     localStorage.setItem('get-channels', JSON.stringify(channelIds));
    //     // console.log(this.channelList);
    //   },
    //   error(err) {
    //     console.log(err);
    //   },
    // });
  }
}
