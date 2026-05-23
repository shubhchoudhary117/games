import { Routes } from '@angular/router';
import { AviatorComponent } from './pages/aviator/aviator.component';
import { SlotsComponent } from './pages/slots/slots.component';
import { CatfishComponent } from './pages/catfish/catfish.component';
import { LobbyComponent } from './pages/lobby/lobby.component';
import { ChickenRoadComponent } from './pages/chicken-road/chicken-road.component';
import { FortyHotSevenComponent } from './pages/forty-hot-seven/forty-hot-seven.component';
import { CrazyMatkaComponent } from './pages/crazy-matka/crazy-matka.component';
import { HiloGameComponent } from './pages/hilo-game/hilo-game.component';
import { MinesComponent } from './pages/mines/mines.component';
import { BubblesGameComponent } from './pages/bubbles-game/bubbles-game.component';
import { PattoKingComponent } from './pages/patto-king/patto-king.component';
import { KenoGameComponent } from './pages/keno-game/keno-game.component';
import { HotlineGameComponent } from './pages/hotline-game/hotline-game.component';
import { ChickenBananaGameComponent } from './pages/chicken-banana-game/chicken-banana-game.component';
import { LimboGameComponent } from './pages/limbo-game/limbo-game.component';
import { DiceGameComponent } from './pages/dice-game/dice-game.component';
import { DoubleXGameComponent } from './pages/double-x-game/double-x-game.component';

export const routes: Routes = [
     {
        path:'',
        component:LobbyComponent
    },
    {
        path:'aviator',
        component:AviatorComponent
    },
    {
        path:'slots',
        component:SlotsComponent
    },
     {
        path:'catfish',
        component:CatfishComponent
    },
      {
        path:'chicken-road',
        component:ChickenRoadComponent
    },
    {
        path:'hotline',
        component:HotlineGameComponent
    },
     {
        path:'40-hot-7',
        component:FortyHotSevenComponent
    },
    {
        path:'crazy-matka',
        component:CrazyMatkaComponent
    },
    {
        path:'hilo',
        component:HiloGameComponent
    },
     {
        path:'mines',
        component:MinesComponent
    },
     {
        path:'bubbles',
        component:BubblesGameComponent
    },
    {
        path:'patto-king',
        component:PattoKingComponent
    },
    {
        path:'keno',
        component:KenoGameComponent
    },
    {
        path:'chicken-banana',
        component:ChickenBananaGameComponent
    },
     {
        path:'double',
        component:DoubleXGameComponent
    },
      {
        path:'limbo',
        component:LimboGameComponent
    },
    {
        path:'dice',
        component:DiceGameComponent
    },
    
];
