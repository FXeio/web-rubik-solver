import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import FastAverageColor from 'fast-average-color/dist/index.es6';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.component.html',
  styleUrls: ['./scanner.component.scss']
})
export class ScannerComponent implements OnInit, OnDestroy {

  @ViewChild('camera') canvasElement: any;
  video: any;
  canvas: any;

  tick: any;

  fac: FastAverageColor;
  pickersCenterPosition: Array<Array<number>>;
  cubeSize = 400;
  cubeOffsetX = 0;
  cubeOffsetY = 0;
  brickSize = 60;

  hsvRanges = {
    white: {
      max: [1, 1, 1],
      min: [0, 0, 0.8]
    },
    blue: {
      max: [0.7520891364902507, 1, 0.65],
      min: [0.5654596100278552, 0.3, 0.3]
    },
    orangered: {
      max: [0.055710306406685235, 1, 0.65],
      min: [0, 0.3, 0.3]
    },
    red: {
      max: [1, 1, 0.65],
      min: [0.9331476323119777, 0.3, 0.3]
    },
    yellow: {
      max: [0.1894150417827298, 1, 0.65],
      min: [0.12534818941504178, 0.3, 0.3]
    },
    green: {
      max: [0.403899721448468, 1, 0.65],
      min: [0.23676880222841226, 0.3, 0.3]
    },
    orange: {
      max: [0.11977715877437325, 1, 0.65],
      min: [0.07242339832869081, 0.3, 0.3]
    }
  };

  constructor() {
    this.fac = new FastAverageColor();
    const step = this.cubeSize / 6;
    this.pickersCenterPosition = [
      [step + this.cubeOffsetX, step + this.cubeOffsetY], [3 * step + this.cubeOffsetX, step + this.cubeOffsetY],
      [5 * step + this.cubeOffsetX, step + this.cubeOffsetY], [step + this.cubeOffsetX, 3 * step + this.cubeOffsetY],
      [3 * step + this.cubeOffsetX, 3 * step + this.cubeOffsetY], [5 * step + this.cubeOffsetX, 3 * step + this.cubeOffsetY],
      [step + this.cubeOffsetX, 5 * step + this.cubeOffsetY], [3 * step + this.cubeOffsetX, 5 * step + this.cubeOffsetY],
      [5 * step + this.cubeOffsetX, 5 * step + this.cubeOffsetY]
    ];
    // this.pickersCenterPosition = [[step + this.cubeOffsetX, step + this.cubeOffsetY]];

    // for (const key in this.hsvRanges) {
    //   if (this.hsvRanges.hasOwnProperty(key)) {
    //     const color = this.hsvRanges[key];
    //     for (let i = 0; i < 3; i++) {
    //       color.max[i] = color.raw[i] + color.raw[i] * .02;
    //       color.min[i] = color.raw[i] - color.raw[i] * .02;
    //     }
    //   }
    // }
    console.log(this.hsvRanges);
  }

  ngOnInit() {
    this.video = document.createElement('video');
    this.canvas = this.canvasElement.nativeElement.getContext('2d');
  }

  colorDetector(hsl) {
    console.clear();
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
    this.initCamera({ video: { facingMode: 'environment', width: 400, height: 400 } });
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
          this.canvas.width = 400;
          this.canvas.height = 400;
          this.video.play();
          this.tick = setInterval(() => {
            this.canvas.drawImage(this.video, 0, 0);
            for (const picker of this.pickersCenterPosition) {
              const color = this.fac.getColor(this.canvasElement.nativeElement, {
                mode: 'fast',
                left: picker[0] - this.brickSize / 2,
                top: picker[1] - this.brickSize / 2,
                width: this.brickSize,
                height: this.brickSize
              });
              this.canvas.beginPath();
              this.canvas.lineWidth = '10';
              this.canvas.strokeStyle = this.colorDetector(this.rgbToHsl(color.value));
              this.canvas.rect(picker[0] - this.brickSize / 2, picker[1] - this.brickSize / 2, this.brickSize, this.brickSize);
              this.canvas.stroke();
            }
          }, 1000 / 30);
        };
      });
  }

  ngOnDestroy() {
    this.video.srcObject.getTracks()[0].stop();
    clearTimeout(this.tick);
  }

}
