import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { NgIf } from '@angular/common';
import { MyBetsService } from '../my-bets/my-bets.service';
import { GameLimitsService } from '../game-limits/game-limits.service';
import { HowToPlayService } from '../how-to-play/how-to-play.service';
import { GameRulesService } from '../game-rules/game-rules.service';
import { GameProvablyService } from '../game-provably/game-provably.service';
import { ChangeAvtarService } from '../change-avtar-modal/change-avtar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isOpen: boolean = false;
  @Input() username: string = 'demo_user';
  @Input() isAnimationEnabled: boolean = true;
  @Output() animationChange = new EventEmitter<boolean>();

  constructor(private sidebarService: SidebarService,private myBetsService:MyBetsService,
    private gameLimitsService:GameLimitsService,private howToPlayService:HowToPlayService,
    private gameRulesService:GameRulesService,private gameProvablyService:GameProvablyService,
    private changeAvtarService:ChangeAvtarService
  ) { }

  ngOnInit() {
    this.sidebarService.sidebarOpen$.subscribe((val) => {
      this.isOpen = val;
    })
  }

  showMyBets(){
    this.myBetsService.openMyBets();
    this.sidebarService.closeSidebar();
  }

  showGameLimits(){
    this.gameLimitsService.openGameLimits();
     this.sidebarService.closeSidebar();
  }

  showHowToPlay(){
    this.howToPlayService.openHowToPlay();
    this.sidebarService.closeSidebar()
  }

  showGameRules(){
    this.gameRulesService.openGameRules();
  this.sidebarService.closeSidebar();
  }

  showGameProvably(){
    this.gameProvablyService.openGameProvably();
    this.sidebarService.closeSidebar();
  }

  close() {
    this.sidebarService.closeSidebar()
  }

  toggleAnimation() {
    this.isAnimationEnabled = !this.isAnimationEnabled;
    this.animationChange.emit(this.isAnimationEnabled);
  }

  changeAvtar(){
    this.changeAvtarService.openChangeAvtar();
    this.sidebarService.closeSidebar()
  }

  activeAvatar(){
    let avtar=localStorage.getItem("selected_avatar")??"assets/aviator/avtars/av1.png"
    return avtar;
  }
}
