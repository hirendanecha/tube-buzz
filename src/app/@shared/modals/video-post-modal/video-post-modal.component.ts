import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ChannelService } from '../../services/channels.service';

@Component({
  selector: 'app-video-post-modal',
  templateUrl: './video-post-modal.component.html',
  styleUrls: ['./video-post-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPostModalComponent implements OnInit, AfterViewInit {
  @Input() deleteButtonLabel: string = 'Delete';
  @Input() cancelButtonLabel: string = 'Cancel';
  @Input() confirmButtonLabel: string = 'Confirm';
  @Input() title: string = 'Confirmation Dialog';
  @Input() message: string;
  @Input() data: any;
  @Input() communityId: any;
  @Input() channelList: any = [];
  channelCategory$: Observable<any[]>;
  postData: any = {
    id: null,
    profileid: null,
    communityId: null,
    postdescription: '',
    tags: [],
    imageUrl: '',
    videoduration: null,
    thumbfilename: null,
    streamname: '',
    posttype: 'V',
    albumname: '',
    file1: {},
    file2: {},
    keywords: '',
  };
  selectedVideoFile: any;
  selectedThumbFile: any;
  postMessageTags: any[];
  postMessageInputValue: string = '';
  apiUrl = environment.apiUrl + 'posts/create-post';
  isProgress = false;
  progressValue = 0;
  interval: any;
  channelId = null;
  selectedCategory = null;

  streamnameProgress = 0;
  thumbfilenameProgress = 0;
  fileSizeError = false;
  userDetails: any;

  constructor(
    public activeModal: NgbActiveModal,
    private toastService: ToastService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private channelService: ChannelService,
    private authService: AuthService,
    private router: Router,
    public modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    this.userDetails = this.authService.getUserData() as any;
    this.postData.profileid = this.userDetails?.profileId;
    // this.postData.profileid = JSON.parse(
    //   this.authService.getUserData() as any
    // )?.profileId;
    // this.channelId = +localStorage.getItem('channelId');
    // console.log('profileId', this.postData.profileid);
    // console.log('editData', this.data);
    // console.log(this.channelId);
  }

  ngAfterViewInit(): void {
    if (this.data) {
      this.postData.id = this.data.id;
      this.channelId = this.data.channelId
      this.postData.profileid = this.data.profileid;
      this.postData.category = this.data.category;
      this.postData.albumname = this.data.albumname;
      this.postMessageInputValue = this.data?.postdescription;
      this.selectedThumbFile = this.data?.thumbfilename;
      this.selectedVideoFile = this.data?.streamname;
      // this.postData.streamname = this.selectedVideoFile;
      this.postData.thumbfilename = this.selectedThumbFile;
      this.postData.videoduration = this.data?.videoduration;
      this.postData.keywords = this.data?.keywords;
    }
  }
  ngOnInit(): void {
    this.channelCategory$ = this.getChannelCategory();
    if (!this.channelList || !this.channelList.length) {
      const userId = this.userDetails?.Id;
      const apiUrl = `${environment.apiUrl}channels/get-channels/${userId}`;
      this.commonService.get(apiUrl).subscribe(
        (res) => {
          this.channelList = res.data;
        }
      )
      // this.channelService.getMyChannels();
    }
    // this.channelService.myChannels$.subscribe(channels => {
    //   this.channelList = channels;
    //   console.log(this.channelList);
      
    // });
  }

  uploadImgAndSubmit(): void {
    console.log(this.postData);
    
    if (
      this.postData?.profileid &&
      this.postData.postdescription &&
      this.postData.albumname &&
      (this.postData.file1 || this.selectedVideoFile) &&
      (this.postData.file2 || this.selectedThumbFile)
    ) {
      this.postData['channelId'] = this.channelId || null;
      if (this.postData?.file1?.name || this.postData?.file2?.name) {
        if (this.postData?.file1?.name) {
          this.isProgress = true;
          this.commonService.upload(this.postData?.file1).subscribe((event) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.streamnameProgress = Math.round(
                (100 * event.loaded) / event.total
              );
              this.cdr.markForCheck();
              this.progressValue = this.streamnameProgress;
              // console.log(`Streamname Progress: ${this.streamnameProgress}%`);
            } else if (event.type === HttpEventType.Response) {
              if (event.body?.url) {
                this.postData['file1'] = null;
                this.postData['streamname'] = event.body.url;
                if (
                  !this.postData.id &&
                  this.thumbfilenameProgress === 100 &&
                  this.streamnameProgress === 100
                ) {
                  this.createPost();
                } else if (
                  this.postData.id &&
                  this.streamnameProgress === 100
                ) {
                  this.createPost();
                }
              }
            }
          });
        }
        if (this.postData?.file2?.name) {
          if (this.postData.id) {
            this.spinner.show();
          }
          this.commonService.upload(this.postData?.file2).subscribe((event) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.thumbfilenameProgress = Math.round(
                (100 * event.loaded) / event.total
              );
              // console.log(
              //   `Thumbfilename Progress: ${this.thumbfilenameProgress}%`
              // );
            } else if (event.type === HttpEventType.Response) {
              if (event.body?.url) {
                this.postData['file2'] = null;
                this.postData['thumbfilename'] = event.body.url;
              }
              if (
                this.postData?.id &&
                this.thumbfilenameProgress === 100 &&
                !this.streamnameProgress
              ) {
                this.spinner.hide();
                this.postData.streamname = this.selectedVideoFile;
                this.createPost();
              }
            }
          });
        }
      } else {
        if (this.postData?.id) {
          this.postData.streamname = this.selectedVideoFile;
          this.postData.thumbfilename = this.selectedThumbFile;
          this.createPost();
        }
      }
    } else {
      this.toastService.danger('Please enter mandatory fields(*) data.');
    }
  }

  onTagUserInputChangeEvent(data: any): void {
    this.postData.postdescription = data?.html;
    this.postMessageTags = data?.tags;
  }

  getTagUsersFromAnchorTags = (anchorTags: any[]): any[] => {
    const tags = [];
    for (const key in anchorTags) {
      if (Object.prototype.hasOwnProperty.call(anchorTags, key)) {
        const tag = anchorTags[key];

        tags.push({
          id: tag?.getAttribute('data-id'),
          name: tag?.innerHTML,
        });
      }
    }

    return tags;
  };

  createPost(): void {
    this.spinner.show();
    if (
      this.postData.streamname &&
      this.postData.thumbfilename &&
      this.postData.postdescription &&
      this.postData.albumname
    ) {
      this.postData['channelId'] = this.channelId || null;
      this.postData['categoryName'] = this.selectedCategory || null;
      console.log('post-data', this.postData);
      this.commonService.post(this.apiUrl, this.postData).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          // this.postData = null;
          if (this.postData.id) {
            this.toastService.success('Post updated successfully');
            this.activeModal.close();
          } else {
            this.toastService.success('Post created successfully');
            this.activeModal.close('success');
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastService.danger('Something went wrong please try again!');
        },
      });
      // this.socketService.createOrEditPost(this.postData, (data) => {
      //   this.spinner.hide();
      //   this.toastService.success('Post created successfully.');
      //   this.postData = null;
      //   return data;
      // });
    } else {
      this.spinner.hide();
      // this.toastService.danger('Please enter mandatory fields(*) data.');
    }
  }

  deletePost(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.message = `Are you sure want to this video?`;
    modalRef.componentInstance.confirmButtonLabel = 'Delete';
    modalRef.componentInstance.cancelButtonLabel = 'Cancel';
    modalRef.result.then((res) => {
      // console.log(res);
      if (res === 'success') {
        const postId = this.postData.id;
        this.commonService
          .delete(`${environment.apiUrl}posts/${postId}`)
          .subscribe({
            next: (res: any) => {
              this.toastService.success('Post delete successfully');
              this.activeModal.close();
              window.location.reload();
            },
            error: (res: any) => {
              this.toastService.danger('Something went wrong please try again');
            },
          });
      }
    });
  }

  onSelectedVideo(event: any) {
    // const maxSize = 2*10^9;
    // const maxSize = 2147483648; //2GB
    const maxSize = 10737418240; //10GB
    if (event.target?.files?.[0].size < maxSize) {
      this.fileSizeError = false;
      if (event.target?.files?.[0].type.includes('video/mp4')) {
        this.postData.file1 = event.target?.files?.[0];
        this.selectedVideoFile = URL.createObjectURL(event.target.files[0]);
        const videoSize = this.postData.file1.size;
        console.log(videoSize);
      } else {
        this.toastService.warring('please upload only mp4 files');
      }
    } else {
      this.toastService.warring('Maximum video size allowed is 10 GB.');
      this.fileSizeError = true;
    }
  }

  onFileSelected(event: any) {
    this.postData.file2 = event.target?.files?.[0];
    this.selectedThumbFile = URL.createObjectURL(event.target.files[0]);
  }

  removePostSelectedFile(): void {
    this.selectedThumbFile = null;
  }

  removeVideoSelectedFile(): void {
    this.selectedVideoFile = null;
  }

  onvideoPlay(e: any): void {
    this.postData.videoduration = Math.round(e?.target?.duration);
  }

  goToHome(): void {
    this.activeModal.close();
    location.reload();
  }

  onChangeTag(event) {
    this.postData.keywords = event.target.value.replaceAll(' ', ',');
  }

  selectChannel(channelId): void {
    this.channelId = channelId;
    // console.log(this.channelId);
  }

  selectCategory(category): void {
    this.selectedCategory = category;
    // console.log(category);
  }

  getChannelCategory(): Observable<any[]> {
    return this.channelService.getCategory();
  }
}
