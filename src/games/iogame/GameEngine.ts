
import { Engine, World } from "matter-js";
import { Socket } from "./Socket";
export class GameEngine {

    engine: Engine | undefined;
    world: World | undefined;
    socket: Socket | undefined;
    canvas: HTMLCanvasElement = document.createElement('canvas');
    ctx: CanvasRenderingContext2D | null = this.canvas.getContext('2d');
    constructor() {
        this.engine = Engine.create();
        this.world = this.engine.world;
        this.socket = new Socket();
        this.socketListen();
        this.eventListen();
    }

    socketListen() {
        this.socket?.on("INIT", (data) => {
            this.canvas.width = data.canvas.width;
            this.canvas.height = data.canvas.height;
        });
        this.socket?.on("UPDATE", (data) => {
            this.draw(data);
        })
    }

    eventListen() {
        document.addEventListener('mousedown', e => {
            this.socket?.emit('click', {
                x: e.offsetX,
                y: e.offsetY
            });
        });
    }

    draw(data: any) {
        const ctx = this.ctx;
        if (!ctx) return;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#111';

        data.walls.forEach((wall: any) => {
            ctx.beginPath();
            wall.forEach((w: any) => ctx.lineTo(w.x, w.y));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });

        ctx.fillStyle = '#aaa';
        data.boxes.forEach((box: any) => {
            ctx.beginPath();
            box.forEach((b: any) => ctx.lineTo(b.x, b.y));
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }
}   