import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonButton,
  IonButtons,
  IonInput,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, exitOutline, personAdd } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonButton,
    IonButtons,
    FormsModule,
    CommonModule,
    IonIcon,
  ],
})
export class FeedPage implements OnInit {
  posts: any[] = [];
  base = 'http://20.20.3.187/storage/';

  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;
  friendId: number | null = null;

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
  ) {
    addIcons({ cameraOutline, personAdd, exitOutline });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFeed().subscribe(res => this.posts = res.data ?? res);
  }

  like(p: any) {
    this.api.likePost(p.id).subscribe(() => this.load());
  }

  goNewPost(ev?: Event) {
    (ev?.target as HTMLElement)?.blur();
    this.router.navigateByUrl('/new-post');
  }

  goFriends(ev?: Event) {
    (ev?.target as HTMLElement)?.blur();
    this.router.navigateByUrl('/friends');
  }

  imgUrl(path: string) {
    return this.base + path;
  }

  openComments(p: any) {
    this.selectedPost = p;
    this.showComments = true;
    this.api.getComments(p.id).subscribe(res => this.comments = res);
  }

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe(res => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  addFriend() {
    if (!this.friendId) return;
    this.api.sendFriendRequest(this.friendId).subscribe(_ => {
      this.friendId = null;
    });
  }

  closeComments() {
    this.showComments = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  logout(ev?: Event) {
    (ev?.target as HTMLElement)?.blur();

    this.auth.logoutRemote()?.subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }
}