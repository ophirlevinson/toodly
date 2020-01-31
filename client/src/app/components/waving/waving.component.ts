import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'waving-toodly',
  templateUrl: './waving.component.html',
  styleUrls: ['./waving.component.css']
})
export class WavingComponent implements OnInit {
  blinkTimer;
  waveTimer;
  wavetimeLeft: number = 2;
  timeLeft: number = 2;
  blink:boolean = true;
  hand_rotation: number = 0;
  constructor() { 
    console.log('ondof');
  }

  ngOnInit() {
    
    if (this.blinkTimer == null) {
      this.startTimeres();
    }
  }

  startTimeres() {
    // waving 
    this.waveTimer = setInterval(() => {
      if(this.wavetimeLeft > 0) {
        this.wavetimeLeft--;
      } else {
        this.wavetimeLeft = Math.floor(Math.random() * 10);;  //seconds between waves
        this.hand_rotation = 15;  
        
        setTimeout( () => {
          this.hand_rotation = 0; 
        
        },200)  //time of wave
      }
    },1000)

    
    // blinking
    this.blinkTimer = setInterval(() => {  
      if(this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = Math.floor(Math.random() * 6);;  //seconds between blinks
        this.blink = false;  
        
        setTimeout( () => {
          this.blink = true
        
        },400)  //time of blink
      }
    },1000)
  }

}
