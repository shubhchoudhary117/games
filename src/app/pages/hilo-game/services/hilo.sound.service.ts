// hilo-sound.service.ts

import {
    ElementRef,
    Injectable
} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HiloSoundService {

    volume: number = 50;
    isSoundEnabled: boolean = true;

    constructor() {

        const savedVolume =
            localStorage.getItem('hilo_sound_volume');

        const savedEnabled =
            localStorage.getItem('hilo_sound_enabled');

        if (savedVolume) {
            this.volume = Number(savedVolume);
        }

        if (savedEnabled) {
            this.isSoundEnabled =
                savedEnabled === 'true';
        }
    }

    /* ------------------------------ volume */

    setVolume(value: number) {

        this.volume = value;

        localStorage.setItem(
            'hilo_sound_volume',
            String(value)
        );
    }

    /* ------------------------------ enable disable */

    toggleSound(status: boolean) {

        this.isSoundEnabled = status;

        localStorage.setItem(
            'hilo_sound_enabled',
            String(status)
        );
    }

    /* ------------------------------ play audio */

    play(audio: ElementRef<HTMLAudioElement>) {

        if (!this.isSoundEnabled) return;

        const el = audio.nativeElement;

        el.volume = this.volume / 100;
        el.currentTime = 0;

        el.play();
    }
}