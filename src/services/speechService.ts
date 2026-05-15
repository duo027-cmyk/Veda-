import { GoogleGenAI, Modality } from "@google/genai";

class SpeechService {
  private ai: GoogleGenAI | null = null;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private audioQueue: { text: string; forceNative: boolean }[] = [];
  private isPlaying: boolean = false;
  public isUsingFallback: boolean = false;

  private getAI() {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    return new GoogleGenAI({ apiKey });
  }

  private getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return this.audioContext;
  }

  async speak(text: string, forceNative: boolean = false) {
    if (!text || !text.trim()) return;

    this.audioQueue.push({ text, forceNative });
    this.processQueue();
  }

  private async processQueue() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      while (this.audioQueue.length > 0) {
        const item = this.audioQueue.shift();
        if (!item) break;
        
        try {
          // If using native fallback or forced, or text is very short
          if (this.isUsingFallback || item.forceNative || item.text.length < 5) {
            await this.useNativeFallback(item.text);
          } else {
            // Pre-fetch the NEXT one in the background while we fetch/play the current one
            if (this.audioQueue.length > 0) {
              const nextItem = this.audioQueue[0];
              if (!this.isUsingFallback && !nextItem.forceNative && nextItem.text.length >= 5) {
                this.getAudioBuffer(nextItem.text).catch(() => {}); // Background fetch
              }
            }

            const audioBuffer = await this.getAudioBuffer(item.text);

            if (audioBuffer) {
              await this.playBuffer(audioBuffer);
            } else {
              await this.useNativeFallback(item.text);
            }
          }
        } catch (error: any) {
          const errorStr = JSON.stringify(error);
          const isQuotaError = 
            error?.message?.includes('429') || 
            error?.status === 'RESOURCE_EXHAUSTED' || 
            errorStr.includes('429') ||
            errorStr.includes('RESOURCE_EXHAUSTED') ||
            (error?.error?.code === 429);

          if (isQuotaError) {
            if (!this.isUsingFallback) {
              console.warn("VEDA_SPEECH: Gemini TTS quota exhausted. Activating Sovereign Native Voice Protocol (Fallback).");
              this.isUsingFallback = true;
              window.dispatchEvent(new CustomEvent('veda_speech_fallback', { 
                detail: { reason: 'QUOTA_EXHAUSTED' } 
              }));
            }
          } else if (errorStr.includes('Rpc failed') || errorStr.includes('xhr error')) {
            console.warn("VEDA_SPEECH: Network RPC failure detected. Activating Sovereign Native Voice Protocol (Fallback).");
            this.isUsingFallback = true;
          } else {
            console.error("VEDA_SPEECH: Neural synthesis error, activating fallback:", error);
          }
          await this.useNativeFallback(item.text);
        }
      }
    } finally {
      this.isPlaying = false;
      if (this.audioQueue.length > 0) {
        this.processQueue();
      }
    }
  }

  private audioBufferCache: Map<string, Promise<AudioBuffer | null>> = new Map();

  private async getAudioBuffer(text: string): Promise<AudioBuffer | null> {
    if (this.audioBufferCache.has(text)) {
      return this.audioBufferCache.get(text)!;
    }

    const fetchPromise = (async () => {
      try {
        const ai = this.getAI();
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [{ parts: [{ text: `Say: ${text}` }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return await this.decodeBase64ToBuffer(base64Audio);
        }
        return null;
      } catch (e) {
        // We throw the error to be handled by the queue processor
        throw e;
      }
    })();

    this.audioBufferCache.set(text, fetchPromise);
    
    // Cleanup cache after some time to prevent memory leaks
    setTimeout(() => this.audioBufferCache.delete(text), 60000);

    return fetchPromise;
  }

  private async decodeBase64ToBuffer(base64: string): Promise<AudioBuffer> {
    const ctx = this.getAudioContext();
    const byteCharacters = atob(base64);
    const buffer = new Int16Array(byteCharacters.length / 2);
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = (byteCharacters.charCodeAt(i * 2) & 0xff) | (byteCharacters.charCodeAt(i * 2 + 1) << 8);
    }

    const audioBuffer = ctx.createBuffer(1, buffer.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      channelData[i] = buffer[i] / 32768;
    }
    return audioBuffer;
  }

  private async playBuffer(audioBuffer: AudioBuffer): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    return new Promise<void>((resolve) => {
      const source = ctx.createBufferSource();
      this.currentSource = source;
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        this.currentSource = null;
        resolve();
      };
      source.start();
    });
  }

  private async playPcm(base64: string) {
    const buffer = await this.decodeBase64ToBuffer(base64);
    return this.playBuffer(buffer);
  }

  private useNativeFallback(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('zh-TW') || v.lang.includes('zh-HK') || v.lang.includes('zh-CN'));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }

  public stop() {
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.currentSource = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public listen(onResult: (text: string) => void, onEnd?: () => void, onError?: (error: any) => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError("Speech recognition not supported in this browser.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW'; // Default to Traditional Chinese
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      onResult(transcript);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.onerror = (event: any) => {
      if (onError) onError(event.error);
    };

    recognition.start();
    return recognition;
  }
}

export const speechService = new SpeechService();
