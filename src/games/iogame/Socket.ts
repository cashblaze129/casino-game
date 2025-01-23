export class Socket {
    ws: WebSocket | undefined;
    host: string = "localhost";
    port: number = 3000;
    eventHandlers: { [key: string]: ((data: any) => void)[] } = {}; // Store event handlers

    constructor(host: string = "localhost", port: number = 3000) {
        this.host = host;
        this.port = port;
    }

    // Connect to WebSocket server
    connect() {
        this.ws = new WebSocket(`ws://${this.host}:${this.port}`);

        // Listen for incoming messages
        this.ws.onmessage = (event: MessageEvent) => {
            const [key, data] = JSON.parse(event.data);

            // Call all handlers associated with the event key
            if (this.eventHandlers[key]) {
                this.eventHandlers[key].forEach(handler => handler(data));
            }
        };
    }

    // Emit an event to the server
    emit(key: string, data: any) {
        this.ws?.send(JSON.stringify([key, data]));
    }

    // Listen for a specific event
    on(key: string, handler: (data: any) => void) {
        if (!this.eventHandlers[key]) {
            this.eventHandlers[key] = [];
        }

        // Add the handler to the list of handlers for the given key
        this.eventHandlers[key].push(handler);
    }

    // Close WebSocket connection
    disconnect() {
        this.ws?.close();
    }
}
