import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/@shared/services/auth.service';
import { CommonService } from 'src/app/@shared/services/common.service';
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
    public authService: AuthService,
    private router: Router
  ) {
    this.router.events.subscribe((event: any) => {
      const name = event?.routerEvent?.url.split('/')[2];
      if (name) {
        this.getChannelDetailsById(String(name));
      }
    });

    this.useDetails = JSON.parse(this.authService.getUserData() as any);
    if (this.useDetails?.MediaApproved === 1) {
      return;
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit(): void { }

  getChannelDetailsById(id): void {
    this.commonService.get(`${this.apiUrl}channels/${id}`).subscribe({
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
      .post(`${this.apiUrl}channels/posts`, {
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

  channelSubscribe(){
    
  }
}
