import { Injectable } from '@angular/core';

import { Cube } from 'freecube';

@Injectable({
  providedIn: 'root'
})
export class CubeService {

  cube: any;
  cubeX = 0;
  cubeY = 0;
  public cubeString = 'uuuuwuuuuuuuubuuuuuuuuruuuuuuuuyuuuuuuuuguuuuuuuuouuuu';
  COLORS = {
    WHITE: [0.9, 0.9, 0.9, 1.0],
    BLUE: [0.0, 0.0, 1.0, 1.0],
    RED: [1.0, 0.0, 0.0, 1.0],
    YELLOW: [1.0, 1.0, 0.0, 1.0],
    GREEN: [0.0, 1.0, 0.0, 1.0],
    ORANGE: [1.0, 0.5, 0.0, 1.0],
    EMPTY: [0.0, 0.0, 0.0, 0.0],
    UNSET: [0.5, 0.5, 0.5, 1.0]
  };
  colorCharColor = {
    w: this.COLORS.WHITE,
    b: this.COLORS.BLUE,
    r: this.COLORS.RED,
    y: this.COLORS.YELLOW,
    g: this.COLORS.GREEN,
    o: this.COLORS.ORANGE,
    u: this.COLORS.UNSET
  };
  faceRenders = [
    [260, 180], // white
    [180, 170], // blue
    [170, 90], // red
    [100, 90], // yellow
    [170, 0], // green
    [190, 270] // orange
  ];
  rotations = {
    'F': [[0, 0, 1], !0],
    'F\'': [[0, 0, 1], !1],
    'B': [[0, 0, -1], !0],
    'B\'': [[0, 0, -1], !1],
    'R': [[1, 0, 0], !0],
    'R\'': [[1, 0, 0], !1],
    'L': [[-1, 0, 0], !0],
    'L\'': [[-1, 0, 0], !1],
    'U': [[0, 1, 0], !0],
    'U\'': [[0, 1, 0], !1],
    'D': [[0, -1, 0], !0],
    'D\'': [[0, -1, 0], !1],
  };

  cubeTick: any;

  canSolve = false;

  constructor(canvas, cubeString?: string) {
    this.cube = new Cube(canvas.nativeElement);
    this.applyString(cubeString);
  }

  checkSolve(): boolean {
    return !this.cubeString.includes('u');
  }

  applyString(cubeString) {
    if (cubeString) {
      this.cubeString = cubeString;
    }
    let i = 0;
    // 0, 1, 2, 9, 10, 11, 18, 19, 20
    for (const block of [18, 9, 0, 19, 10, 1, 20, 11, 2]) {
      this.cube.blocks[block].colors[3] = this.colorCharColor[this.cubeString.charAt(i++)];
    }
    // 2, 5, 8,  11, 14, 17,  20, 23, 26
    for (const block of [20, 11, 2, 23, 14, 5, 26, 17, 8]) {
      this.cube.blocks[block].colors[0] = this.colorCharColor[this.cubeString.charAt(i++)];
    }
    // 18, 19, 20,  21, 22, 23,  24, 25, 26
    for (const block of [18, 19, 20, 21, 22, 23, 24, 25, 26]) {
      this.cube.blocks[block].colors[4] = this.colorCharColor[this.cubeString.charAt(i++)];
    }
    // 6, 7, 8,  15, 16, 17,  24, 25, 26
    for (const block of [26, 17, 8, 25, 16, 7, 24, 15, 6]) {
      this.cube.blocks[block].colors[2] = this.colorCharColor[this.cubeString.charAt(i++)];
    }
    // 0, 3, 6,  9, 12, 15,  18, 21, 24
    for (const block of [0, 9, 18, 3, 12, 21, 6, 15, 24]) {
      this.cube.blocks[block].colors[1] = this.colorCharColor[this.cubeString.charAt(i++)];
    }
    // 0, 1, 2,  3, 4, 5,  6, 7, 8
    for (const block of [2, 1, 0, 5, 4, 3, 8, 7, 6]) {
      this.cube.blocks[block].colors[5] = this.colorCharColor[this.cubeString.charAt(i++)];
    }
  }

  idle() {
    clearTimeout(this.cubeTick);
    this.cubeTick = setInterval(() => {
      this.render(this.cubeX, this.cubeY);
      this.cubeX += 0.6;
      this.cubeY += 0.5;
      if (this.cubeX >= 360) {
        this.cubeX = 0;
      }
      if (this.cubeY >= 360) {
        this.cubeY = 0;
      }
    }, 1000 / 60);
  }

  stopIdle(faceToRender: number = null) {
    clearTimeout(this.cubeTick);
    if (faceToRender !== null) {
      this.renderFace(faceToRender);
    }
  }

  renderFace(face) {
    this.renderPos(this.faceRenders[face][0], this.faceRenders[face][1]);
  }

  renderPos(x: number, y: number) {
    this.cubeX = x;
    this.cubeY = y;
    this.render(this.cubeX, this.cubeY);
    this.canSolve = this.checkSolve();
  }

  update() {
    this.render(this.cubeX, this.cubeY);
  }

  render(x: number, y: number) {
    this.cube.rX = x;
    this.cube.rY = y;
    this.cube.render(x, y);
  }

  async move(moves: string) {
    for (const move of moves.toUpperCase().split(' ')) {
      console.log(move);
      await this.cube.animate(move, 175);
      // this.cube.rotate(this.rotations[move][0], this.rotations[move][1]);
    }
    this.update();
  }

  anim() {
    this.cube.animate('U', 500);
    this.cube.animate('D', 500);
  }
}
