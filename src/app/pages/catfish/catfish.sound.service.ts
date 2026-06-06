import { ElementRef, Injectable } from "@angular/core";

// catfish-sound.service.ts
@Injectable({ providedIn: 'root' })
export class CatfishSoundService {

    private soundEnabled = true;
    private musicEnabled = true;

    // Background audio ref store karo taaki on/off toggle kar sako
    private bgAudioRef?: ElementRef<HTMLAudioElement>;

    setSoundState(state: boolean): void {
        this.soundEnabled = state;
    }

    setMusicState(state: boolean, bgAudioRef?: ElementRef<HTMLAudioElement>): void {
        this.musicEnabled = state;

        // Ref update karo agar diya ho
        if (bgAudioRef) this.bgAudioRef = bgAudioRef;

        if (!this.bgAudioRef?.nativeElement) return;
        const audio = this.bgAudioRef.nativeElement;

        if (state) {
            // ON: resume karo current position se (reset mat karo)
            audio.loop = true;
            audio.play().catch(() => { });
        } else {
            // OFF: pause karo, reset mat karo
            audio.pause();
        }
    }

    loop(audioRef?: ElementRef<HTMLAudioElement>, volume = 1): void {
        if (!audioRef?.nativeElement) return;

        // Ref store karo background ke liye
        this.bgAudioRef = audioRef;

        if (!this.musicEnabled) return; // enabled nahi to play mat karo

        const audio = audioRef.nativeElement;
        audio.loop = true;
        audio.volume = volume;

        // Sirf tab se start karo agar pehle se chal nahi raha
        if (audio.paused) {
            audio.currentTime = 0;
            audio.play().catch(() => { });
        }
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

    stop(audioRef?: ElementRef<HTMLAudioElement>): void {
        if (!audioRef?.nativeElement) return;
        const audio = audioRef.nativeElement;
        audio.pause();
        audio.currentTime = 0;
    }

    stopAll(audios: Array<ElementRef<HTMLAudioElement> | undefined>): void {
        audios.forEach(ref => {
            if (!ref?.nativeElement) return;
            ref.nativeElement.pause();
            ref.nativeElement.currentTime = 0;
        });
    }
}