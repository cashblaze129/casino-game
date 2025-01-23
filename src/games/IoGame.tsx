
import { useEffect, useRef } from "react";
import { GameEngine } from "./iogame/GameEngine";

const gameEngine = new GameEngine()
const BattleIO = () => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            const container: any = ref.current;
            container.appendChild(gameEngine.canvas);
        }
    }, [ref.current]);

    return <div className="w-full h-full" ref={ref} />
}


export default BattleIO;