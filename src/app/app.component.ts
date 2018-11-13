import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { MediaMatcher } from '@angular/cdk/layout';

import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  title = 'web-rubik-solver';

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  action = '';
  path = '';

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    router: Router,
    route: ActivatedRoute,
    public socketService: SocketService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.action = route.snapshot.firstChild.routeConfig.data.title || 'Unknown';
        this.path = route.snapshot.firstChild.routeConfig.path || 'Unknown';
      }
    });

  }

  ngOnInit() {
    this.initIoConnection();
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  private initIoConnection(): void {
    this.socketService.initSocket();
  }

}

// @ts-ignore
Array.prototype.equals = function (array) {
  // if the other array is a falsy value, return
  if (!array) {
    return false;
  }
  // compare lengths - can save a lot of time
  if (this.length !== array.length) {
    return false;
  }
  for (let i = 0, l = this.length; i < l; i++) {
    // Check if we have nested arrays
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // recurse into the nested arrays
      if (!this[i].equals(array[i])) {
        return false;
      }
    } else if (this[i] !== array[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};
// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'equals', { enumerable: false });
