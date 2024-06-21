import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastService } from '../../services/toast.service';
import { ChannelService } from '../../services/channels.service';
import { AuthService } from '../../services/auth.service';
import { UploadFilesService } from '../../services/upload-files.service';


@Component({
  selector: 'app-create-channel-modal',
  templateUrl: './create-channel-modal.component.html',
  styleUrls: ['./create-channel-modal.component.scss'],
})
export class CreateChannelComponent {
  userForm = new FormGroup({
    profileid: new FormControl(),
    profile_pic_name: new FormControl(''),
    feature: new FormControl(false),
    firstname: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    unique_link: new FormControl({ value: '', disabled: true }),
  });
  profileImg: any = {
    file: null,
    url: '',
  };
  selectedFile: any;
  myProp: string;
  hasDisplayedError = false;
  profileId: number;

  constructor(
    private spinner: NgxSpinnerService,
    public toastService: ToastService,
    public activateModal: NgbActiveModal,
    private channelService: ChannelService,
    private uploadFilesService: UploadFilesService,
    public authService: AuthService,
  ) {
    this.profileId = JSON.parse(this.authService.getUserData() as any).profileId;
  }

  ngOnInit(): void {}

  slugify = (str: string) => {
    return str?.length > 0
      ? str
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      : '';
  };

  onChannelNameChange(): void {
    this.userForm.get('unique_link').enable();
    const channelName = this.userForm.get('firstname').value;
    const uniqueLink = this.slugify(channelName);
    this.userForm.get('unique_link').setValue(uniqueLink);
  }

  saveChanges(): void {
    this.userForm.get('profileid').setValue(this.profileId)
    if (this.userForm.valid) {
      this.spinner.show();
      this.channelService.createChannel(this.userForm.value).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.activateModal.close('success');
          this.toastService.success('Channel created successfully');
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err);
        },
      });
    }
  }

  upload() {
    this.spinner.show();
    if (this.profileImg.file) {
      this.uploadFilesService.uploadFile(this.profileImg.file).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.body) {
            const profilePic = res?.body?.url;
            this.userForm.get('profile_pic_name').setValue(profilePic);
            this.saveChanges();
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.profileImg = {
            file: null,
            url: '',
          };
        },
      });
    } else {
      this.toastService.danger('Please select channel logo!');
    }
  }

  onFileSelected(event: any) {
    this.profileImg.file = event.target?.files?.[0];
    this.selectedFile = URL.createObjectURL(event.target.files[0]);
  }

  removePostSelectedFile(): void {
    this.selectedFile = null;
    this.profileImg = {
      file: null,
      url: '',
    };
  }
}
