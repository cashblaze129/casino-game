import { useEffect, useState } from "react";
import Container from "../components/Container"
import useIsMobile from "../hooks/useIsMobile"
import AmountInput from "../components/AmountInput";
import { HigherSvgIcon, LowerSvgIcon } from "../components/svgs";
import SwitchTab from "../components/SwitchTab";
import io, { Socket } from "socket.io-client";
import { API_URL } from "../config";
import { toast } from "react-toastify";
import { useSelector } from "../store";
import formatAmount from "../utils/formatAmount";
import CurrencyIcon from "../components/CurrencyIcon";
import { getHiloMGameCard } from "../utils/hilo";
import SettingBar from "../components/Setting";
import FairnessView from "../components/FairnessView";
import { DefaultAvatar } from "../components/CurrentBets";
import betaudio from "../assets/audio/bet.DUx2OBl3.mp3";
import flipaudio from "../assets/audio/flip.xdzctLJY copy.mp3";
import winaudio from "../assets/audio/win.BpDMfFMt.mp3";
import guessaudio from "../assets/audio/guess.B5vUJlDv.mp3";
import correctaudio from "../assets/audio/correct.iqRwTJwE.mp3";

const socket: Socket = io(`${API_URL}/hilo`);
enum GameStatus { WATTING, BETTING, CALCULATIONG };
const suits = {
    "Hearts": {
        color: "#e9113c",
        icon: <svg fill="currentColor" viewBox="0 0 64 64" > <title></title> <path fillRule="evenodd" clipRule="evenodd" d="M30.907 55.396.457 24.946v.002A1.554 1.554 0 0 1 0 23.843c0-.432.174-.82.458-1.104l14.13-14.13a1.554 1.554 0 0 1 1.104-.458c.432 0 .821.175 1.104.458l14.111 14.13c.272.272.645.443 1.058.453l.1-.013h.004a1.551 1.551 0 0 0 1.045-.452l14.09-14.09a1.554 1.554 0 0 1 1.104-.457c.432 0 .82.174 1.104.457l14.13 14.121a1.557 1.557 0 0 1 0 2.209L33.114 55.396v-.002c-.27.268-.637.438-1.046.452v.001h.003a.712.712 0 0 1-.04.002h-.029c-.427 0-.815-.173-1.095-.453Z"></path></svg>
    },
    "Diamonds": {
        color: "#e9113c",
        icon: <svg fill="currentColor" viewBox="0 0 64 64"> <title></title> <path fillRule="evenodd" clipRule="evenodd" d="m37.036 2.1 24.875 24.865a7.098 7.098 0 0 1 2.09 5.04c0 1.969-.799 3.75-2.09 5.04L37.034 61.909a7.076 7.076 0 0 1-5.018 2.078c-.086 0-.174 0-.25-.004v.004h-.01a7.067 7.067 0 0 1-4.79-2.072L2.089 37.05A7.098 7.098 0 0 1 0 32.009c0-1.97.798-3.75 2.09-5.04L26.965 2.102v.002A7.07 7.07 0 0 1 31.754.02l.002-.004h-.012c.088-.002.176-.004.264-.004A7.08 7.08 0 0 1 37.036 2.1Z"></path></svg>
    },
    "Clubs": {
        color: "#1a2c38",
        icon: <svg fill="currentColor" viewBox="0 0 64 64"> <title></title> <path fillRule="evenodd" clipRule="evenodd" d="M63.256 30.626 33.082.452A1.526 1.526 0 0 0 31.994 0c-.024 0-.048 0-.072.002h.004v.002a1.53 1.53 0 0 0-1.034.45V.452L.741 30.604a1.54 1.54 0 0 0-.45 1.09c0 .426.172.81.45 1.09l14.002 14.002c.28.278.663.45 1.09.45.426 0 .81-.172 1.09-.45l13.97-13.97a1.53 1.53 0 0 1 1.031-.45h.002l.027-.001.031-.001c.424 0 .81.172 1.088.452l14.002 14.002c.28.278.664.45 1.09.45.426 0 .81-.172 1.09-.45l14.002-14.002a1.546 1.546 0 0 0 0-2.192v.002ZM45.663 64H18.185a.982.982 0 0 1-.692-1.678L31.23 48.587h-.002a.986.986 0 0 1 .694-.285h.002v.047l.01-.047a.98.98 0 0 1 .686.285l13.736 13.736A.982.982 0 0 1 45.663 64Z"></path></svg>
    },
    "Spades": {
        color: "#1a2c38",
        icon: <svg fill="currentColor" viewBox="0 0 64 64" > <title></title> <path d="M14.022 50.698.398 36.438A1.47 1.47 0 0 1 0 35.427c0-.395.152-.751.398-1.012l13.624-14.268c.249-.257.59-.417.967-.417.378 0 .718.16.967.417l13.625 14.268c.245.26.397.617.397 1.012 0 .396-.152.752-.397 1.013L15.957 50.698c-.25.257-.59.416-.968.416s-.718-.16-.967-.416Zm34.022 0L34.41 36.438a1.471 1.471 0 0 1-.398-1.012c0-.395.152-.751.398-1.012l13.633-14.268c.248-.257.589-.417.967-.417s.718.16.967.417l13.624 14.268c.246.26.398.617.398 1.012 0 .396-.152.752-.398 1.013L49.978 50.698c-.249.257-.59.416-.967.416-.378 0-.719-.16-.968-.416ZM44.541 62h.01c.685 0 1.239-.58 1.239-1.296 0-.36-.14-.686-.367-.92L32.871 46.657a1.206 1.206 0 0 0-.871-.375h-.04L27.335 62h17.207ZM32.963 32.965l13.624-14.25a1.47 1.47 0 0 0 .398-1.012 1.47 1.47 0 0 0-.398-1.013L32.963 2.422a1.334 1.334 0 0 0-.97-.422h-.03L26.51 16.229l5.455 17.156h.03c.38 0 .72-.16.968-.42Z"></path><path d="M31.028 2.424 17.404 16.683c-.245.26-.397.616-.397 1.012s.152.752.397 1.012l13.624 14.26c.24.253.568.412.934.421L31.963 2a1.33 1.33 0 0 0-.935.424Zm-12.45 57.36c-.228.234-.368.56-.368.92 0 .717.554 1.296 1.238 1.296h12.515l-.002-15.718c-.33.008-.625.15-.841.375L18.576 59.784Z"></path></svg>
    },
    "Joker": {
        color: "#e9113c",
        icon: <svg viewBox="0 0 20 19"><g><path d="M16.2761 3.65844C17.2913 3.65844 18.1172 2.83785 18.1172 1.82922C18.1172 0.820593 17.2913 0 16.2761 0C15.2609 0 14.4349 0.820632 14.4349 1.82926C14.4349 2.83789 15.2608 3.65844 16.2761 3.65844Z"></path><path d="M1.84113 14.3415C0.825937 14.3415 0 15.1621 0 16.1707C0 17.1794 0.825937 18 1.84113 18C2.85633 18 3.68227 17.1793 3.68227 16.1707C3.68227 15.1621 2.85637 14.3415 1.84113 14.3415Z"></path><path d="M18.1589 14.3415C17.1437 14.3415 16.3177 15.1621 16.3177 16.1707C16.3177 17.1794 17.1437 18 18.1589 18C19.1741 18 20 17.1794 20 16.1707C20 15.1621 19.1741 14.3415 18.1589 14.3415Z"></path><path d="M10 8.5189C10.5623 7.44127 11.4921 6.58256 12.6231 6.10625L11.8496 5.33782C11.9286 4.2662 12.548 3.3414 13.4374 2.83183C13.3248 2.51817 13.263 2.1808 13.263 1.82922C13.263 1.63005 13.2831 1.43546 13.3207 1.24707H11.569C8.99242 1.24707 6.90367 3.32231 6.90367 5.88224V5.93323C8.24773 6.35238 9.36109 7.29437 10 8.5189Z"></path><path d="M5.02082 15.5472C5.02082 15.8687 5.28316 16.1293 5.60676 16.1293H14.3932C14.7168 16.1293 14.9792 15.8687 14.9792 15.5472V13.6351H5.02082V15.5472Z"></path><path d="M14.9792 11.8183C15.9066 11.9906 16.6934 12.5645 17.1496 13.3505C17.4653 13.2386 17.8049 13.1772 18.1589 13.1772C18.3593 13.1772 18.5552 13.1972 18.7448 13.2345V10.912C18.7448 8.67355 16.9184 6.85892 14.6654 6.85892C12.4123 6.85892 10.5859 8.67351 10.5859 10.912V12.4709H14.9791V11.8183H14.9792Z"></path><path d="M9.41406 10.912C9.41406 8.67359 7.58762 6.85896 5.33461 6.85896C3.0816 6.85896 1.2552 8.67355 1.2552 10.912V13.2345C1.44484 13.1972 1.64066 13.1772 1.84113 13.1772C2.19504 13.1772 2.53469 13.2387 2.85043 13.3506C3.30668 12.5645 4.09336 11.9907 5.02082 11.8183V12.4709H9.41406V10.912Z"></path></g></svg>
    }
}

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'Joker';

interface Card {
    rank: Rank;
    suit: Suit;
}

interface Bet {
    userId: string;
    currency: string;
    amount: number;
    status: "BET" | "WIN" | "LOST";
    profit: number;
    betType: BetType,
    multiplier: number
}

type BetType =
    'hi' | 'low' | 'black' | 'red' |
    'range_2_9' | 'range_j_q_k_a' | 'range_k_a' | 'joker' | 'a';

const multipliers: { [key in Rank]: { [key in 'Lower' | 'Higher']: number } } = {
    'A': {
        'Lower': 12.870,
        'Higher': 1.073
    },
    '2': {
        'Higher': 1.073,
        'Lower': 6.435
    },
    '3': {
        'Higher': 1.170,
        'Lower': 4.290
    },
    '4': {
        'Higher': 1.287,
        'Lower': 3.217
    },
    '5': {
        'Higher': 1.430,
        'Lower': 2.574
    },
    '6': {
        'Higher': 1.609,
        'Lower': 2.145
    },
    '7': {
        'Higher': 1.839,
        'Lower': 1.839
    },
    '8': {
        'Higher': 2.145,
        'Lower': 1.609
    },
    '9': {
        'Higher': 2.574,
        'Lower': 1.43
    },
    '10': {
        'Higher': 3.217,
        'Lower': 1.287
    },
    'J': {
        'Higher': 4.290,
        'Lower': 1.170
    },
    'Q': {
        'Higher': 6.435,
        'Lower': 1.073
    },
    'K': {
        'Higher': 12.870,
        'Lower': 1.073
    },
    'Joker': {
        'Higher': 0,
        'Lower': 0
    }
}

let isSoundEnable = false;
let audioVolume = 1;
const playAudio = (key: string) => {
    if (!isSoundEnable) return;
    try {
        if (key === "bet") {
            if (betaudio) {
                const audio = new Audio();
                audio.src = betaudio;
                audio.volume = audioVolume;
                audio.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "correct") {
            if (correctaudio) {
                const audio = new Audio();
                audio.src = correctaudio;
                audio.volume = audioVolume;
                audio.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "flip") {
            if (flipaudio) {
                const audio = new Audio();
                audio.src = flipaudio;
                audio.volume = audioVolume;
                audio.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "win") {
            const audio = new Audio();
            audio.src = winaudio;
            audio.volume = audioVolume;
            audio.play().then(() => { }).catch((error: any) => {
                console.log("Failed to autoplay audio:", error);
            });
        } else if (key === "guess") {
            const audio = new Audio();
            audio.src = guessaudio;
            audio.volume = audioVolume;
            audio.play().then(() => { }).catch((error: any) => {
                console.log("Failed to autoplay audio:", error);
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const HiloMGame = () => {
    const isMobile = useIsMobile();
    const { currency } = useSelector((state) => state.auth);
    const { soundVolume, maxBetAllow, showGameAnimation, gameHotKeyEnabled } = useSelector((state) => state.setting);
    const [betAmount, setBetAmount] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [privateSeed, setPrivateSeed] = useState("");
    const [publicSeed, setPublicSeed] = useState("");
    const [privateSeedHash, setPrivateSeedHash] = useState("");
    const [dt, setDt] = useState(0);
    const [status, setStatus] = useState(GameStatus.WATTING);
    const [bettingTime, setBettingTime] = useState(10000);
    const [calculatingTime, setCalculatingTime] = useState(10000);
    const [startCard, setStartCard] = useState<Card | null>();
    const [history, setHistorys] = useState<{ card: Card, id: string }[]>([]);
    const [bets, setBets] = useState<Bet[]>([]);
    const [currentBetType, setBetType] = useState("");
    const [loading, setLoading] = useState(false);
    const delyTime = status === GameStatus.CALCULATIONG ? calculatingTime : bettingTime;
    const disabled = status === GameStatus.CALCULATIONG || currentBetType !== "" || loading;

    const handleBet = (betType?: BetType) => {
        if (status !== GameStatus.CALCULATIONG) {
            setLoading(true);
            if (currentBetType === "" && betType) {
                socket.emit("place-bet", {
                    amount: betAmount,
                    currency: currency.symbol,
                    betType: betType
                });
            } else {
                socket.emit("cancel-bet");
            }
            playAudio("bet");
        } else {
            // toast.error(`Please wait${(Math.floor((delyTime - (Date.now() - dt)) / 1000) + 1)}s seconds.`)
        }
    }

    useEffect(() => {
        socket.on("connect", () => {
            socket.emit("fetch");
            console.log("Server connected");
        })

        socket.on("disconnect", () => {
            console.log("Server disconnected");
        })
        socket.on("game", (data: any) => {
            setDt(Date.now() - data.dt);
            setStatus(data.status);
            setBettingTime(data.bettingTime);
            setCalculatingTime(data.calculatingTime);
            setPrivateSeedHash(data.privateSeedHash);
            setPublicSeed(data.publicSeed);
            setStartCard(data.startCard);
            setHistorys(data.history.map((h: { privateSeed: string, publicSeed: string }) => {
                return { card: getHiloMGameCard(h.privateSeed, h.publicSeed), id: h.privateSeed };
            }));
        })
        socket.on("place-bet", (data) => {
            setLoading(false);
            if (data.status) {
                toast.info("Betting success.");
                setBetType(data.betType);
            } else {
                toast.error("Betting failed.");
            }
        })
        socket.on("bet", (data) => {
            setBets([...bets, { ...data, profit: -data.amount }])
        })
        socket.on("game-status", (data) => {
            setLoading(false);
            setStatus(data);
            setDt(Date.now());
        })
        socket.on("game-start", (data) => {
            setPublicSeed(data.publicSeed);
            setBetType("");
            setPrivateSeedHash(data.privateSeedHash);
            setBets([]);
        })
        socket.on("game-end", (data) => {
            setPublicSeed(data.publicSeed);
            setPrivateSeed(data.privateSeed);
            setBets(data.bets);
            setStartCard(null);
            setTimeout(() => {
                setStartCard(data.card);
                setHistorys([{ card: data.card, id: data.privateSeed }, ...history])
            }, 1500)
        })
        socket.on("cancel-bet", (data) => {
            setLoading(false);
            if (data.status) {
                setBetType('');
                toast.info("Successfully cancelled");
            } else {
                toast.error("Cancellation failed");
            }
        })
        socket.on("bet-cancel", (data) => {
            setBets([...bets.filter((bet) => bet.userId !== data.userId)]);
        })
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("game");
            socket.off("place-bet");
            socket.off("bet");
            socket.off("game-status");
            socket.off("game-start");
            socket.off("game-end");
            socket.off("cancel-bet");
            socket.off("bet-cancel");
        }
    }, [status, bets, startCard])

    useEffect(() => {
        isSoundEnable = true;
        if (!socket.connected)
            socket.connect();
        return () => {
            isSoundEnable = false;
            if (socket.connected)
                socket.disconnect();
        }
    }, []);

    useEffect(() => {
        audioVolume = soundVolume / 10;
    }, [soundVolume]);

    useEffect(() => {
        const handleKeyDown = (event: any) => {
            console.log(event.keyCode);
            if (!gameHotKeyEnabled) return;
            switch (event.keyCode) {
                case 32:
                    handleBet();
                    event.preventDefault();
                    break;
                case 83:
                    setBetAmount(betAmount * 2);
                    event.preventDefault();
                    break;
                case 65:
                    setBetAmount(betAmount / 2);
                    event.preventDefault();
                    break;
                case 68:
                    setBetAmount(0);
                    event.preventDefault();;
                    break;
                case 81:
                    handleBet("hi");
                    event.preventDefault();
                    break;
                case 87:
                    handleBet("low");
                    event.preventDefault();
                    break;
                case 69:
                    handleBet("black");
                    event.preventDefault();
                    break;
                case 82:
                    handleBet("red");
                    event.preventDefault();
                    break;
                case 84:
                    handleBet("range_2_9");
                    event.preventDefault();
                    break;
                case 89:
                    handleBet("range_j_q_k_a");
                    event.preventDefault();
                    break;
                case 85:
                    handleBet("range_k_a");
                    event.preventDefault();
                    break;
                case 73:
                    handleBet("a");
                    event.preventDefault();
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        gameHotKeyEnabled,
        status,
        bets,
        startCard,
        loading
    ])

    const getMultipliers = () => {
        const card: Card = startCard || { suit: "Clubs", rank: "A" };
        return multipliers[card.rank]
    }
    const currentMultipliers = getMultipliers();
    const getCardRankValue = (card: Card): number => {
        const rankValueMap: { [key in Rank]: number } = {
            'A': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 6,
            '7': 7,
            '8': 8,
            '9': 9,
            '10': 10,
            'J': 11,
            'Q': 12,
            'K': 13,
            'Joker': 14
        };
        return rankValueMap[card.rank];
    }
    const getProbability = () => {
        if (!startCard) return [0, 0];
        const value = getCardRankValue(startCard);
        if (value === 13) {
            return [(100 / 13).toFixed(0), ((100 / 13) * value - 1).toFixed(0)]
        } else if (value === 1) {
            return [(100 - (100 / 13) * value).toFixed(0), (100 / 13).toFixed(0)]
        } else {
            return [(100 - (100 / 13) * value - 1).toFixed(0), ((100 / 13) * value).toFixed(0)]
        }
    }
    const probability = getProbability();
    const getbetButtonClassName = (betType: BetType) => {
        if (betType === "hi" || betType === "low") {
            return `flex bg-input_bg w-full items-center rounded-sm select-none shadow-md justify-between ${(betType === currentBetType) ? "bg-input_hover" : ""} ${(disabled && betType !== currentBetType) ? "cursor-not-allowed text-[#9c9c9c]" : "hover:bg-input_hover text-[#e7e7e7] cursor-pointer"}`;
        }
        return `flex p-2  mt-3 bg-input_bg w-full items-center rounded-sm select-none shadow-md justify-between ${(betType === currentBetType) ? "bg-input_hover" : ""} ${(disabled && betType !== currentBetType) ? "cursor-not-allowed text-[#9c9c9c]" : "hover:bg-input_hover text-[#e7e7e7] cursor-pointer"}`;
    }
    const renderBets = () => {
        return <div className="w-full bg-panel p-1 rounded-sm overflow-y-scroll flex flex-col h-full min-h-[150px] mt-1">
            {bets.map((bet: Bet, index: number) => {
                console.log(bet)
                return <div className="w-full flex justify-between items-center" key={index}>
                    <div className="">
                        <DefaultAvatar />
                    </div>
                    <div className="text-white text-sm font-bold">{bet.userId}</div>
                    <div className="flex space-x-1 items-center">
                        <div className={`${bet.status === "WIN" ? `text-[green]` : `text-white`} text-sm font-bold`}>
                            {bet.status === "WIN" ? `${bet.multiplier.toFixed(2)}x` : "-"}
                        </div>
                        <div className={`${bet.status === "WIN" ? `text-[#ff9430]` : `text-white`} text-sm font-bold`}>
                            {bet.status === "WIN" ? formatAmount(bet?.profit || 0, 4) : formatAmount(Math.abs(bet?.amount || 0), 4)}
                        </div>
                        <div className="w-4 h-4"><CurrencyIcon /></div>
                    </div>
                </div>
            })}
        </div>
    }
    const renderControls = () => {
        return <div className="col-span-1 p-2 md:min-h-[560px] bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-start">
            <AmountInput value={betAmount} onChange={setBetAmount} disabled={disabled} amount={betAmount} />
            <SwitchTab options={["Controls", "Leaderboard"]} active={activeTab} onChange={setActiveTab} type="sub" />
            {activeTab === 0 ? <>
                <div className="flex justify-between mt-3 space-x-3">
                    <div className={getbetButtonClassName("hi")} onClick={() => handleBet("hi")}>
                        <div className="flex items-center p-1  px-2">
                            <div className="font-bold"> Hi</div>
                            <div className="ml-1">
                                <HigherSvgIcon />
                            </div>
                        </div>
                        <div className="flex flex-col bg-input_hover h-full w-1/3 items-center">
                            <div className="text-yellow-400 text-sm font-bold">
                                {`${currentMultipliers.Higher.toFixed(2)}x`}
                            </div>
                            <div className="text-[#e7e7e7]">
                                {startCard ? probability[0] : '00'}%
                            </div>
                        </div>
                    </div>
                    <div className={getbetButtonClassName("low")} onClick={() => handleBet("low")}>
                        <div className="flex items-center p-1  px-2">
                            <div className="font-bold">Low</div>
                            <div className="ml-1">
                                <LowerSvgIcon />
                            </div>
                        </div>
                        <div className="flex flex-col bg-input_hover h-full w-1/3 items-center">
                            <div className="text-yellow-400 text-sm font-bold">
                                {`${currentMultipliers.Lower.toFixed(2)}x`}
                            </div>
                            <div className="text-[#e7e7e7]">
                                {startCard ? probability[1] : '00'}%
                            </div>
                        </div>
                    </div>
                </div>
                <div className={getbetButtonClassName("black")} onClick={() => handleBet("black")} >
                    <div className="flex items-center">
                        <div className=" font-bold">
                            Black
                        </div>
                        <div className="ml-1 w-3 h-3 rounded-full bg-black"></div>
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        2.00x
                    </div>
                </div>
                <div className={getbetButtonClassName("red")} onClick={() => handleBet("red")} >
                    <div className="flex items-center">
                        <div className=" font-bold">
                            Red
                        </div>
                        <div className="ml-1 w-3 h-3 rounded-full bg-[#e42c2c]"></div>
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        2.00x
                    </div>
                </div>
                <div className={getbetButtonClassName("range_2_9")} onClick={() => handleBet("range_2_9")} >
                    <div className=" font-bold">
                        2-9
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        1.50x
                    </div>
                </div>
                <div className={getbetButtonClassName("range_j_q_k_a")} onClick={() => handleBet("range_j_q_k_a")} >
                    <div className=" font-bold">
                        J, Q, K, A
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        3.00x
                    </div>
                </div>
                <div className="flex space-x-3 justify-between" >
                    <div className={getbetButtonClassName("range_k_a")} onClick={() => handleBet("range_k_a")} >
                        <div className=" font-bold">
                            K, A
                        </div>
                        <div className="text-yellow-400 text-sm font-bold">
                            6.00x
                        </div>
                    </div>
                    <div className={getbetButtonClassName("a")} onClick={() => handleBet("a")} >
                        <div className=" font-bold">
                            A
                        </div>
                        <div className="text-yellow-400 text-sm font-bold">
                            12.00x
                        </div>
                    </div>
                </div>
                {/* <div className={getbetButtonClassName("joker")} onClick={() => handleBet("joker")}>
                    <div className="flex items-center">
                        <div className=" font-bold">
                            Joker
                        </div>
                        <div className="ml-1 w-4 h-4 fill-[#b9b9b9]">
                            {suits.Joker.icon}
                        </div>
                    </div>
                    <div className="text-yellow-400 text-sm font-bold">
                        24.00x
                    </div>
                </div> */}
            </> : renderBets()}
        </div>
    }

    return <Container className="w-full bg-[#10100f] h-full flex justify-center ">
        <div className={`max-w-[1300px] mt-5 w-full ${isMobile ? "p-1" : ""} `}>
            <div className="grid grid-cols-1 sm:grid-cols-4 rounded-md overflow-hidden bg-panel shadow-md ">
                {!isMobile && renderControls()}
                <div className={`col-span-3 ${isMobile ? "min-h-[370px] " : "min-h-[300px] "} relative h-full overflow-hidden py-1`}>
                    <div className="flex justify-center w-full h-full">
                        <div className="flex flex-col max-w-[550px] h-full w-full justify-around md:p-0 p-2">
                            <div className="flex flex-col w-full justify-center items-center md:min-h-[250px] min-h-[200px] relative">
                                <div className="w-0 h-0 absolute" style={{
                                    transform: `translate(0px, 8px)`,
                                }}>
                                    <div
                                        className="absolute w-[120px] md:w-[135px] select-none bg-[#32566185] rounded-md"
                                        style={{
                                            perspective: '3000px',
                                            aspectRatio: '2 / 3',
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                    </div>
                                </div>
                                {Array(7).fill(0).map((_, index: number) => {
                                    return <CardItem y={12 - 2 * index} key={index} showAnimation={false} />
                                })}
                                <CardItem card={startCard} y={-2} showAnimation={showGameAnimation} />
                            </div>
                            <StatusBar dt={dt} delyTime={delyTime} status={status} />
                            <div className="flex flex-col w-full">
                                <div className="flex text-white">RECENT ROUNDS</div>
                                <div className="overflow-y-scroll w-full md:max-h-[260px] mt-1">
                                    <div className="grid md:grid-cols-8 grid-cols-6 w-full  gap-2">
                                        {(isMobile ? history.slice(0, 6) : history).map((history: any, index: number) => {
                                            return <div className="col-span-1" key={history.id}>
                                                <HCardItem card={history.card} y={0} showAnimation={showGameAnimation} />
                                            </div>
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {isMobile && renderControls()}
            </div>
            <div className="w-full">
                <SettingBar fairness={
                    <FairnessView privateSeed={privateSeed} publicSeed={publicSeed} privateHash={privateSeedHash} gameId={"hilo-m"} >
                        <div className="text-white font-bold">
                            Fairness
                        </div>
                    </FairnessView>
                } />
            </div>
        </div>
    </Container >
}

export default HiloMGame;


const CardItem = ({ card, y, showAnimation }: { card?: Card | null, y: number, showAnimation: boolean }) => {
    const [_card, setCard] = useState<Card | null>();
    const [isHide, setHide] = useState(true);
    let icon: any = "", color = "", rank = "";
    let isJoker: boolean = false;
    if (_card) {
        if (_card.rank !== 'Joker' && _card.suit) {
            rank = _card.rank;
            icon = suits[_card.suit].icon;
            color = suits[_card.suit].color;
        } else {
            icon = suits["Joker"].icon;
            isJoker = true;
            rank = "JOKER";
        }
    }
    useEffect(() => {
        if (card) {
            setCard(card);
            setHide(false);
            playAudio("flip");
        } else {
            setHide(true);
            playAudio("flip");
        }
    }, [card])
    return (
        <div className="w-0 h-0 absolute" style={{
            transform: `translate(0px, ${y}px)`,
        }}>
            <div
                className="absolute w-[75px] md:w-[95px] select-none"
                style={{
                    perspective: '3000px',
                    aspectRatio: '2 / 3',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div
                    className={`w-full h-full flex items-center justify-center rounded-sm shadow-md  duration-500 ${isHide ? 'transform rotate-y-180' : 'transition-transform ease-in-out'
                        }`}
                    style={{ position: 'relative', transformStyle: 'preserve-3d' }}
                >
                    <div
                        className={`absolute inset-0 flex items-center justify-center bg-white rounded-sm shadow-md backface-hidden ${showAnimation && 'transition-all duration-500'} `}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: isHide ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                    >
                        <div className={`flex-col h-full w-full md:p-2 p-1 `} style={{ color: color, fill: color }}>
                            {isJoker ? <div className="flex justify-end items-center">
                                <div className="md:w-[30px] w-[20px]"
                                    style={{ fill: "red" }}>
                                    {icon}
                                </div>
                                <span className="font-bold md:text-[1em] text-[1em] "
                                    style={{
                                        textOrientation: "upright",
                                        writingMode: "vertical-rl",
                                        fontFamily: "'__Rubik_b539cb','__Rubik_Fallback_b539cb'"
                                    }}
                                >{rank}</span>
                            </div> : <>
                                <span className="font-bold md:text-[2.2em] text-[1.5em]">{rank}</span>
                                <div className="w-1/2">
                                    {icon}
                                </div>
                            </>}

                        </div>
                    </div>
                    <div
                        className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-sm shadow-md ${showAnimation && 'transition-transform duration-500'} border-2`}
                        style={{
                            backfaceVisibility: 'hidden',
                            background: 'green',
                            transform: isHide ? 'rotateY(0deg)' : 'rotateY(180deg)',
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

const HCardItem = ({ card, y, showAnimation }: { card?: Card | null, y: number, showAnimation: boolean }) => {
    const [_card, setCard] = useState<Card | null>();
    const [isHide, setHide] = useState(true);
    let icon: any = "", color = "", rank = "";
    let isJoker: boolean = false;
    if (_card) {
        if (_card.rank !== 'Joker' && _card.suit) {
            rank = _card.rank;
            icon = suits[_card.suit].icon;
            color = suits[_card.suit].color;
        } else {
            icon = suits["Joker"].icon;
            isJoker = true;
            rank = "JOKER";
        }
    }
    useEffect(() => {
        if (card) {
            setCard(card);
            setHide(false);
        } else {
            setHide(true);
        }
    }, [card])
    return (
        <div
            className="w-[100%] select-none"
            style={{
                perspective: '3000px',
                aspectRatio: '2 / 3',
            }}
        >
            <div
                className={`w-full h-full flex items-center justify-center rounded-sm shadow-md  duration-500 ${isHide ? 'transform rotate-y-180' : 'transition-transform ease-in-out'
                    }`}
                style={{ position: 'relative', transformStyle: 'preserve-3d' }}
            >
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-white rounded-sm shadow-md backface-hidden ${showAnimation && 'transition-all duration-500'} `}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: isHide ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    <div className={`flex-col h-full w-full md:p-2 p-1 `} style={{ color: color, fill: color }}>
                        {isJoker ? <div className="flex justify-end items-center">
                            <div className="md:w-[30px] w-[20px]"
                                style={{ fill: "red" }}>
                                {icon}
                            </div>
                            <span className="font-bold md:text-[.8em] text-[.7em] "
                                style={{
                                    textOrientation: "upright",
                                    writingMode: "vertical-rl",
                                    fontFamily: "'__Rubik_b539cb','__Rubik_Fallback_b539cb'"
                                }}
                            >{rank}</span>
                        </div> : <>
                            <span className="font-bold md:text-[1.8em] text-[1.5em]">{rank}</span>
                            <div className="w-1/2">
                                {icon}
                            </div>
                        </>}

                    </div>
                </div>
                <div
                    className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-sm shadow-md ${showAnimation && 'transition-transform duration-500'} border-2`}
                    style={{
                        backfaceVisibility: 'hidden',
                        background: 'green',
                        transform: isHide ? 'rotateY(0deg)' : 'rotateY(180deg)',
                    }}
                ></div>
            </div>
        </div>
    );
}


const StatusBar = ({ dt, delyTime, status }: { dt: number, delyTime: number, status: GameStatus }) => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            const pro = (100 / delyTime) * (Date.now() - dt);
            setProgress(pro > 100 ? 100 : pro);
        }, 30);
        return () => {
            clearInterval(timer)
        }
    }, [dt, delyTime, status])
    return <div className="flex flex-col w-full">
        <div className="text-white font-bold text-sm">{Math.floor((delyTime - (Date.now() - dt)) / 1000) + 1}s</div>
        <div className="flex w-full justify-start overflow-hidden rounded-md bg-[#4e4e4e]">
            <div className={`md:h-[3px] h-[2px] rounded-md ${status === GameStatus.CALCULATIONG ? "bg-[#ff682c]" : "bg-[#2ddf2dde]"}`} style={{ width: `${100 - progress}%` }}></div>
        </div>
    </div>
}