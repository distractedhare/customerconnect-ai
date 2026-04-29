import type { InitProgressReport, MLCEngine } from "@mlc-ai/web-llm";

type ProgressListener = (progress: InitProgressReport) => void;
type ReadyListener = (isReady: boolean) => void;

class LocalAiService {
  private engine: MLCEngine | null = null;
  private isInitializing = false;
  private progressListeners: ProgressListener[] = [];
  private readyListeners: ReadyListener[] = [];
  private lastProgress: InitProgressReport | null = null;

  async initialize() {
    if (this.engine) {
      this.readyListeners.forEach(fn => fn(true));
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;
    try {
      const { CreateMLCEngine } = await import("@mlc-ai/web-llm");
      // Gemma running locally through WebGPU
      this.engine = await CreateMLCEngine(
        "gemma-2b-it-q4f32_1-MLC",
        { 
          initProgressCallback: (progress) => {
            this.lastProgress = progress;
            this.progressListeners.forEach(fn => fn(progress));
          }
        }
      );
      this.readyListeners.forEach(fn => fn(true));
    } catch (error) {
      console.error("Failed to initialize local AI:", error);
      this.readyListeners.forEach(fn => fn(false));
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  onProgress(fn: ProgressListener) {
    this.progressListeners.push(fn);
    if (this.lastProgress) fn(this.lastProgress);
    return () => {
      this.progressListeners = this.progressListeners.filter(l => l !== fn);
    };
  }

  onReady(fn: ReadyListener) {
    this.readyListeners.push(fn);
    if (this.engine) fn(true);
    return () => {
      this.readyListeners = this.readyListeners.filter(l => l !== fn);
    };
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    if (!this.engine) throw new Error("Engine not initialized");
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });

    const reply = await this.engine.chat.completions.create({
      messages,
    });
    return reply.choices[0].message.content || "";
  }

  isReady() {
    return this.engine !== null;
  }
}

export const localAiService = new LocalAiService();
