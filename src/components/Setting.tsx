
import { useEffect, useRef, useState } from "react";
import { setGameAnimation, setGameHotKeyEnable, setMaxBetAllow, setSoundVolume, visibleGameInfo, visibleHotKeyPanel } from "../store/setting";
import { AnimationIcon, AudioIcon, GameInfoIcon, KeyBoardIcon, MaxBetIcon, SettingIcon } from "./svgs";
import { RootState, useDispatch, useSelector } from "../store";


const SettingBar = ({ maxBetDisable, fairness }: { maxBetDisable?: boolean; fairness?: any }) => {
    const [isOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch();

    const { soundVolume, showGameAnimation, maxBetAllow, gameHotKeyEnabled } = useSelector((state) => state.setting)
    const handleSoundVolume = (e: any) => {
        localStorage.setItem("soundVolume", e.target.value);
        dispatch(setSoundVolume(Number(e.target.value)));
    }

    const handleGameAnimation = () => {
        localStorage.setItem("showAnimation", `${!showGameAnimation}`);
        dispatch(setGameAnimation(!showGameAnimation));

    }

    const handleMaxBetAllow = () => {
        localStorage.setItem("maxBetAllow", `${!maxBetAllow}`);
        dispatch(setMaxBetAllow(!maxBetAllow));
        setIsOpen(!isOpen);
    }


    const handleHotkey = () => {
        dispatch(visibleHotKeyPanel(true));
        setIsOpen(!isOpen);
    }

    const showGameInfo = () => {
        dispatch(visibleGameInfo(true));
        setIsOpen(!isOpen)
    }

    useEffect(() => {
        const volume = Number(localStorage.getItem("soundVolume") || "1");
        dispatch(setSoundVolume(volume || 1));
        const animationSet = localStorage.getItem("showAnimation") === "true";
        dispatch(setGameAnimation(animationSet || true));
        const maxbet = localStorage.getItem("maxBetAllow") === "true";
        dispatch(setMaxBetAllow(maxbet || true));
        const hotkeyEnabled = localStorage.getItem("hotKeyEnabled") === "true";
        dispatch(setGameHotKeyEnable(!hotkeyEnabled));
    }, [])

    return <div className="w-full flex justify-between bg-[#213743] rounded-sm p-2  mt-1">
        <div className="flex space-x-2  border-r-2 border-[#b6b6b6b7] px-6 items-center">
            <Tooltip
                setIsOpen={setIsOpen}
                isOpen={isOpen}
                tooltipContent={
                    <div className="flex-col w-full py-4 ">
                        <ToolTipItem>
                            <div className="w-4 h-4 fill-[#d8b228]">
                                <AudioIcon />
                            </div>
                            <input type="range"
                                min="0"
                                max="10"
                                value={soundVolume}
                                onChange={handleSoundVolume}
                                className="mx-2 w-full h-2 mb-1 bg-[#d8b228] rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d8b228] custom-range"

                                style={{
                                    background: `linear-gradient(to right, #d8b228 0%, #d8b228 ${(soundVolume / 10) * 100
                                        }%, #d1d5db ${(soundVolume / 10) * 100}%, #d1d5db 100%)`,
                                }}
                            />
                        </ToolTipItem>
                        <ToolTipItem onClick={handleGameAnimation}>
                            <div className={` w-4 h-4 ${showGameAnimation ? "fill-[#d8b228]" : "fill-[#2f4553]"}`}>
                                <AnimationIcon />
                            </div>
                            <span className={`${showGameAnimation ? "text-[#d8b228]" : "text-[#2f4553]"}`}>
                                Animations
                            </span>
                        </ToolTipItem>
                        {
                            !maxBetDisable && <ToolTipItem onClick={handleMaxBetAllow}>
                                <div className={` w-4 h-4 ${maxBetAllow ? "fill-[#d8b228]" : "fill-[#2f4553]"}`}>
                                    <MaxBetIcon />
                                </div>
                                <span className={`${maxBetAllow ? "text-[#d8b228]" : "text-[#2f4553]"}`}>
                                    Max Bet
                                </span>
                            </ToolTipItem>
                        }
                        <ToolTipItem onClick={showGameInfo}>
                            <div className={`w-4 h-4 fill-[#2f4553]`}>
                                <GameInfoIcon />
                            </div>
                            <span className={`text-[#2f4553]`}>
                                Game Info
                            </span>
                        </ToolTipItem>
                        <ToolTipItem onClick={handleHotkey}>
                            <div className={` w-4 h-4 ${gameHotKeyEnabled ? "fill-[#d8b228]" : "fill-[#2f4553]"}`}>
                                <KeyBoardIcon />
                            </div>
                            <span className={`${gameHotKeyEnabled ? "text-[#d8b228]" : "text-[#2f4553]"}`}>
                                Hotkeys
                            </span>
                        </ToolTipItem>
                    </div>
                }>
                <button className="text-white font-bold rounded flex items-center fill-white w-4 h-4 hover:fill-[#d8b228]">
                    <SettingIcon />
                </button>
            </Tooltip>

        </div >
        <div>
            {fairness && fairness}
        </div>
    </div >
}


export default SettingBar;



const Tooltip = ({ children, tooltipContent, isOpen, setIsOpen }: { children: any; tooltipContent: any, isOpen: boolean, setIsOpen: Function }) => {

    const toggleTooltip = () => {
        setIsOpen(!isOpen);
    };

    const containt = useRef<any>(null);

    const handleClickOutside = (event: any) => {
        if (containt.current && !containt.current.contains(event.target)) {
            toggleTooltip();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])

    return (
        <div className="relative inline-block w-full">
            {isOpen && (
                <div ref={containt} className="absolute z-10 bg-[#fff] text-white  rounded-md text-sm bottom-[120%] left-1/2 transform tooltip -translate-x-[30%]">
                    {tooltipContent}
                </div>
            )}
            <div onClick={toggleTooltip}>
                {children}
            </div>
        </div>
    );
};

const ToolTipItem = ({ children, onClick }: { children: any, onClick?: Function }) => {
    return <div onClick={() => { onClick && onClick() }} className="flex select-none w-full items-center mb-1 px-2 py-1 space-x-1 cursor-pointer hover:bg-[#5353539d]">
        {children}
    </div>
}