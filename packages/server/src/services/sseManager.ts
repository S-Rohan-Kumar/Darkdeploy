import { Response } from "express";

interface SSEClient {
    id: string;
    environmentId: string;
    res: Response;
}

export class SSEManager {
    private clients: Map<string, Map<string, SSEClient>> = new Map();

    constructor() {
        setInterval(() => {
            this.sendHeartbeat();
        }, 30_000);
    }

    public addClient(
        clientId: string,
        environmentId: string,
        res: Response,
    ): void {
        if (!this.clients.has(environmentId)) {
            this.clients.set(environmentId, new Map());
        }

        const envClients = this.clients.get(environmentId)!;
        envClients.set(clientId, { id: clientId, environmentId, res });

        console.log(
            `[SSE] Client ${clientId} connected to env ${environmentId}. Active connections: ${envClients.size}`,
        );

        this.sendEventToClient(res, "connected", { clientId, environmentId });

        res.on("close", () => {
            this.removeClient(clientId, environmentId);
        });
    }

    public removeClient(clientId: string, environmentId: string): void {
        const envClients = this.clients.get(environmentId);
        if (envClients) {
            envClients.delete(clientId);
            console.log(
                `[SSE] Client ${clientId} disconnected from env ${environmentId}. Remaining: ${envClients.size}`,
            );

            if (envClients.size === 0) {
                this.clients.delete(environmentId);
            }
        }
    }

    public broadcast(
        environmentId: string,
        eventType: string,
        data: any,
    ): void {
        const envClients = this.clients.get(environmentId);
        if (!envClients || envClients.size === 0) {
            return;
        }

        for (const client of envClients.values()) {
            this.sendEventToClient(client.res, eventType, data);
        }
    }

    private sendEventToClient(
        res: Response,
        eventType: string,
        data: any,
    ): void {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    private sendHeartbeat(): void {
        for (const envClients of this.clients.values()) {
            for (const client of envClients.values()) {
                client.res.write(": heartbeat\n\n");
            }
        }
    }
}

export const sseManager = new SSEManager();
