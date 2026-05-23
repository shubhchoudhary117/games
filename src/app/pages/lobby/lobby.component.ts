import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [RouterLink, CommonModule, NgFor, NgIf],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent implements OnInit, OnDestroy {

  balance: number = 12450.75;
  onlinePlayers: number = 3841;
  currentTime: string = '';
  private timeInterval: any;
  private playerInterval: any;
  activeCategory: string = 'all';

  categories = [
    { id: 'all',     label: 'All Games', icon: '◈' },
    { id: 'popular', label: 'Popular',   icon: '🔥' },
    { id: 'new',     label: 'New',       icon: '✦' },
    { id: 'live',    label: 'Live',      icon: '⬤' },
  ];

  games: any[] = [
    {
      id: 1,
      img: 'assets/lobby/aviator.png',
      name: 'Aviator',
      path: '/aviator',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Crash',
      tag: 'HOT',
      tagColor: '#ff4d6d',
      multiplier: '100x',
      players: 214,
      isLive: true,
    },
    // {
    //   id: 2,
    //   img: 'assets/lobby/slots.png',
    //   name: 'Slots',
    //   path: '/slots',
    //   category: 'popular',
    //   provider: 'GURU',
    //   providerShort: 'GB',
    //   categoryLabel: 'Slots, 5Reel',
    //   tag: 'NEW',
    //   tagColor: '#00d4aa',
    //   multiplier: '500x',
    //   players: 389,
    //   isLive: true,
    // },
    {
      id: 3,
      img: 'assets/lobby/swindler.png',
      name: 'Catfish',
      path: '/catfish',
      category: 'new',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Slots, 6Reel',
      tag: 'NEW',
      tagColor: '#00d4aa',
      multiplier: '250x',
      players: 127,
      isLive: false,
    },
    {
      id: 4,
      img: 'assets/lobby/mines.png',
      name: 'Mines',
      path: '/mines',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Slots, 5Reel',
      tag: 'HOT',
      tagColor: '#ff4d6d',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
    {
      id: 5,
      img: 'assets/lobby/chicken-road.png',
      name: 'Chicken Road',
      path: '/chicken-road',
      category: 'popular',
      provider: 'GURU Gaming',
      providerShort: 'GB',
      categoryLabel: 'Slots, 5Reel',
      tag: 'HOT',
      tagColor: '#ff4d6d',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
    {
      id: 6,
      img: 'assets/lobby/forty-hot-seven.png',
      name: '40 Hot Seven',
      path: '/40-hot-7',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Slots, 5Reel',
      tag: 'HOT',
      tagColor: '#ff4d6d',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
     {
      id: 6,
      img: 'assets/lobby/hilo.png',
      name: 'Hilo',
      path: '/hilo',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Hilo',
      tag: 'HOT',
      tagColor: '#ff4d6d',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
    {
      id: 6,
      img: 'assets/lobby/patto-king.png',
      name: 'Patto King',
      path: '/patto-king',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Patto King',
      tag: 'HOT',
      tagColor: 'green',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
    //  {
    //   id: 6,
    //   img: 'assets/lobby/bubbles.png',
    //   name: 'Lucky Bubble',
    //   path: '/bubbles',
    //   category: 'popular',
    //   provider: 'GURU',
    //   providerShort: 'GB',
    //   categoryLabel: 'Lucky Bubble',
    //   tag: 'HOT',
    //   tagColor: 'sky',
    //   multiplier: '1000x',
    //   players: 501,
    //   isLive: true,
    // },
    {
      id: 6,
      img: 'assets/lobby/keno.png',
      name: 'Keno',
      path: '/keno',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Lucky Numbers',
      tag: 'HOT',
      tagColor: 'sky',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
    {
      id: 6,
      img: 'assets/lobby/hotline.png',
      name: 'Hotline',
      path: '/hotline',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Lucky Color card',
      tag: 'HOT',
      tagColor: 'sky',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
    {
      id: 6,
      img: 'assets/lobby/chicken-banana.webp',
      name: 'Chicken Banana',
      path: '/chicken-banana',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Match 3 to win',
      tag: 'HOT',
      tagColor: 'sky',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
     {
      id: 6,
      img: 'assets/lobby/double-x.webp',
      name: 'Double X',
      path: '/double',
      category: 'popular',
      provider: 'GURU',
      providerShort: 'GB',
      categoryLabel: 'Bet on X',
      tag: 'HOT',
      tagColor: 'sky',
      multiplier: '1000x',
      players: 501,
      isLive: true,
    },
  ];

  get filteredGames() {
    if (this.activeCategory === 'all') return this.games;
    if (this.activeCategory === 'live') return this.games.filter(g => g.isLive);
    return this.games.filter(g => g.category === this.activeCategory);
  }

  ngOnInit() {
    this.updateTime();
    this.timeInterval  = setInterval(() => this.updateTime(), 1000);
    this.playerInterval = setInterval(() => {
      this.onlinePlayers += Math.floor(Math.random() * 7) - 3;
    }, 3000);
  }

  ngOnDestroy() {
    clearInterval(this.timeInterval);
    clearInterval(this.playerInterval);
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  }

  setCategory(id: string) { this.activeCategory = id; }

  formatBalance(val: number): string {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}