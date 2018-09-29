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
      raw: [0.07070707070707075, 0.14601769911504422, 0.8862745098039215],
      max: [],
      min: []
    },
    blue: {
      raw: [0.6417910447761194, 0.5630252100840336, 0.4666666666666667],
      max: [],
      min: []
    },
    red: {
      raw: [0.9942528735632185, 0.8787878787878787, 0.6470588235294118],
      max: [],
      min: []
    },
    yellow: {
      raw: [0.13190730837789663, 0.9540816326530612, 0.7686274509803922],
      max: [],
      min: []
    },
    green: {
      raw: [0.2675438596491228, 0.7972027972027972, 0.5607843137254902],
      max: [],
      min: []
    },
    orange: {
      raw: [0.05518018018018018, 0.8809523809523808, 0.6588235294117647],
      max: [],
      min: []
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

    for (const key in this.hsvRanges) {
      if (this.hsvRanges.hasOwnProperty(key)) {
        const color = this.hsvRanges[key];
        for (let i = 0; i < 3; i++) {
          color.max[i] = color.raw[i] + color.raw[i] * .02;
          color.min[i] = color.raw[i] - color.raw[i] * .02;
        }
      }
    }
    console.log(this.hsvRanges);
  }

  ngOnInit() {
    this.video = document.createElement('video');
    this.canvas = this.canvasElement.nativeElement.getContext('2d');
  }

  colorDetector(hsv) {
    for (const key in this.hsvRanges) {
      if (this.hsvRanges.hasOwnProperty(key)) {
        const color = this.hsvRanges[key];
        for (let i = 0; i < 3; i++) {
          if (hsv[i] <= color.max[i] && hsv[i] >= color.min[i]) {
            return key;
          }
        }
      }
    }
    return 'grey';
  }

  rgbToHsv(rgb) {
    const r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, v];
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
              this.canvas.strokeStyle = this.colorDetector(this.rgbToHsv(color.value));
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
