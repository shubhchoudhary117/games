import { Injectable, ElementRef } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DxSoundService {

    private soundEnabled = true;
    private musicEnabled = true;

    setSoundState(state: boolean): void {
        this.soundEnabled = state;
    }

    setMusicState(state: boolean): void {
        this.musicEnabled = state;
    }

    play(audioRef?: ElementRef<HTMLAudioElement>, volume = 1): void {

        if (!this.soundEnabled) return;

        if (!audioRef?.nativeElement) return;

        const audio = audioRef.nativeElement;

        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
        audio.volume = volume;

        audio.play().catch(() => { });
    }

    loop(audioRef?: ElementRef<HTMLAudioElement>, volume = 1): void {

        if (!this.musicEnabled) return;

        if (!audioRef?.nativeElement) return;

        const audio = audioRef.nativeElement;

        audio.pause();
        audio.currentTime = 0;
        audio.loop = true;
        audio.volume = volume;

        audio.play().catch(() => { });
    }

    stop(audioRef?: ElementRef<HTMLAudioElement>): void {

        if (!audioRef?.nativeElement) return;

        const audio = audioRef.nativeElement;

        audio.pause();
        audio.currentTime = 0;
    }

    stopAll(audios: Array<ElementRef<HTMLAudioElement> | undefined>): void {

        audios.forEach(audioRef => {

            if (!audioRef?.nativeElement) return;

            const audio = audioRef.nativeElement;

            audio.pause();
            audio.currentTime = 0;
        });
    }
}