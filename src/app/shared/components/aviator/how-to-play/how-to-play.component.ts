import { Component } from '@angular/core';
import { HowToPlayService } from './how-to-play.service';

@Component({
  selector: 'app-how-to-play',
  standalone: true,
  imports: [],
  templateUrl: './how-to-play.component.html',
  styleUrl: './how-to-play.component.scss'
})
export class HowToPlayComponent {
  isVisible:boolean=false;

  constructor(private howToPlayService:HowToPlayService){}

  ngOnInit(){
    this.howToPlayService.howToPlayOpen$.subscribe((val)=>{
      this.isVisible=val;
    })
  }

  onClose(){
    this.howToPlayService.closeHowToPlay();
  }

}
