import EventSource from "eventsource";
import {
    Flag,
    EvaluationContext,
    evaluate,
    EvaluationResult,
} from "@darkdeploy/core";

export interface ClientConfig {
    apiKey: string;
    baseUrl?: string;
}

export class DarkDeployClient {
    private apiKey: string;
    private baseUrl: string;
    private flagsCache: Map<string, Flag> = new Map();
    private eventSource: EventSource | null = null;
    private isInitialized = false;

    private reconnectAttempts = 0;
    private maxReconnectDelay = 30_000;
    private baseReconnectDelay = 1_000;

    constructor(config: ClientConfig) {
        if (!config.apiKey) {
            throw new Error("DarkDeployClient requires an apiKey");
        }
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || "http://localhost:4000";
    }

    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            return;
        }

        await this.fetchFlagsSnapshot();

        this.connectStream();

        this.isInitialized = true;
    }

    public isEnabled(
        flagKey: string,
        context: EvaluationContext,
        defaultValue = false,
    ): boolean {
        const flag = this.flagsCache.get(flagKey);

        if (!flag) {
            return defaultValue;
        }

        const result = evaluate(flag, context);
        return result.value;
    }

    public evaluateFlag(
        flagKey: string,
        context: EvaluationContext,
    ): EvaluationResult | null {
        const flag = this.flagsCache.get(flagKey);
        if (!flag) {
            return null;
        }
        return evaluate(flag, context);
    }

    private async fetchFlagsSnapshot(): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/api/sdk/flags`, {
                headers: {
                    "x-api-key": this.apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch flags: HTTP ${response.status}`,
                );
            }

            const data = await response.json();
            const flags: Flag[] = data.flags || [];

            this.flagsCache.clear();
            for (const flag of flags) {
                this.flagsCache.set(flag.key, flag);
            }

            console.log(
                `[DarkDeploy SDK] Initialized cache with ${this.flagsCache.size} flags.`,
            );
        } catch (error) {
            console.warn(
                "[DarkDeploy SDK] Cold start fetch failed, will rely on stream/cache:",
                error,
            );
        }
    }

    private connectStream(): void {
        if (this.eventSource) {
            this.eventSource.close();
        }

        const streamUrl = `${this.baseUrl}/api/stream`;
        this.eventSource = new EventSource(streamUrl, {
            headers: {
                "x-api-key": this.apiKey,
            },
        });

        this.eventSource.addEventListener("connected", () => {
            console.log("[DarkDeploy SDK] Real-time stream connected.");
            this.reconnectAttempts = 0;
        });

        this.eventSource.addEventListener("flag_updated", (event: any) => {
            try {
                const flag: Flag = JSON.parse(event.data);
                this.flagsCache.set(flag.key, flag);
                console.log(
                    `[DarkDeploy SDK] Live update: Flag '${flag.key}' refreshed.`,
                );
            } catch (err) {
                console.error(
                    "[DarkDeploy SDK] Failed to parse flag_updated event:",
                    err,
                );
            }
        });

        this.eventSource.addEventListener("flag_deleted", (event: any) => {
            try {
                const { key } = JSON.parse(event.data);
                this.flagsCache.delete(key);
                console.log(
                    `[DarkDeploy SDK] Live update: Flag '${key}' evicted.`,
                );
            } catch (err) {
                console.error(
                    "[DarkDeploy SDK] Failed to parse flag_deleted event:",
                    err,
                );
            }
        });

        this.eventSource.onerror = () => {
            console.warn(
                "[DarkDeploy SDK] Stream connection lost. Scheduling reconnect...",
            );
            this.eventSource?.close();
            this.eventSource = null;
            this.scheduleReconnect();
        };
    }

    private scheduleReconnect(): void {
        const delay = Math.min(
            this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
            this.maxReconnectDelay,
        );
        const jitter = Math.random() * 500;
        const finalDelay = delay + jitter;

        this.reconnectAttempts++;
        console.log(
            `[DarkDeploy SDK] Reconnecting in ${Math.round(finalDelay)}ms (attempt ${this.reconnectAttempts})...`,
        );

        setTimeout(() => {
            this.connectStream();
        }, finalDelay);
    }

    public close(): void {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.flagsCache.clear();
        this.isInitialized = false;
    }
}
