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

  minMoves = Infinity;
  moves;
  totalTime = 0;
  intervalTimer;
  startTime;
  bestSolutionString = 'The cube is being solved...';

  constructor(public socketService: SocketService) {
    this.messageListener = this.socketService.onMessage()
      .subscribe(async (m: Message) => {
        console.log(m);
        if (m.action === 'move') {
          this.startTimer();
          this.cube.stopIdle();
          this.cube.renderPos(-145, 225);
          await this.cube.move(m.content);
          this.cube.idle();
        } else if (m.action === 'setString') {
          this.cube.applyString(m.content);
          this.cube.idle();
        } else if (m.action === 'solution') {
          const len = m.content.split(' ').length;
          if (len < this.minMoves) {
            this.bestSolutionString = `Best solution found: ${len} moves`;
            this.moves = m.content.toUpperCase();
          }
        } else if (m.action === 'totalTime') {
          this.stopTimer();
          this.totalTime = Number(m.content);
        }
      });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.cube = new CubeService(this.cubeCanvasElement);
    this.socketService.send(new Message('getString', ''));
    this.socketService.send(new Message('searchSolutions', ''));
  }

  ngOnDestroy() {
    this.cube.destroy();
    this.messageListener.unsubscribe();
    clearInterval(this.intervalTimer);
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

  startTimer() {
    this.startTime = Date.now();
    this.intervalTimer = setInterval(() => {
      this.totalTime = Date.now() - this.startTime;
    }, 7);
  }

  stopTimer() {
    clearInterval(this.intervalTimer);
  }

}
