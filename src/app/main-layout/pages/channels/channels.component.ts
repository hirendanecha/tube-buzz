import { AfterViewInit, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { CommonService } from 'src/app/@shared/services/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent implements OnInit, AfterViewInit {
  userData: any
  apiUrl = environment.apiUrl + 'channels'
  channelList: any = []
  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.userData = JSON.parse(this.authService.getUserData() as any);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    // this.userData = this.authService.userDetails;
    // console.log('user', this.userData);
    this.getChannelByUserId();
  }

  getChannelByUserId(): void {
    const userId = this.userData.UserID;
    const apiUrl = `${environment.apiUrl}channels/get-channels/${userId}`;
    this.commonService.get(apiUrl).subscribe({
      next: (res) => {
        this.channelList = res.data;
        let channelIds = this.channelList.map(e => e.id);
        localStorage.setItem('get-channels', JSON.stringify(channelIds));
      },
      error(err) {
        console.log(err);
      },
    });
  }
}
