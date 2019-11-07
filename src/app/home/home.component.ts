import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CubeService } from '../services/cube.service';

import { Message } from '../models/message';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cube') cubeCanvasElement: any;
  cube: CubeService;
  canvasSize: 400;

  constructor(public socketService: SocketService) {}

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.cube = new CubeService(this.cubeCanvasElement);
    this.socketService.send(new Message('getString', ''));
    this.socketService.send(new Message('searchSolutions', ''));
  }

  ngOnDestroy() {
    this.cube.destroy();
    // this.messageListener.unsubscribe();
    // clearInterval(this.intervalTimer);
  }

}
