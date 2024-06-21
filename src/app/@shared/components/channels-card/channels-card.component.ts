import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-channels-card',
  templateUrl: './channels-card.component.html',
  styleUrls: ['./channels-card.component.scss'],
})
export class ChannelsCardComponent implements OnInit {
  @Input() channelList: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void { }

  openChannelDetailPage(channel: any): void {
    this.router.navigate([`channels/${channel.unique_link}`], {
      state: { data: channel }
    }).then(()=>{})
  }
}
