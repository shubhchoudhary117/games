import { Component } from '@angular/core';
import { GameRulesService } from './game-rules.service';

@Component({
  selector: 'app-game-rules',
  standalone: true,
  imports: [],
  templateUrl: './game-rules.component.html',
  styleUrl: './game-rules.component.scss'
})
export class GameRulesComponent {
  isVisible:boolean=false;

  constructor(private gameRulesService:GameRulesService){}

  ngOnInit(){
    this.gameRulesService.openGameRules$.subscribe((val)=>{
      this.isVisible=val;
    })
  }


  onClose(){
    this.gameRulesService.closeGameRules();
  }
}
