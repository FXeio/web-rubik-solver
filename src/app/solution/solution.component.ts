import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CubeService } from '../services/cube.service';

import { Message } from '../models/message';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-solution',
  templateUrl: './solution.component.html',
  styleUrls: ['./solution.component.scss']
})
export class SolutionComponent implements OnInit, AfterViewInit, OnDestroy {

  canvasSize = 400;
  @ViewChild('cube') cubeCanvasElement: any;
  cube: CubeService;

  messageListener: Subscription;

  constructor(public socketService: SocketService) {
    this.messageListener = this.socketService.onMessage()
      .subscribe((m: Message) => {
        console.log(m);
        if (m.action === 'move') {
          this.cube.stopIdle();
          this.cube.renderPos(-145, 225);
          this.cube.move(m.content);
        } else if (m.action === 'setString') {
          this.cube.applyString(m.content);
          this.cube.idle();
        }
      });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.cube = new CubeService(this.cubeCanvasElement);
    this.socketService.send(new Message('getString', ''));
  }

  ngOnDestroy() {
    this.messageListener.unsubscribe();
  }

  solve() {
    // this.cube.stopIdle();
    // this.cube.renderPos(30, -45);
    // this.cube.anim();
    this.socketService.send(new Message('solve', ''));
  }

  mv(mov) {
    this.cube.stopIdle();
    this.cube.renderPos(-145, 225);
    this.cube.move(mov);
  }

}
