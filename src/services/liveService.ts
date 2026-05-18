import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

export class LiveService {
  private ai: any | null = null;
  private session: any | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private audioQueue: Int16Array[] = [];
  private isPlaying = false;
  private onTranscription: ((text: string, isUser: boolean) => void) | null = null;
  private onStatus: ((status: string) => void) | null = null;
  private onInterrupted: (() => void) | null = null;
  private onClose: (() => void) | null = null;

  constructor() {}

  private nextStartTime = 0;

  public async start(apiKey: string, systemInstruction: string) {
    if (this.session) return;

    try {
      this.ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      // Use 24000 for output as Gemini typically outputs at this rate
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.nextStartTime = 0;
      
      this.onStatus?.("正在建立神經連結...");

      this.session = await this.ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            this.onStatus?.("神經連結已建立 / LINK ESTABLISHED");
            this.startMic();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  const audioData = this.base64ToUint8Array(part.inlineData.data);
                  this.audioQueue.push(new Int16Array(audioData.buffer));
                  this.schedulePlayback();
                }
              }
            }

            if (message.serverContent?.interrupted) {
              this.onInterrupted?.();
              this.audioQueue = [];
              this.isPlaying = false;
              this.nextStartTime = 0;
            }

            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              this.onTranscription?.(message.serverContent.modelTurn.parts[0].text, false);
            }
          },
          onclose: () => {
            this.onStatus?.("神經連結已斷開 / LINK SEVERED");
            this.stop();
          },
          onerror: (err: any) => {
            console.error("[LIVE] Neural error:", err);
            this.onStatus?.("神經連結錯誤 / NEURAL ERROR");
            this.stop();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            // Change to Kore for female voice
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
    } catch (e) {
      console.error("[LIVE] Failed to start:", e);
      this.onStatus?.("啟動失敗 / BOOT FAILED");
      this.stop();
    }
  }

  private async startMic() {
    try {
      // Mic input remains 16000 as specified in the sendRealtimeInput
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = micStream;
      
      const micContext = new AudioContext({ sampleRate: 16000 });
      this.source = micContext.createMediaStreamSource(this.stream);
      this.processor = micContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (e) => {
        if (!this.session) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.floatTo16BitPCM(inputData);
        const base64Data = this.uint8ArrayToBase64(new Uint8Array(pcmData.buffer));
        
        this.session.sendRealtimeInput({
          audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
        });
      };

      this.source.connect(this.processor);
      this.processor.connect(micContext.destination);
      
      // Keep track of mic context for cleanup
      (this as any).micContext = micContext;
    } catch (e: any) {
      console.error("[LIVE] Mic error:", e);
      if (e.name === 'NotAllowedError' || e.message?.includes('Permission dismissed')) {
        this.onStatus?.("麥克風權限被拒絕 / MIC PERMISSION DENIED");
      } else {
        this.onStatus?.("麥克風錯誤 / MIC ERROR");
      }
      this.stop();
    }
  }

  public sendVideoFrame(base64Data: string) {
    if (this.session) {
      this.session.sendRealtimeInput({
        video: { data: base64Data, mimeType: "image/jpeg" }
      });
    }
  }

  private schedulePlayback() {
    if (this.audioQueue.length === 0 || !this.audioContext) return;

    this.isPlaying = true;

    while (this.audioQueue.length > 0) {
      const chunk = this.audioQueue.shift()!;
      const buffer = this.audioContext.createBuffer(1, chunk.length, 24000);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < chunk.length; i++) {
        channelData[i] = chunk[i] / 32768;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      const now = this.audioContext.currentTime;
      if (this.nextStartTime < now) {
        this.nextStartTime = now + 0.05; // Initial buffer
      }
      
      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      
      source.onended = () => {
        if (this.audioQueue.length === 0 && this.audioContext && this.nextStartTime <= this.audioContext.currentTime) {
          this.isPlaying = false;
        }
      };
    }
  }

  public stop() {
    this.session?.close();
    this.session = null;
    this.stream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.source?.disconnect();
    this.audioContext?.close();
    this.audioContext = null;
    if ((this as any).micContext) {
      (this as any).micContext.close();
      (this as any).micContext = null;
    }
    this.audioQueue = [];
    this.isPlaying = false;
    this.nextStartTime = 0;
    this.onClose?.();
  }

  public setCallbacks(callbacks: {
    onTranscription?: (text: string, isUser: boolean) => void;
    onStatus?: (status: string) => void;
    onInterrupted?: () => void;
    onClose?: () => void;
  }) {
    this.onTranscription = callbacks.onTranscription || null;
    this.onStatus = callbacks.onStatus || null;
    this.onInterrupted = callbacks.onInterrupted || null;
    this.onClose = callbacks.onClose || null;
  }

  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const liveService = new LiveService();
