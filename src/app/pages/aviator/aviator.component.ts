import { Component } from '@angular/core';
import { AviatorHeaderComponent } from "../../shared/components/aviator/aviator-header/aviator-header.component";
import { BethistoryComponent } from "../../shared/components/aviator/bethistory/bethistory.component";
import { AviatorGameScreenComponent } from "../../shared/components/aviator/aviator-game-screen/aviator-game-screen.component";
import { SidebarComponent } from "../../shared/components/aviator/sidebar/sidebar.component";
import { MyBetsComponent } from "../../shared/components/aviator/my-bets/my-bets.component";
import { GameLimitsComponent } from "../../shared/components/aviator/game-limits/game-limits.component";
import { HowToPlayComponent } from "../../shared/components/aviator/how-to-play/how-to-play.component";
import { GameRulesComponent } from "../../shared/components/aviator/game-rules/game-rules.component";
import { GameProvablyComponent } from "../../shared/components/aviator/game-provably/game-provably.component";
import { RoundInfoComponent } from "../../shared/components/aviator/round-info/round-info.component";
import { ChangeAvtarModalComponent } from "../../shared/components/aviator/change-avtar-modal/change-avtar-modal.component";

@Component({
  selector: 'app-aviator',
  standalone: true,
  imports: [AviatorHeaderComponent, BethistoryComponent, AviatorGameScreenComponent, MyBetsComponent, GameLimitsComponent, HowToPlayComponent, GameRulesComponent, GameProvablyComponent, RoundInfoComponent, ChangeAvtarModalComponent],
  templateUrl: './aviator.component.html',
  styleUrl: './aviator.component.scss'
})
export class AviatorComponent {

}
