import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import FastAverageColor from 'fast-average-color/dist/index.es6';
import { CubeService } from '../services/cube.service';

import { Message } from '../models/message';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit, AfterViewInit, OnDestroy {

  // @ViewChild('container') containerElement: any;
  @ViewChild('camera') canvasElement: any;
  @ViewChild('cube') cubeCanvasElement: any;
  video: any;
  canvas: any;

  cube: CubeService;
  cubeX = 0;
  cubeY = 0;

  cameraTick: any;
  cameraStarted = false;

  canSolve = false;

  fac: FastAverageColor;
  pickersCenterPosition: Array<Array<number>>;
  canvasSize = 400;
  cubeOffsetX = 0;
  cubeOffsetY = 0;
  brickSize = 60;

  detectedColors = [
    '', '', '',
    '', '', '',
    '', '', '',
  ];

  faceIndex = 0;

  hsvRanges = {
    blue: {
      max: [0.75, 1, 0.8],
      min: [0.50, 0, 0.15]
    },
    orange: {
      max: [0.12, 1, 0.8],
      min: [0.059, 0, 0.15]
    },
    orangered: {
      max: [0.06, 1, 0.8],
      min: [0, 0, 0.15]
    },
    red: {
      max: [1, 1, 0.8],
      min: [0.93, 0, 0.15]
    },
    yellow: {
      max: [0.19, 1, 0.8],
      min: [0.13, 0, 0.15]
    },
    green: {
      max: [0.40, 1, 0.8],
      min: [0.24, 0, 0.15]
    },
    white: {
      max: [1, 1, 1],
      min: [0, 0, 0.4]
    }
  };

  scanSequence = [
    'white',
    'blue',
    'red',
    'yellow',
    'green',
    'orange'
  ];

  messageListener: Subscription;

  applyFake() {
    // this.cube.applyString('bgwowwywrybbgorwwyrrgybygggooroyoororbbbrryywowwggybbg');
    this.cube.applyString('wwwwwwrrrbbbbbbbbbrryrryrryoooyyyyyygggggggggwoowoowoo');
    // this.cube.applyString('wwwwwwwwwbbbbbbbbbrrrrrrrrryyyyyyyyygggggggggooooooooo');
    this.faceIndex = 4;
    this.nextFace();
  }

  updateHsl(color, parm, maxmin, value) {
    const parm2int = {
      'H': 0,
      'S': 1,
      'L': 2
    };
    this.hsvRanges[color][maxmin][parm2int[parm]] = value;
  }

  constructor(public snackBar: MatSnackBar, public socketService: SocketService, private router: Router) {
    this.fac = new FastAverageColor();
    this.messageListener = this.socketService.onMessage()
      .subscribe((message: Message) => {
        console.log(message);
      });
  }

  ngOnInit() {
    // this.canvasSize = Math.min(this.containerElement.nativeElement.offsetWidth, this.containerElement.nativeElement.offsetHeight) - 32;
    const step = this.canvasSize / 6;
    this.pickersCenterPosition = [
      [step + this.cubeOffsetX, step + this.cubeOffsetY], [3 * step + this.cubeOffsetX, step + this.cubeOffsetY],
      [5 * step + this.cubeOffsetX, step + this.cubeOffsetY], [step + this.cubeOffsetX, 3 * step + this.cubeOffsetY],
      [3 * step + this.cubeOffsetX, 3 * step + this.cubeOffsetY], [5 * step + this.cubeOffsetX, 3 * step + this.cubeOffsetY],
      [step + this.cubeOffsetX, 5 * step + this.cubeOffsetY], [3 * step + this.cubeOffsetX, 5 * step + this.cubeOffsetY],
      [5 * step + this.cubeOffsetX, 5 * step + this.cubeOffsetY]
    ];
    // this.pickersCenterPosition = [[step + this.cubeOffsetX, step + this.cubeOffsetY]];
    this.canvas = this.canvasElement.nativeElement.getContext('2d');
    this.video = document.createElement('video');
  }

  ngAfterViewInit() {
    this.cube = new CubeService(this.cubeCanvasElement);
    // this.renderFace(0);
    this.cube.idle();
    this.resetCanvas();
  }

  resetCanvas() {
    this.canvas.fillStyle = 'DarkSlateGray';
    this.canvas.fillRect(0, 0, this.canvasSize, this.canvasSize);
    this.canvas.font = '35px Arial';
    this.canvas.fillStyle = 'LightGray';
    this.canvas.textAlign = 'center';
    this.canvas.fillText('Click to activate camera', this.canvasSize / 2, this.canvasSize / 2);
  }

  replaceAt(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
  }

  catchColors() {
    if (!this.cameraStarted) {
      return;
    }
    const colorsChar = [];
    for (let i = 0; i < 9; i++) {
      if (this.detectedColors[i] === 'orangered') {
        colorsChar.push('r');
      } else if (this.detectedColors[i] === 'grey') {
        this.snackBar.open('Some blocks haven\'t been recognized', '', { duration: 2000 });
        return;
      } else {
        colorsChar.push(this.detectedColors[i].charAt(0));
      }
    }

    if (this.faceIndex === 0) {
      let stringIndex = 0;
      for (const colorIndex of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        this.cube.cubeString = this.replaceAt(this.cube.cubeString, stringIndex++, colorsChar[colorIndex]);
      }
    } else if (this.faceIndex === 1) {
      let stringIndex = 9;
      for (const colorIndex of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        this.cube.cubeString = this.replaceAt(this.cube.cubeString, stringIndex++, colorsChar[colorIndex]);
      }
    } else if (this.faceIndex === 2) {
      let stringIndex = 18;
      for (const colorIndex of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        this.cube.cubeString = this.replaceAt(this.cube.cubeString, stringIndex++, colorsChar[colorIndex]);
      }
    } else if (this.faceIndex === 3) {
      let stringIndex = 27;
      for (const colorIndex of [2, 5, 8, 1, 4, 7, 0, 3, 6]) {
        this.cube.cubeString = this.replaceAt(this.cube.cubeString, stringIndex++, colorsChar[colorIndex]);
      }
    } else if (this.faceIndex === 4) {
      let stringIndex = 36;
      for (const colorIndex of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        this.cube.cubeString = this.replaceAt(this.cube.cubeString, stringIndex++, colorsChar[colorIndex]);
      }
    } else if (this.faceIndex === 5) {
      let stringIndex = 45;
      for (const colorIndex of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
        this.cube.cubeString = this.replaceAt(this.cube.cubeString, stringIndex++, colorsChar[colorIndex]);
      }
    }
    console.log(this.cube.cubeString, this.detectedColors);
    this.cube.applyString(this.cube.cubeString);
    if (!this.nextFace()) {
      this.cube.idle();
    }
    this.cube.checkSolve();
  }

  prevFace() {
    this.canSolve = this.cube.checkSolve();
    if (this.faceIndex > 0) {
      this.cube.stopIdle(--this.faceIndex);
      return true;
    }
    return false;
  }

  nextFace() {
    this.canSolve = this.cube.checkSolve();
    if (this.faceIndex < 5) {
      this.cube.stopIdle(++this.faceIndex);
      return true;
    }
    return false;
  }

  colorDetector(hsl) {
    // console.clear();
    for (const key in this.hsvRanges) {
      if (this.hsvRanges.hasOwnProperty(key)) {
        const color = this.hsvRanges[key];
        let match = true;
        for (let i = 0; i < 3; i++) {
          if (hsl[i] > color.max[i] || hsl[i] < color.min[i]) {
            match = false;
            break;
          }
        }
        if (match) {
          // console.log('found', key, color.min, '<', hsl, '<', color.max);
          return key;
        }
        //  else {
        //   console.log('NOT', key, color.min, '<', hsl, '<', color.max);
        // }
      }
    }
    return 'grey';
  }

  rgbToHsl(rgb) {
    const r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  startCamera() {
    if (this.cameraStarted) {
      this.stopCamera();
      return;
    }
    this.cube.stopIdle(this.faceIndex);
    this.initCamera({ video: { facingMode: 'environment', width: this.canvasSize, height: this.canvasSize } });
    this.cameraStarted = true;
  }

  stopCamera() {
    clearTimeout(this.cameraTick);
    if (this.video.srcObject != null) {
      this.video.srcObject.getTracks()[0].stop();
      this.cameraStarted = false;
    }
    this.resetCanvas();
  }

  initCamera(config: any) {
    const browser = <any>navigator;

    browser.getUserMedia = browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia;

    browser.mediaDevices.getUserMedia(config)
      .then(stream => {
        this.video.srcObject = stream;
        this.video.onloadedmetadata = () => {
          // this.canvas.width = this.video.videoWidth;
          // this.canvas.height = this.video.videoHeight;
          // this.canvas.width = 400;
          // this.canvas.height = 400;
          this.video.play();
          this.cameraTick = setInterval(() => {
            this.canvas.drawImage(this.video, 0, 0);
            for (let i = 0; i < 9; i++) {
              const picker = this.pickersCenterPosition[i];
              let color, hsl;
              if (i !== 4) {
                hsl = this.rgbToHsl(this.fac.getColor(this.canvasElement.nativeElement, {
                  mode: 'fast',
                  left: picker[0] - this.brickSize / 2,
                  top: picker[1] - this.brickSize / 2,
                  width: this.brickSize,
                  height: this.brickSize
                }).value);
                color = this.colorDetector(hsl);
              } else {
                color = this.scanSequence[this.faceIndex];
              }
              this.canvas.beginPath();
              this.canvas.lineWidth = '10';
              if (color === 'orangered') {
                color = 'red';
              }
              this.canvas.strokeStyle = color;
              this.canvas.rect(picker[0] - this.brickSize / 2, picker[1] - this.brickSize / 2, this.brickSize, this.brickSize);
              this.canvas.stroke();
              this.detectedColors[i] = color;
              if (i === 8) {
                console.log(hsl);

              }
              // this.canvas.font = '20px Arial';
              // this.canvas.fillText(hsl, picker[0], picker[1] + this.brickSize);
            }
          }, 1000 / 20);
        };
      });
  }

  solve() {
    this.socketService.send(new Message('setString', this.cube.cubeString));
    this.router.navigateByUrl('/');
  }

  ngOnDestroy() {
    this.stopCamera();
    this.messageListener.unsubscribe();
  }

}
