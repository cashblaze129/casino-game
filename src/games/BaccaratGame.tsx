import { useCallback, useEffect, useRef, useState } from "react";
import Container from "../components/Container"
import AmountInput from "../components/AmountInput";
import Button from "../components/Button";
import { DefaultAvatar } from "../components/CurrentBets";
import io, { Socket } from "socket.io-client";

import betaudio from "../assets/audio/bet.DUx2OBl3.mp3"
import dealing from "../assets/audio/deal.bN7zuU7A.mp3"
import flipaudio from "../assets/audio/flip.xdzctLJY.mp3"
import winaudio from "../assets/audio/win.BpDMfFMt.mp3"
import endaudio from "../assets/audio/mucked.BMTcJIOd.mp3"

import useIsMobile from "../hooks/useIsMobile";
import { API_URL } from "../config";
import ChipButtonGroup, { ChipButton, formatChipValue } from "../components/ChipButtonGroup";
import CurrencyIcon from "../components/CurrencyIcon";
import formatAmount from "../utils/formatAmount";
import backgroundImg from "../assets/img/baccaratbg.png"
import SwitchTab from "../components/SwitchTab";
import CustomInput from "../components/CustomInput";
import { buildPrivateHash } from "../utils/crash";
import { toast } from "react-toastify";
import { CopyIcon } from "../components/svgs";

const socket: Socket = io(`${API_URL}/baccarat`);

const betAudio = new Audio();
const dealAudio = new Audio();

betAudio.src = betaudio;
dealAudio.src = dealing;

const multipliers = {
    'Player': 1.94,  // 1.94 instead of 2.0
    'Banker': 1.89,  // 1.89 instead of 1.95
    'Tie': 8.74,     // 8.74 instead of 9.0
    'PPair': 11.65,  // 11.65 instead of 12.0
    'BPair': 11.65   // 11.65 instead of 12.0
};

enum STATUS {
    WAITING,
    STARTING,
    BETTING,
    THIRD_CARD_BETTING,
    PLAYING,
    SETTLEMENT
}
type Chip = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const chipValues = [1, 10, 100, 1000, 10000, 100000, 1000000];
const ratio = 100000;
type Place = 'Player' | 'Banker' | 'Tie' | 'PPair' | 'BPair';

type Bet = {
    place: Place;
    chip: Chip;
}

type Player = {
    PlayerID: string,
    bets: Bet[],
    currencyId: string
}

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
    suit: Suit;
    rank: Rank;
}

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
    }
}


const playAudio = (key: string) => {
    try {
        if (key === "bet") {
            if (betaudio) {
                const auido = new Audio();
                auido.src = betaudio;
                auido.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "deal") {
            if (dealing) {
                const auido = new Audio();
                auido.src = dealing;
                auido.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "flip") {
            if (flipaudio) {
                const auido = new Audio();
                auido.src = flipaudio;
                auido.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "win") {
            const auido = new Audio();
            auido.src = winaudio;
            auido.play().then(() => { }).catch((error: any) => {
                console.log("Failed to autoplay audio:", error);
            });
        } else if (key === "end") {
            const audio = new Audio();
            audio.src = endaudio;
            audio.play().then(() => { }).catch((error: any) => {
                console.log("Failed to autoplay audio:", error);
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const calculateScore = (hand: Card[]): number => {
    const score = hand.reduce((total, card) => {
        if (card.rank === 'A') return total + 1;
        if (['J', 'Q', 'K', '10'].includes(card.rank)) return total;
        return total + parseInt(card.rank, 10);
    }, 0);

    return score % 10;
}

let THIRD_CARD_DELAY = 1000;
let RESTART_DELAY = 1000;
let BETTING_DELAY = 9000;
let SETTLEMENT_DELAY = 9000;
const BaccaratGame = () => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState(0);
    const [chipIndex, setChipIndex] = useState<Chip>(0);
    const [placeIndex, setPlaceIndex] = useState<Place | undefined>();

    const [bets, setBets] = useState<Record<string, { playerId: string, chip: Chip, place: Place, currencyId: string }[]>>({});
    const [chips, setChips] = useState<Record<any, { playerId: string, chip: Chip; place: Place, x: number, y: number, r: number, self?: boolean, currencyId: string }[]>>({});

    const [history, setHistory] = useState<any[]>([]);

    const [privateHash, setPriviateHash] = useState<string>("");
    const [publichSeed, setPublicSeed] = useState<string>("");

    const [status, setStatus] = useState<STATUS>(STATUS.WAITING);

    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [bankerHand, setBankerHand] = useState<Card[]>([]);

    const [result, setResult] = useState<any>({});

    const [visible, setVisibleModal] = useState(false);

    const [userId, setUserId] = useState<string>("");
    const elapsed = useRef(0);

    const gameData = (data: any) => {
        console.log(data);
        setUserId(data.playerId);
        handleStatus(data.status);
        setPriviateHash(data.hashedServerSeed);
        setPublicSeed(data.clientSeed);
        setPlayerHand([...data.playerHand]);
        setBankerHand([...data.bankerHand]);
        THIRD_CARD_DELAY = data.THIRD_CARD_DELAY;
        RESTART_DELAY = data.RESTART_DELAY;
        BETTING_DELAY = data.BETTING_DELAY;
        SETTLEMENT_DELAY = data.SETTLEMENT_DELAY;
        elapsed.current = Date.now() + data.elapsed;
    }

    const handleStatus = (data: any) => {
        console.log(STATUS[data.status], data);
        elapsed.current = Date.now();
        if (data.status === STATUS.WAITING) {
        } else if (data.status === STATUS.STARTING) {
            playAudio("end");
            setVisibleModal(false);
            setResult({});
            setBets({});
            setChips({});
            setBankerHand([]);
            setPlayerHand([]);
        } else if (data.status === STATUS.BETTING) {

        } else if (data.status === STATUS.PLAYING) {

        }
        setStatus(data.status)
    };

    const roundStart = (data: any) => {
        setPriviateHash(data.hashedServerSeed);
        setPublicSeed(data.clientSeed);
    }

    const dealCard = (data: any) => {
        const { player, banker }: { player: Card[], banker: Card[] } = data;
        setPlayerHand([...playerHand, ...player]);
        setBankerHand([...bankerHand, ...banker]);
    }

    const onBetRes = (data: any) => {
        console.log("bet res--", data);
        if (data.status) {
            playAudio("bet");
        }
    }

    const onbet = (data: any) => {
        console.log("bet---", data);
        if (!bets[data.playerId]?.length) {
            bets[data.playerId] = [];
        }
        bets[data.playerId].push({
            playerId: data.playerId,
            place: data.place,
            chip: data.chip,
            currencyId: data.currencyId
        });

        setBets({ ...bets });

        if (!chips[data.place]?.length) {
            chips[data.place] = [];
        }
        chips[data.place].push({
            playerId: data.playerId,
            place: data.place,
            chip: data.chip,
            x: Math.random() * 20 - 10,
            y: Math.random() * 20 - 10,
            r: (Math.random() * 360),
            self: data.playerId === userId,
            currencyId: data.currencyId
        });

        setChips({ ...chips });

    }

    const onCancelbetRes = (data: any) => {

    }

    const onCancelBet = (data: any) => {
        if (data.status && bets[data.player.playerId]) {
            const bet: any = bets[data.player.playerId].pop();
            if (!bets[data.player.playerId].length) {
                delete bets[data.player.playerId]
            }
            setBets({ ...bets });
            chips[bet.place] = chips[bet.place].filter((c: any) => c.playerId == data.player.playerId).slice(0, -1);;
            setChips({ ...chips });
        }
    }


    const onClearBetRes = (data: any) => {

    }

    const onClearBet = (data: any) => {
        if (data.status && bets[data.player.playerId]) {
            for (let place in chips) {
                chips[place] = chips[place].filter((c: any) => c.playerId !== data.player.playerId);
            }
            setChips({ ...chips });
            delete bets[data.player.playerId];
            setBets({ ...bets });
        }
    };

    const onResult = (data: any) => {
        setTimeout(() => {
            setResult(data);
            if (bets[userId]?.length && bets[userId].findIndex((b) => b.place === data.winner) !== -1) {
                setVisibleModal(true);
                playAudio("win")
            }
        }, 1500);
    }

    const handleBet = () => {
        if ((status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING) && placeIndex) {
            socket.emit("bet", { chip: chipIndex, place: placeIndex, currencyId: "eth" });
        }
    }

    const clearBet = () => {
        if (status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING) {
            socket.emit("clear");
        }
    }

    const cancelBet = () => {
        if (status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING) {
            socket.emit("cancel");
        }
    }

    const getButtonContent = () => {
        if (status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING) {
            return "Short bet"
        } else if (status === STATUS.SETTLEMENT) {
            return "Waitting..."
        }
        return "Starting..."
    }

    const onChooseChip = (chip: any) => {
        setChipIndex(chip);
    }

    const onChoosePlace = (place: Place) => {
        setPlaceIndex(place);
        if (status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING) {
            socket.emit("bet", { chip: chipIndex, place: place, currencyId: "eth" });
        }
    }

    const getTotalBet = (playerId: string) => {
        let total = 0;
        for (let value in bets) {
            if (playerId === value) {
                for (let i = 0; i < bets[value].length; i++) {
                    total += (chipValues[bets[value][i]?.chip] || 0) / ratio;
                }
            }
        }
        return total;
    }

    const getBets = () => {
        let _bets = [];
        for (let value in bets) {
            let total = 0;
            for (let i = 0; i < bets[value].length; i++) {
                total += (chipValues[bets[value][i]?.chip] || 0) / ratio;
            }
            _bets.push({
                betAmount: total,
                playerID: value,
                name: value,
                // avatar:
            })
        }
        return _bets;
    }

    const getDelay = (): number => {
        if (status === STATUS.WAITING) {
            return 0;
        } else if (status === STATUS.STARTING) {
            return RESTART_DELAY;
        } else if (status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING) {
            return BETTING_DELAY;
        } else if (status === STATUS.PLAYING) {
        } else if (status === STATUS.SETTLEMENT) {
            return SETTLEMENT_DELAY
        }
        return 0;
    }

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Server connected");
        })

        socket.on("disconnect", () => {
            console.log("Server disconnected");
        })

        socket.on("game-data", gameData)
        socket.on("game-status", handleStatus)
        socket.on("round-start", roundStart)

        socket.on("deal-card", dealCard);
        socket.on("bet-res", onBetRes);
        socket.on("bet", onbet);
        socket.on("cancelbet-res", onCancelbetRes);
        socket.on("cancelbet", onCancelBet);
        socket.on("clearbet-res", onClearBetRes);
        socket.on("clearbet", onClearBet);
        socket.on("result", onResult);


        return () => {
            socket.off("connection");
            socket.off("disconnect");

            socket.off("game-data")
            socket.off("game-status")
            socket.off("round-start")

            socket.off("deal-card");
            socket.off("bet-res");
            socket.off("bet");
            socket.off("cancelbet-res");
            socket.off("cancelbet");
            socket.off("clear-res");
            socket.off("result");
        }
    }, [status, history, playerHand, bankerHand]);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit("init");
        return () => {
            if (!socket.disconnected)
                socket.disconnect()
        }
    }, [])
    const disable = !(status === STATUS.BETTING || status === STATUS.THIRD_CARD_BETTING);

    return <Container className="w-full bg-[#10100f] h-full flex justify-center ">
        <div className={`max-w-[1300px] mt-5 ${isMobile ? "w-full p-1" : "w-full"} `}>
            <div className="grid grid-cols-1 sm:grid-cols-4 rounded-md overflow-hidden  bg-panel shadow-md">
                {!isMobile &&
                    <div className="col-span-1 p-2 min-h-[560px] bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-between">
                        <div className="flex flex-col">
                            <SwitchTab active={activeTab} onChange={setActiveTab} options={["BET", "Fairness"]} />
                            {activeTab == 0 ? <>
                                <ChipButtonGroup chipValues={chipValues} onChooseChip={onChooseChip} selected={chipIndex} label={<div className="flex mt-5 items-center">
                                    <div className="text-white font-bold text-sm">Chip Value {(chipValues[chipIndex] / ratio).toString()}</div>  <div className="mx-1 w-4"><CurrencyIcon /></div>
                                </div>} />
                                <AmountInput onChange={() => { }} value={getTotalBet(userId)} disabled={true} />
                                <Button disabled={disable} onClick={handleBet}>
                                    {getButtonContent()}
                                </Button>
                            </> : <>
                                <FairnessView privateHash={privateHash} publicSeed={publichSeed} privateSeed={result?.serverSeed || ""} />
                            </>}
                        </div>
                        {activeTab === 0 &&
                            <CurrentBets bets={getBets()} />
                        }
                    </div>
                }
                <div className={`col-span-3 ${isMobile ? "min-h-[400px] " : "min-h-[300px] "} relative h-full overflow-hidden`}>
                    <div className="flex flex-col md:p-5 p-1 justify-between h-full w-full">
                        <div className="flex w-full justify-between h-full rounded-md pb-8 " style={{
                            background: `url(${backgroundImg})`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: isMobile ? "40%" : "30%",
                            backgroundPosition: "center 90%"
                        }}>
                            <div className="w-1/2">
                                <CardComponent Hand={playerHand} dealPosition={{ x: 1000, y: -300 }} Label="Payer" />
                            </div>
                            <div className="w-1/2">
                                <CardComponent Hand={bankerHand} dealPosition={{ x: 500, y: -300 }} Label="Banker" />
                            </div>
                        </div>
                        <ProgressBar elapsed={elapsed.current} delay={getDelay()} disabled={disable} />
                        <PlacesSVG onChoosePlace={onChoosePlace} bets={bets} chips={chips} result={result} />
                        <div className="flex justify-between">
                            <button className="h-5 fill-white flex text-white font-bold items-center" onClick={cancelBet}>
                                <div className="w-6 px-1">
                                    <svg viewBox="0 0 64 64" >
                                        <path d="M37.973 11.947H16.24l5.84-5.84L15.973 0 .053 15.92l15.92 15.92 6.107-6.107-5.76-5.76h21.653C47.92 19.973 56 28.053 56 38c0 9.947-8.08 18.027-18.027 18.027h-21.76v8h21.76C52.347 64.027 64 52.373 64 38c0-14.373-11.653-26.027-26.027-26.027v-.026Z"></path></svg>
                                </div>
                                <div>Undo</div>
                            </button>
                            <button className="h-5 fill-white flex text-white font-bold items-center" onClick={clearBet}>
                                <div>Clear</div>
                                <div className="w-6 px-1">
                                    <svg viewBox="0 0 64 64" >
                                        <path fillRule="evenodd" clipRule="evenodd" d="M31.943 13.08c-9.37 0-17.128 6.904-18.476 16.004l4.798-.002-9.146 12.96-9.12-12.96h5.334l.012-.124C6.889 15.536 18.291 5.112 32.127 5.112a26.823 26.823 0 0 1 17.5 6.452l-5.334 6.186.02.018a18.584 18.584 0 0 0-12.37-4.688Zm22.937 8.752L64 34.792h-5.174l-.01.12C57.332 48.398 45.902 58.888 32.02 58.888a26.826 26.826 0 0 1-17.646-6.576l5.334-6.186a18.597 18.597 0 0 0 12.47 4.776c9.406 0 17.188-6.96 18.49-16.11h-4.934l9.146-12.96ZM19.708 46.126l-.016-.014.016.014Z"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="min:w-[60px] absolute right-0 top-0 -translate-y-2/3 translate-x-1/2 w-[60px] md:w-[100px] rounded-lg shadow-md bg-[#21bd13] border-2 border-b-8"
                        style={{
                            transformStyle: 'preserve-3d',
                            perspective: '1000px',
                            aspectRatio: '2 / 3',
                        }}
                    >
                    </div>
                    <ResultModal visible={visible} bets={bets[userId] || []} result={result} onClose={() => setVisibleModal(false)} />
                </div>
                {isMobile &&
                    <div className="col-span-1 p-2 min-h-[560px] bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-between">
                        {activeTab === 0 && <>
                            <ChipButtonGroup chipValues={chipValues} onChooseChip={onChooseChip} selected={chipIndex} label={<div className="flex items-center">
                                <div className="text-white font-bold text-sm">Chip Value {(chipValues[chipIndex] / ratio).toString()}</div>  <div className="mx-1 w-4"><CurrencyIcon /></div>
                            </div>} />
                            <Button disabled={disable} onClick={handleBet}>
                                {getButtonContent()}
                            </Button>
                            <AmountInput onChange={() => { }} value={getTotalBet(userId)} disabled={true} />
                            <CurrentBets bets={getBets()} />
                        </>}
                        <SwitchTab active={activeTab} onChange={setActiveTab} options={["BET", "Fairness"]} />
                        {activeTab === 1 && <>
                            <FairnessView privateHash={privateHash} publicSeed={publichSeed} privateSeed={result?.serverSeed || ""} />
                        </>}
                    </div>
                }
            </div>
        </div>
    </Container>
}

export default BaccaratGame;

const ProgressBar = ({ elapsed, delay, disabled }: { elapsed: number, delay: number, disabled: boolean }) => {
    const [progress, setPercent] = useState<number>(100);
    useEffect(() => {
        if (progress > 0 && delay && (elapsed + delay) > Date.now()) {
            setTimeout(() => {
                setPercent((100 / delay) * (Date.now() - elapsed));
            }, 80)
        }
    }, [progress, elapsed])
    return <div className="px-2">
        <div className="flex w-full md:h-[5px] h-[3px] bg-[#181818] rounded-sm">
            <div className="h-full  transition-all duration-75 " style={{ width: `${100 - progress}%`, backgroundColor: disabled ? "#c58634" : "#1b8b46" }}>

            </div>
        </div>
    </div>
}


const CardComponent = ({ Hand, dealPosition, Label }: { Hand: Card[], dealPosition: { x: number, y: number }, Label: string }) => {
    const [hands, setHands] = useState<Card[]>([]);

    useEffect(() => {
        const newHands = Hand.filter((hand, index) => {
            return !hands[index] || hand.rank !== hands[index].rank || hand.suit !== hands[index].suit;
        });

        if (newHands.length > 0) {
            setTimeout(() => {
                playAudio("deal");
                // setTimeout(() => {
                //     playAudio("flip");
                // }, 400);
                setHands([
                    ...hands,
                    newHands[0]
                ])
            }, 700)
        }

        if (Hand.length === 0 && hands.length) {
            setHands([]);
        }

    }, [Hand, hands]);

    return (
        <>
            <div className="flex items-center justify-center h-full transition-all duration-500">
                <div className="ml-[2.5rem] flex relative]">
                    {hands.map((card: Card, index: number) => {
                        const Icon = suits[card.suit]?.icon;
                        const Color = suits[card.suit]?.color;
                        const moveTime = `${0.3}s`;
                        const delayTime = `${0.4}s`;
                        const rotateTime = `0.3s`;
                        return (
                            <div
                                key={index}
                                className={`ml-[-2.5rem] cursor-pointer animate-baccaratDeal`}
                                style={{
                                    transform: `translate(${dealPosition.x}px, ${dealPosition.y}px) scale(.8)`,
                                    animationTimingFunction: "ease-out",
                                    animationDuration: moveTime
                                }}
                            >
                                <div className="min:w-[60px] w-[60px] md:w-[100px] select-none"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px',
                                        aspectRatio: '2 / 3',
                                    }}
                                >
                                    <div
                                        className={`w-full h-full flex items-center justify-center rounded-lg shadow-md transition-transform duration-700 ease-in-out`}
                                        style={{
                                            position: 'relative',
                                            transformStyle: 'preserve-3d',
                                        }}
                                    >
                                        {/* Card Front */}
                                        <div
                                            className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md transition-transform duration-500"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(-180deg)',
                                                color: Color,
                                                animationDelay: delayTime,
                                                animationDuration: rotateTime
                                            }}
                                        >
                                            <div className="flex-col h-full w-full md:p-2 p-1">
                                                <span className="font-bold md:text-[2.2em]">{card.rank}</span>
                                                <div className="w-1/2">{Icon}</div>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute inset-0 w-full animate-cardRotate180 h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                                transform: 'rotateY(deg)',
                                                animationDelay: delayTime,
                                                animationDuration: rotateTime
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="flex  justify-center text-white font-bold">
                <div className="rounded-2xl bg-green-500 px-3">{calculateScore(hands)}</div>
            </div>
        </>
    );
};

const PlacesSVG = ({ onChoosePlace, bets, chips, result }: { onChoosePlace: (p: Place) => void, bets: Record<string, any[]>, chips: Record<string, any[]>, result: any }) => {
    const isMobile = useIsMobile();
    const [show, setShow] = useState(false);
    const handlePlace = (p: Place) => {
        onChoosePlace(p);
    }

    const getAmoutns = (place: Place) => {
        let mscore = 0;
        let totalscore = 0;

        if (chips[place]) {
            for (let i = 0; i < chips[place].length; i++) {
                if (chips[place][i]?.self) {
                    mscore += chipValues[chips[place][i].chip];
                }
                totalscore += chipValues[chips[place][i].chip];
            }
        }
        return `${formatChipValue(mscore)}/${formatChipValue(totalscore)}`;
    }

    useEffect(() => {
        let interval: any;
        if (result?.winner) {
            interval = setInterval(() => {
                setShow((prev) => !prev)
            }, 700)
        }
        return () => {
            setShow(false);
            clearInterval(interval);
        }
    }, [result])

    return isMobile ? (
        <div className="relative">
            <svg viewBox="0 0 388 129">
                <path className={`cursor-pointer ${(show && result?.winner == "Player") ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="Player" d="M5.6,0C2.5,0,0,2.5,0,5.6v54h194V0H5.6z"></path>
                <path className={`cursor-pointer ${(show && result?.winner == "Banker") ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="Banker" d="M388,5.6c0-3.1-2.5-5.6-5.6-5.6H194v59.6h194V5.6z"></path>
                <path className={`cursor-pointer ${(show && result?.ppair) ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="PPair" d="M0,59.6v29.6c0,2.3,1.4,4.4,3.6,5.2c41,15.4,82.9,25.6,125.7,30.7V59.6H0z"></path>
                <path className={`cursor-pointer ${(show && result?.bpair) ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="BPair" d="M258.3,59.6v65.6c43.1-5.1,85.1-15.4,126-30.8c2.2-0.8,3.6-2.9,3.6-5.2V59.6H258.3z"></path>
                <path className={`cursor-pointer ${(show && result?.winner == "Tie") ? "fill-[#3e8a9775]" : "fill-[#888d8675]"} `} name="Tie" d="M129.4,59.6v65.5c21.4,2.6,43,3.8,64.9,3.8c21.6,0,43-1.3,64-3.7V59.6H129.4z"></path>
                <line id="Line-Copy-3" className="fill-none stroke-[#181717]" x1="193.5" y1="0.2" x2="193.5" y2="59.4"
                    style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}>
                </line>
                <line id="Line-Copy-4" className="fill-none stroke-[#181717]" x1="257.8" y1="59.8" x2="257.8" y2="123.8" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}>
                </line>
                <line id="Line-Copy-5" className="fill-none stroke-[#181717]" x1="128.8" y1="59.8" x2="128.8" y2="123.8" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}>
                </line>
                <line id="Line-Copy-2" className="fill-none stroke-[#181717]" x1="0.8" y1="59.4" x2="387.8" y2="59.4" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}>
                </line>
            </svg>
            <div onClick={() => { handlePlace("Tie") }} className="absolute select-none cursor-pointer left-[33.3%] top-[44%] w-[33.3%] h-[50%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["Tie"]}</p>
                    </div>
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("Tie")}</p>
                    </div>
                    <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]" >TIE</p>
                    </div>
                    <PlacedChips chips={chips["Tie"] || []} label="Tie" />
                </div>
            </div>
            <div onClick={() => { handlePlace("PPair") }} className="absolute select-none cursor-pointer left-0 top-[44%] w-[33.3%] h-[50%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className="">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["PPair"]}</p>
                    </div>
                    <div className="">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("PPair")}</p>
                    </div>
                    <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">P PAIR</p>
                    </div>
                    <PlacedChips chips={chips["PPair"] || []} label="PPair" />
                </div>
            </div>
            <div onClick={() => { handlePlace("BPair") }} className="absolute select-none cursor-pointer left-[66.6%] top-[44%] w-[33.3%] h-[50%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["BPair"]}</p>
                    </div>
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("BPair")}</p>
                    </div>
                    <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">B PAIR</p>
                    </div>
                    <PlacedChips chips={chips["BPair"] || []} label="BPair" />
                </div>
            </div>
            <div onClick={() => { handlePlace("Player") }} className="absolute select-none cursor-pointer left-0 top-0 w-[50%] h-[44%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["Player"]}</p>
                    </div>
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]  uppercase">{getAmoutns("Player")}</p>
                    </div>
                    <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">PLAYER</p>
                    </div>
                    <PlacedChips chips={chips["Player"] || []} label="Player" />
                </div>
            </div>
            <div onClick={() => { handlePlace("Banker") }} className="absolute select-none cursor-pointer right-0 top-0 w-[50%] h-[44%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className=" absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">BANKER</p>
                    </div>
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["Banker"]}</p>
                    </div>
                    <div>
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("Banker")}</p>
                    </div>
                    <PlacedChips chips={chips["Banker"] || []} label="Banker" />
                </div>
            </div>
        </div >
    ) : (
        <div className="relative">
            <svg viewBox="0 0 692 194">
                <path className={`cursor-pointer ${(show && result?.winner == "Player") ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="Player" d="M10,0C4.5,0,0,4.5,0,10v113.1c0,4.2,2.6,7.9,6.5,9.4c61,22.8,123.1,39.3,186.5,49.4V0H10z"></path>
                <path className={`cursor-pointer ${(show && result?.winner == "Banker") ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="Banker" d="M682,0H499.6v181.9c63.3-10.1,125.3-26.6,185.9-49.5c3.9-1.5,6.5-5.2,6.5-9.4V10C692,4.5,687.5,0,682,0z"></path>
                <path className={`cursor-pointer ${(show && result?.ppair) ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="PPair" d="M193,91v90.9c50.4,8,101.5,12.1,153.3,12.1V91H193z"></path>
                <path className={`cursor-pointer ${(show && result?.bpair) ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="BPair" d="M346.3,91v103c0.1,0,0.1,0,0.2,0c51.8,0,102.9-4,153.1-12V91H346.3z"></path>
                <polygon className={`cursor-pointer ${(show && result?.winner == "Tie") ? "fill-[#3e8a9775]" : result?.winner ? "fill-[#888d8649]" : "fill-[#888d8675]"} `} name="Tie" points="346.3,0 193,0 193,91 346.3,91 499.6,91 499.6,0"></polygon>
                <line id="Line-Copy" className="fill-none stroke-[#181717]" x1="193" y1="0.8" x2="193" y2="181.8" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}></line>
                <line id="Line-Copy-4" className="fill-none stroke-[#181717]" x1="499.6" y1="0.8" x2="499.6" y2="181.8" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}></line>
                <line id="Line-Copy-3" className="fill-none stroke-[#181717]" x1="346.4" y1="91.8" x2="346.4" y2="193.8" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}></line>
                <line id="Line-Copy-2" className="fill-none stroke-[#181717]" x1="193.9" y1="91.4" x2="499" y2="90.9" style={{ strokeLinecap: 'square', strokeDasharray: '5, 4' }}></line>
            </svg>
            <div onClick={() => { handlePlace("Tie") }} className="absolute select-none cursor-pointer left-[28%] top-0 w-[44%] h-[45%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["Tie"]}</p>
                    </div>
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("Tie")}</p>
                    </div>
                    <div className=" absolute top-1/2 left-1/2 -translate-x-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">TIE</p>
                    </div>
                    <PlacedChips chips={chips["Tie"] || []} label="Tie" />
                </div>
            </div>
            <div onClick={() => { handlePlace("PPair") }} className="absolute select-none cursor-pointer left-[28%] top-[45%] w-[22%] h-[55%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["PPair"]}</p>
                    </div>
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("PPair")}</p>
                    </div>
                    <div className=" absolute top-1/2 left-1/2 -translate-x-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">P PAIR</p>
                    </div>
                    <PlacedChips chips={chips["PPair"] || []} label="PPair" />
                </div>
            </div>
            <div onClick={() => { handlePlace("BPair") }} className="absolute select-none cursor-pointer left-[50%] top-[45%] w-[22%] h-[55%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["BPair"]}</p>
                    </div>
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("BPair")}</p>
                    </div>
                    <div className=" absolute top-1/2 left-1/2 -translate-x-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">B PAIR</p>
                    </div>
                    <PlacedChips chips={chips["BPair"] || []} label="BPair" />
                </div>
            </div>
            <div onClick={() => { handlePlace("Player") }} className="absolute select-none cursor-pointer left-0 top-0 w-[28%] h-[80%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["Player"]}</p>
                    </div>
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("Player")}</p>
                    </div>
                    <div className=" absolute top-1/2 left-1/2 -translate-x-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">PLAYER</p>
                    </div>
                    <PlacedChips chips={chips["Player"] || []} label="Player" />
                </div>
            </div>
            <div onClick={() => { handlePlace("Banker") }} className="absolute select-none cursor-pointer right-0 top-0 w-[28%] h-[80%]">
                <div className="relative w-full h-full flex justify-between text-[#ffffff6c] p-1">
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px]">x{multipliers["Banker"]}</p>
                    </div>
                    <div className="flex">
                        <p className="text-tertiary text-[12px] leading-[14px] lg:text-[1rem] m-[2px] lg:leading-[24px] uppercase">{getAmoutns("Banker")}</p>
                    </div>
                    <div className=" absolute top-1/2 left-1/2 -translate-x-1/2">
                        <p className="m-0 text-[12px] leading-[14px] lg:text-[1rem] font-bold lg:leading-[24px] text-[#ffffff38]">BANKER</p>
                    </div>
                    <PlacedChips chips={chips["Banker"] || []} label="Banker" />
                </div>
            </div>
        </div>)
}

const CurrentBets = ({ bets }: { bets: any[] }) => {
    return (
        <div className="mt-5">
            <div className="h-[250px] overflow-y-auto bg-panel  rounded-sm ">
                {bets.map((row, index) => (
                    <div
                        key={index}
                        className={`flex px-3 py-1.5 items-center hover:bg-[#29374793] justify-between ${index % 2 === 0 ? "bg-opacity-10" : ""}`}
                    >
                        <div className="flex items-center w-3/5">
                            {!row?.avatar ? (
                                <div className="text-stone-100" style={{ width: "30px" }}>
                                    <DefaultAvatar />
                                </div>
                            ) : (
                                <img
                                    alt={row.name}
                                    src={row?.avatar || "default.png"}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <div className="text-xs px-1 font-[14px] text-white max-w-sm overflow-hidden text-ellipsis whitespace-nowrap ">
                                {row.name || row.playerID}
                            </div>
                        </div>

                        <div className="flex justify-center items-center">
                            <div className="w-4">
                                <CurrencyIcon />
                            </div>
                            <span
                                className={`text-xs px-1 ${row?.isWin ? "text-green-600" : "text-stone-100"
                                    } font-bold`}
                            >{formatAmount(row.betAmount)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PlacedChips = ({ chips, label }: { chips: { playerId: string, chip: Chip, place: Place, x: number, y: number, r: number, self?: boolean }[], label: string }) => {

    const isMobile = useIsMobile();

    return <div className="absolute left-1/2 top-1/2" >
        <div className="relative">
            {chips.map((chip, i: number) => {
                return (<div className={`w-[0px] h-[0px] ${chip.self ? "animate-actionChip" : "animate-actionChip1"}`} key={i} style={{
                    translate: `${isMobile ? (chip.x) / 10 : (chip.x)}px ${isMobile ? (chip.y) / 10 : (chip.y)}px`,
                    transform: `rotateZ(${chip.r}deg)`
                }}>
                    <ChipButton value={chipValues[chip.chip]} style={isMobile ? { minWidth: "15px !important", maxWidth: "15px", maxheight: "15px", minHeight: "15px", fontSize: "6px" } :
                        { minWidth: "25px !important", maxWidth: "25px", fontSize: "10px" }} />
                </div>)
            })}
        </div>
    </div>
}

const ResultModal = ({ visible, result, bets, onClose }: { visible?: boolean, result: any, onClose?: () => void, bets: { playerId: string, chip: Chip, place: Place, currencyId: string }[] }) => {
    const groupedArray = Object.values(
        bets.reduce((acc, { chip, place, currencyId }) => {
            console.log('currencyId', currencyId);
            if (!acc[currencyId]) {
                acc[currencyId] = { currency: <CurrencyIcon />, value: 0 };
            }
            let payout = 0;
            const chipValue = chipValues[chip] / ratio;
            if (result?.winner && place === result.winner) {
                payout += chipValue * multipliers[result?.winner as Place];
                if ((place === 'PPair' && result.ppair) || (place === 'BPair' && result.bpair)) {
                    payout += chipValue * multipliers[place];
                }
            }

            acc[currencyId].value += payout;
            return acc;
        }, {} as Record<string, { currency: any; value: number }>)
    );

    return visible ? <div onClick={onClose} className="top-0 left-0 absolute w-full h-full bg-[#00000048] flex justify-center items-center">
        <div className="relative animate-zoomIn w-[40%] min-h-40 border-2 rounded-md border-[#36e95d] bg-[#1a2c38] flex flex-col justify-between  p-2"
            style={{
                boxShadow: "0 0px 15px 3px rgb(0 188 15 / 73%), 0 4px 6px -4px rgb(86 252 26 / 75%)"
            }}
        >
            <div className="flex justify-center mt-1 text-2xl font-bold text-white text-center">YOU WIN!</div>
            <div className="text-lg mt-1 text-[#36e95d] uppercase flex justify-center font-bold">
                {`${multipliers[result?.winner as Place]}x`}  {result?.ppair && `+${multipliers["PPair"]}x`} {result?.bpair && `+${multipliers["BPair"]}x`}
            </div>
            <div className="flex flex-col text-white text-sm p-2">
                {groupedArray.map((value) => {
                    return <div className="flex justify-around">
                        <div>{formatAmount(value.value, 6)} </div>  <div className="w-6 h-6">{value.currency} </div>
                    </div>
                })}
            </div>
        </div>
    </div> : <></>
}

const SUITS: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];


function createDeck() {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}


const FairnessView = ({ publicSeed, privateHash, privateSeed }: { publicSeed: string, privateHash: string, privateSeed: string }) => {

    const [active, setActiveTab] = useState(0);

    const [bankerHand, setBankerHand] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);

    const [_privateSeed, setPrivateSeed] = useState("");
    const [_publicSeed, setPublicSeed] = useState("");

    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied!")
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    const dealHand = (deck: Card[], combinedHash: string, leng: number) => {
        const hand: Card[] = [];
        let hashIndex = 0;
        for (let i = 0; i < leng; i++) {
            const randomIndex = parseInt(combinedHash.slice(hashIndex, hashIndex + 8), 16) % deck.length;
            hand.push(deck[randomIndex]);
            deck.splice(randomIndex, 1);
            hashIndex += 8;
        }
        return { hand, deck };
    }

    const shouldBankerDraw = (bankerScore: number, playerThirdCard: Card) => {
        if (bankerScore <= 2) return true;
        if (!playerThirdCard) return false;

        const playerRank = playerThirdCard.rank;
        if (bankerScore === 3 && playerRank !== '8') return true;
        if (bankerScore === 4 && ['2', '3', '4', '5', '6', '7'].includes(playerRank)) return true;
        if (bankerScore === 5 && ['4', '5', '6', '7'].includes(playerRank)) return true;
        if (bankerScore === 6 && ['6', '7'].includes(playerRank)) return true;

        return false;
    }

    useEffect(() => {
        setPrivateSeed(privateSeed);
    }, [privateSeed]);

    useEffect(() => {
        setPublicSeed(publicSeed);
    }, [publicSeed])


    useEffect(() => {
        if (_privateSeed !== "" && _publicSeed !== "") {
            const combinedhash = buildPrivateHash(_privateSeed + _publicSeed);
            let _deck: Card[] = createDeck();
            const { hand: playerHand, deck: deck1 } = dealHand(_deck, combinedhash, 2);
            _deck = deck1;
            const { hand: bankerHand, deck: deck2 } = dealHand(_deck, combinedhash, 2);
            _deck = deck2;

            let playerScore = calculateScore(playerHand);
            let bankerScore = calculateScore(bankerHand);

            if (playerScore <= 5) {
                let { hand: playerThirdCard, deck: deck3 } = dealHand(_deck, combinedhash, 1);
                _deck = deck3;

                playerHand.push(playerThirdCard[0]);
                if (shouldBankerDraw(bankerScore, playerThirdCard[0])) {
                    let { hand: bankerThirdCard, deck: deck4 } = dealHand(_deck, combinedhash, 1);
                    bankerHand.push(bankerThirdCard[0]);
                }
            }

            setBankerHand(bankerHand);
            setPlayerHand(playerHand);
        }
    }, [_privateSeed, _publicSeed])

    return <>
        <SwitchTab options={["Seeds", "Verify"]} active={active} onChange={(e) => setActiveTab(e)} type={"sub"} />
        {active === 0 ? <>
            <CustomInput disabled={true} value={_privateSeed == "" ? publicSeed : ""} label={"Active Client Seed"} type="text" icon={<button onClick={() => copyToClipboard(publicSeed)} className="px-1 py-2 w-full "><CopyIcon /></button>} />
            <CustomInput disabled={true} value={_privateSeed == "" ? privateHash : ""} label={"Active Server Seed (Hashed)"} type="text" icon={<button onClick={() => copyToClipboard(privateHash)} className="px-1 py-2 w-full "><CopyIcon /></button>} />

            <div className="mt-4"></div>
            <CustomInput disabled={true} value={_privateSeed == "" ? "" : _publicSeed} label={"Previous Client Seed "} type="text" icon={<button onClick={() => copyToClipboard(publicSeed)} className="px-1 py-2 w-full "><CopyIcon /></button>} />
            <CustomInput disabled={true} value={_privateSeed == "" ? "" : _privateSeed} label={"Previous Server Seed"} type="text" icon={<button onClick={() => copyToClipboard(privateHash)} className="px-1 py-2 w-full "><CopyIcon /></button>} />
        </> : <>
            <div className="p-2 border-dashed mt-3 min-h-32 border-[1px] border-[#3dff23b4] rounded-md flex-col justify-center items-center font-bold text-[20px]">
                <div className="flex ml-[1rem] mt-2 justify-center" >
                    {bankerHand.map((card, index) => {
                        const Icon = suits[card.suit as Suit]?.icon;
                        const Color = suits[card.suit as Suit]?.color;
                        const rotateTime = `0.3s`;
                        return (
                            <div
                                key={index}
                                className={`ml-[-1rem] cursor-pointer `}
                            >
                                <div className="w-[50px] select-none"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px',
                                        aspectRatio: '2 / 3',
                                    }}
                                >
                                    <div
                                        className={`w-full h-full flex items-center justify-center rounded-lg shadow-md transition-transform duration-700 ease-in-out`}
                                        style={{
                                            position: 'relative',
                                            transformStyle: 'preserve-3d',
                                        }}
                                    >
                                        {/* Card Front */}
                                        <div
                                            className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md transition-transform duration-500"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(-180deg)',
                                                color: Color,
                                                animationDuration: rotateTime
                                            }}
                                        >
                                            <div className="flex-col h-full w-full md:p-2 p-1">
                                                <span className="font-bold md:text-[1.2em]">{card.rank}</span>
                                                <div className="w-1/2">{Icon}</div>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute inset-0 w-full animate-cardRotate180 h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                                transform: 'rotateY(deg)',
                                                animationDuration: rotateTime
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex ml-[1rem] mt-2 justify-center">
                    {playerHand.map((card, index) => {
                        const Icon = suits[card.suit as Suit]?.icon;
                        const Color = suits[card.suit as Suit]?.color;
                        const rotateTime = `0.3s`;
                        return (
                            <div
                                key={index}
                                className={`ml-[-1rem] cursor-pointer `}
                            >
                                <div className="w-[50px] select-none"
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px',
                                        aspectRatio: '2 / 3',
                                    }}
                                >
                                    <div
                                        className={`w-full h-full flex items-center justify-center rounded-lg shadow-md transition-transform duration-700 ease-in-out`}
                                        style={{
                                            position: 'relative',
                                            transformStyle: 'preserve-3d',
                                        }}
                                    >
                                        {/* Card Front */}
                                        <div
                                            className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md transition-transform duration-500"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                transform: 'rotateY(-180deg)',
                                                color: Color,
                                                animationDuration: rotateTime
                                            }}
                                        >
                                            <div className="flex-col h-full w-full md:p-2 p-1">
                                                <span className="font-bold md:text-[1.2em]">{card.rank}</span>
                                                <div className="w-1/2">{Icon}</div>
                                            </div>
                                        </div>

                                        <div
                                            className="absolute inset-0 w-full animate-cardRotate180 h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                                transform: 'rotateY(deg)',
                                                animationDuration: rotateTime
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <CustomInput onChange={setPrivateSeed} value={_privateSeed} label={"Server Seed"} type="text" />
            <CustomInput disabled={true} value={_privateSeed === "" ? "" : buildPrivateHash(_privateSeed || "")} type="text" label={"Server Seed(Hash)"} />
            <CustomInput onChange={setPublicSeed} value={_publicSeed} label={"Client Seed"} type="text" />
        </>}
    </>
}