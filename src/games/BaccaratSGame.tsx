import { useEffect, useRef, useState } from "react";
import Container from "../components/Container"
import AmountInput from "../components/AmountInput";
import Button from "../components/Button";
import chipBoard from '../assets/img/chipboard.svg';

import betaudio from "../assets/audio/bet.DUx2OBl3.mp3"
import dealing from "../assets/audio/deal.bN7zuU7A.mp3"
import flipaudio from "../assets/audio/flip.xdzctLJY.mp3"
import winaudio from "../assets/audio/win.BpDMfFMt.mp3"
import endaudio from "../assets/audio/mucked.BMTcJIOd.mp3"

import useIsMobile from "../hooks/useIsMobile";
import ChipButtonGroup from "../components/ChipButtonGroup";
import CurrencyIcon from "../components/CurrencyIcon";
import SwitchTab from "../components/SwitchTab";
import { toast } from "react-toastify";
import { useSelector } from "../store";
import axios from "../utils/axios";
import SettingBar from "../components/Setting";
import BetNumberInput from "../components/BetNumberInput";
import StopProfitAmount from "../components/StopAmount";
import FairnessView from "../components/FairnessView";

const betAudio = new Audio();
const dealAudio = new Audio();

betAudio.src = betaudio;
dealAudio.src = dealing;

type Chip = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const chipValues = [1, 10, 100, 1000, 10000, 100000, 1000000];
const ratio = 100000;
type Place = 'Player' | 'Banker' | 'Tie' | 'PPair' | 'BPair';

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
        } else if (key === "deal") {
            if (dealing) {
                const audio = new Audio();
                audio.src = dealing;
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
        } else if (key === "end") {
            const audio = new Audio();
            audio.src = endaudio;
            audio.volume = audioVolume;
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


const BaccaraStGame = () => {
    const isMobile = useIsMobile();
    const { currency } = useSelector((state) => state.auth);
    const { soundVolume, showGameAnimation, gameHotKeyEnabled } = useSelector((state) => state.setting);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [chipValue, selectChip] = useState(0);
    const [bets, setBets] = useState<{ place: Place, amount: number }[]>([])
    const [totalBet, setTotalAmount] = useState(0);

    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [bankerHand, setBankerHand] = useState<Card[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [clientSeed, setClientSeed] = useState<string>("");
    const [serverSeed, setServerSeed] = useState<string>("");
    const [serverSeedHash, setServerSeedHash] = useState<string>("");
    const [gameStart, setGameStart] = useState<boolean>(false);
    const [resultData, setResultData] = useState<any>();
    const [showResult, setShowResult] = useState<boolean>(false);

    const [stopProfitA, setStopPorfitA] = useState<number>(0);
    const [stopLossA, setStopLossA] = useState<number>(0);
    const [sumProfit, setSumProfit] = useState(0);
    const [sumLost, setSumLost] = useState(0);
    const [stoppedAutobet, setStoppedAutobet] = useState(false);
    const [autoBetting, setAutoBetting] = useState(false);
    const [autoBetCount, setAutoBetCount] = useState<number>(0);

    const disabled = loading || gameStart || autoBetting;

    const gameEnd = (!gameStart && resultData);

    const playerScore = calculateScore(playerHand);
    const bankerScore = calculateScore(bankerHand);
    const containRef = useRef<any>(null);

    const isAuto = activeTab == 1;

    const startBet = async () => {
        setLoading(true);
        setServerSeed("");
        const { data } = await axios.post("/baccarat/create", { clientSeed: clientSeed })
        if (data.status) {
            setClientSeed(data.clientSeed);
            setServerSeedHash(data.serverHash);

            if (autoBetting) {
                if (stoppedAutobet) {
                    setStoppedAutobet(false);
                    setAutoBetting(false);
                } else {
                    setTimeout(() => {
                        startAutoBet();
                    }, 3000)
                }
            }
        }
        setLoading(false);
    }

    const placeBet = async () => {
        if (loading) return;
        if (gameStart) return;
        if (stoppedAutobet) return;
        setLoading(true);
        if (bets.length === 0) {
            toast.error("Please place a bet");
        } else {
            setGameStart(true);
            if (bankerHand.length || playerHand.length) {
                setPlayerHand([]);
                setBankerHand([]);
                playAudio("end");
            }
            setResultData(null);
            setShowResult(false);
            playAudio("bet");
            const b: any = {};
            for (let bet of bets) {
                if (!b[bet.place]) {
                    b[bet.place] = 0;
                }
                b[bet.place] += bet.amount / ratio;
            }
            const { data } = await axios.post("/baccarat/bet", {
                currency: currency.symbol,
                bets: b
            })
            if (data.status) {
                setTimeout(() => {
                    setResultData(data);
                }, 1000)
            }
        }
        setLoading(false);
    }

    const startAutoBet = async () => {
        if (gameStart || loading || stoppedAutobet) return;
        if (!bets.length) {
            toast.error("Please place a bet");
            return;
        }
        if (!autoBetting) {
            setAutoBetting(true);
            setSumProfit(0);
            setSumLost(0);
            if (!autoBetCount) setAutoBetCount(Infinity);
            if (!stopProfitA) setStopPorfitA(Infinity);
            if (!stopLossA) setStopLossA(Infinity);
        } else {
            if (autoBetCount !== Infinity && autoBetCount - 1 === 0) {
                setAutoBetCount(0);
                return setAutoBetting(false);
            } else {
                setAutoBetCount((prev) => prev - 1);
            }
            if (stopProfitA !== Infinity && sumProfit >= stopProfitA) {
                return setAutoBetting(false);
            }
            if (stopLossA !== Infinity && sumLost >= stopLossA) {
                return setAutoBetting(false);
            }
        }
        placeBet();
    }

    const stopAutobet = async () => {
        if (!autoBetting || stoppedAutobet) return;
        setStoppedAutobet(true);
    }

    const renderChips = (placeId: Place) => {
        let value = 0;
        for (let bet of bets.filter((b) => b.place === placeId)) {
            value += bet.amount;
        }
        if (value === 0) {
            return <></>;
        }
        const chips = [];
        for (let i = chipValues.length - 1; i >= 0; i--) {
            if (value >= chipValues[i]) {
                const chipCount = Math.floor(value / chipValues[i]);
                chips.push({ chipIndex: i, count: chipCount });
                break;
            }
        }
        const getChipColor = (value: number): string => {
            if (value < 100) return '#5176a7';
            if (value < 1000) return '#2679e7';
            if (value < 10000) return '#8a5bed';
            if (value < 100000) return '#51e4ed';
            if (value < 1000000) return '#ed5151 ';
            if (value < 10000000) return '#CD7F32';
            return '#e7c651';
        };
        const formatChipValue = (value: number): string => {
            if (value >= 1e9) {
                return `${Number((value / 1e9).toFixed(4))}B`;
            } else if (value >= 1e6) {
                return `${Number((value / 1e6).toFixed(4))}M`;
            } else if (value >= 1e3) {
                return `${Number((value / 1e3).toFixed(3))}K`;
            }
            return Number(value.toFixed(2)).toString();
        };
        return (
            <div className="flex flex-col relative z-10">
                {chips.map((c, index1) => {
                    const color = getChipColor(chipValues[c.chipIndex]);
                    return Array.from({ length: c.count }).map((_, index2) => (
                        <div
                            key={`${c.chipIndex}-${index2}-${index1}`}
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{
                                top: `${(-1 * index2 * (index1 + 1))}px`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: `url(${chipBoard})`,
                                aspectRatio: '1',
                                width: isMobile ? '30px' : '40px',
                                minWidth: isMobile ? '30px' : '40px',
                                fontSize: isMobile ? '10px' : "12px",
                                backgroundColor: color,
                                borderRadius: '50%',
                                color: '#ffff',
                                fontWeight: 'bold',
                                userSelect: 'none',
                                boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.5)',
                                outline: '2px solid rgba(0, 0, 0, 0.3)',
                            }}
                        >
                            {index1 === chips.length - 1 && index2 === c.count - 1
                                ? formatChipValue(value)
                                : 0}
                        </div>
                    ));
                })}
            </div>
        );
    }

    const renderValue = (placeId: Place) => {
        let value: number = 0;
        for (let bet of bets) {
            if (bet.place === placeId) {
                value += bet.amount;
            }
        }
        return value / ratio;
    }

    const cancelBet = () => {
        if (disabled) return;
        const bet = bets.pop();
        setBets([...bets]);
    }

    const clearBet = () => {
        if (disabled) return;
        setBets([]);
    }

    const handlePlaceBet = (id: Place) => {
        if (disabled) return;
        setBets([...bets, { place: id, amount: chipValues[chipValue] }]);
        playAudio("bet")
    }

    const getCardPosition = (left: number, top: number, side: string) => {
        const container = containRef.current;
        if (!container) return { x: 0, y: 0 }
        let x = (container.clientWidth / 4 + left);
        let y = (container.clientHeight / 2 + top);
        x *= side === "left" ? -1 : 1;
        x = side === "center" ? 0 : x;
        return { x, y }
    }

    useEffect(() => {
        let total = bets.reduce((prev, curr) => {
            return { place: "", amount: prev.amount + curr.amount };
        }, { place: "", amount: 0 })
        setTotalAmount((total.amount) / ratio);
    }, [bets])

    useEffect(() => {
        if (resultData && gameStart) {
            setServerSeedHash(resultData.serverHash);
            setClientSeed(resultData.clientSeed);
            setServerSeed(resultData.serverSeed);
            const bankerHand = resultData.bankerHand;
            const playerHand = resultData.playerHand;

            let acount = 0;
            let count = 0;
            const dely = 700;

            for (let i = 0; i < 3; i++) {
                if (playerHand[i]) {
                    setTimeout(() => {
                        acount++;
                        setPlayerHand((prev) => [...prev, playerHand[i]]);
                        if (count === acount) {
                            if (resultData?.status === "WIN") {
                                playAudio("win");
                                setSumProfit((prev) => {
                                    return prev + resultData.profit
                                })
                            } else {
                                setSumLost((prev) => {
                                    return prev + resultData.profit
                                })
                            }
                            setGameStart(false);
                        }
                    }, dely * count)
                    count++;
                }
                if (bankerHand[i]) {
                    setTimeout(() => {
                        acount++;
                        setBankerHand((prev) => [...prev, bankerHand[i]]);
                        if (count === acount) {
                            if (resultData?.status === "WIN") {
                                playAudio("win");
                                setSumProfit((prev) => {
                                    return prev + resultData.profit
                                })
                            } else {
                                setSumLost((prev) => {
                                    return prev + Math.abs(resultData.profit)
                                })
                            }
                            setGameStart(false);
                        }
                    }, dely * count)
                    count++;
                }
            }
        } else if (!gameStart && resultData) {
            if (resultData?.status === "WIN") {
                setShowResult(true);
            }
            startBet();
        }
    }, [resultData, gameStart])

    useEffect(() => {
        startBet();
    }, []);


    useEffect(() => {
        isSoundEnable = true;
        startBet();
    }, []);

    useEffect(() => {
        audioVolume = soundVolume / 10;
    }, [soundVolume]);


    useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (!gameHotKeyEnabled) return;
            switch (event.keyCode) {
                case 32:
                    isAuto ? autoBetting ? stopAutobet() : startAutoBet() : placeBet();
                    break;
                case 81:
                    cancelBet();
                    event.preventDefault();
                    break;
                case 87:
                    clearBet();
                    event.preventDefault();
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        activeTab,
        bets,
        gameStart,
        autoBetting,
        gameHotKeyEnabled
    ])

    return (
        <Container className="w-full bg-[#10100f] h-full flex flex-col justify-center items-center ">
            <div className={`${isMobile ? "flex flex-col  items-center max-w-[400px]" : "flex  max-w-[1300px]"} mt-5 bg-[#0f212e] w-full rounded-md overflow-hidden`}>
                {!isMobile && <div className={`w-[300px] bg-[#213743] p-2`}>
                    <div className="flex flex-col">
                        <SwitchTab
                            active={activeTab}
                            onChange={setActiveTab}
                            disabled={disabled} />
                        <div className="text-[#cccccc] text-sm mt-3 flex items-center font-bold">
                            <div>Chip Value {chipValues[chipValue] / ratio}</div>
                            <div className="ml-2 w-4 h-4"><CurrencyIcon /></div>
                        </div>
                        <ChipButtonGroup
                            onChooseChip={(v) => { !disabled && selectChip(v as Chip) }}
                            selected={chipValue}
                            chipValues={chipValues} />
                        <AmountInput
                            value={totalBet}
                            onChange={(v: number) => { }}
                            disabled={true}
                            label="Total Bet"
                            amount={0} />

                        {isAuto && <>
                            <BetNumberInput
                                value={autoBetCount === Infinity ? 0 : autoBetCount}
                                disabled={disabled}
                                onChange={v => {
                                    setAutoBetCount(v)
                                }} />
                            <StopProfitAmount
                                disabled={disabled}
                                Label={"Stop on Profit"}
                                onChange={setStopPorfitA}
                                value={stopProfitA === Infinity ? 0 : stopProfitA}
                                Icon={<CurrencyIcon />} />
                            <StopProfitAmount
                                disabled={disabled}
                                Label={"Stop on Loss"}
                                onChange={setStopLossA}
                                value={stopLossA === Infinity ? 0 : stopLossA}
                                Icon={<CurrencyIcon />} />
                        </>
                        }
                        <Button
                            onClick={() => {
                                isAuto ? autoBetting ? stopAutobet() : startAutoBet() : placeBet();
                            }}
                            disabled={loading || (!isAuto && gameStart) || (isAuto && stoppedAutobet)} >
                            {activeTab === 0 ? "Bet" : autoBetting ? "Stop AutoBet" : "Start AutoBet"}
                        </Button>
                    </div>
                </div>}
                <div className={`${isMobile ? "" : "p-5"} col-span-3 w-full flex justify-center flex-col relative `}
                    style={{ background: "radial-gradient(#60819380, transparent)" }}>
                    <div className="flex justify-center p-2">
                        <div className="text-white font-bold text-xl">
                            BACCARAT
                        </div>
                    </div>
                    <div className="flex justify-around px-5 w-full md:min-h-[300px] min-h-[254px] relative"
                        ref={containRef}>
                        <div className="flex mt-[-5px] justify-center">
                            <div className={`${(gameEnd && playerScore < bankerScore) ? "bg-red-500" : "bg-green-500"} text-center w-10 h-5 text-xs md:w-14  md:text-[100%]  rounded-3xl absolute p-px font-bold text-white  animate-zoomIn`}>
                                {playerScore}
                            </div>
                        </div>
                        <div>
                            <div>
                                <EmptyCard pos={getCardPosition(0, 20, "center")} />
                                <EmptyCard pos={getCardPosition(0, 18, "center")} />
                                <EmptyCard pos={getCardPosition(0, 16, "center")} />
                                <EmptyCard pos={getCardPosition(0, 14, "center")} />
                                <EmptyCard pos={getCardPosition(0, 12, "center")} />
                                <EmptyCard pos={getCardPosition(0, 10, "center")} />
                                <EmptyCard pos={getCardPosition(0, 8, "center")} />
                            </div>
                            <div style={{ opacity: (gameEnd && playerScore < bankerScore) ? 0.5 : 1, transition: "opacity 0.5s" }}>
                                <GameCard pos={getCardPosition(isMobile ? -20 : -60, isMobile ? -35 : -50, "left")} dpos={getCardPosition(0, 8, "center")} card={playerHand[0]} showAnimation={showGameAnimation} />
                                <GameCard pos={getCardPosition(isMobile ? -5 : -30, isMobile ? 0 : 0, "left")} dpos={getCardPosition(0, 8, "center")} card={playerHand[1]} showAnimation={showGameAnimation} />
                                <GameCard pos={getCardPosition(isMobile ? 10 : 0, isMobile ? 35 : 50, "left")} dpos={getCardPosition(0, 8, "center")} card={playerHand[2]} showAnimation={showGameAnimation} />
                            </div>
                            <div style={{ opacity: (gameEnd && playerScore > bankerScore) ? 0.5 : 1, transition: "opacity 0.5s" }}>
                                <GameCard pos={getCardPosition(isMobile ? -20 : -60, isMobile ? -35 : -50, "right")} dpos={getCardPosition(0, 8, "center")} card={bankerHand[0]} showAnimation={showGameAnimation} />
                                <GameCard pos={getCardPosition(isMobile ? -5 : -30, isMobile ? 0 : 0, "right")} dpos={getCardPosition(0, 8, "center")} card={bankerHand[1]} showAnimation={showGameAnimation} />
                                <GameCard pos={getCardPosition(isMobile ? 10 : 0, isMobile ? 35 : 50, "right")} dpos={getCardPosition(0, 8, "center")} card={bankerHand[2]} showAnimation={showGameAnimation} />
                            </div>
                        </div>
                        <div className="flex mt-[-5px] justify-center">
                            <div className={`${(gameEnd && playerScore > bankerScore) ? "bg-red-500" : "bg-green-500"} text-center w-10 h-5 text-xs md:w-14  md:text-[100%]  rounded-3xl absolute p-px font-bold text-white animate-zoomIn`}>
                                {bankerScore}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <div className="flex justify-center text-[#c7c7c7] text-sm font-bold">
                            PLACE YOUR BETS
                        </div>
                        <div className="flex justify-around">
                            <div className={`flex flex-col w-[30%] max-w-[200px] border-2 rounded-[3px] border-input_hover ${gameEnd && playerScore > bankerScore ? "bg-inputborader" : "bg-panel "} hover:bg-inputborader justify-between md:p-2 p-0  items-center select-none cursor-pointer  ${showGameAnimation && "animate-zoomIn"}`} onClick={() => handlePlaceBet("Player")}>
                                <div className="flex justify-center text-[#b8b8b8] items-center">
                                    {renderValue("Player")}
                                    <div className="h-4 w-4 ml-1">
                                        <CurrencyIcon />
                                    </div>
                                </div>
                                <div className="flex justify-center md:my-5 my-3">
                                    {renderChips("Player")}
                                </div>
                                <div className="flex justify-center text-[#b8b8b8] md:text-sm text-xs font-bold">
                                    Player 2x
                                </div>
                            </div>
                            <div className={`flex flex-col w-[30%] max-w-[200px] border-2 rounded-[3px] border-input_hover ${gameEnd && playerScore === bankerScore ? "bg-inputborader" : "bg-panel "} hover:bg-inputborader justify-between md:p-2 p-0 items-center select-none cursor-pointer  ${showGameAnimation && "animate-zoomIn"}`} onClick={() => handlePlaceBet("Tie")}>
                                <div className="flex justify-center text-[#b8b8b8] items-center">
                                    {renderValue("Tie")}
                                    <div className="h-4 w-4 ml-1">
                                        <CurrencyIcon />
                                    </div>
                                </div>
                                <div className="flex justify-center md:my-5 my-3">
                                    {renderChips("Tie")}
                                </div>
                                <div className="flex justify-center text-[#b8b8b8] md:text-sm text-xs font-bold">
                                    Tie 9x
                                </div>
                            </div>
                            <div className={`flex flex-col w-[30%] max-w-[200px] border-2 rounded-[3px] border-input_hover ${gameEnd && playerScore < bankerScore ? "bg-inputborader" : "bg-panel "} hover:bg-inputborader justify-between md:p-2 p-0 items-center select-none cursor-pointer  ${showGameAnimation && "animate-zoomIn"}`} onClick={() => handlePlaceBet("Banker")}>
                                <div className="flex justify-center text-[#b8b8b8] items-center">
                                    {renderValue("Banker")}
                                    <div className="h-4 w-4 ml-1">
                                        <CurrencyIcon />
                                    </div>
                                </div>
                                <div className="flex justify-center md:my-5 my-3">
                                    {renderChips("Banker")}
                                </div>
                                <div className="flex justify-center text-[#b8b8b8] md:text-sm text-xs font-bold">
                                    Banker 1.95x
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between p-5">
                            <button className="h-5 fill-white flex text-[#c7c7c7] font-bold items-center" onClick={cancelBet}>
                                <div className="w-6 px-1">
                                    <svg viewBox="0 0 64 64" >
                                        <path d="M37.973 11.947H16.24l5.84-5.84L15.973 0 .053 15.92l15.92 15.92 6.107-6.107-5.76-5.76h21.653C47.92 19.973 56 28.053 56 38c0 9.947-8.08 18.027-18.027 18.027h-21.76v8h21.76C52.347 64.027 64 52.373 64 38c0-14.373-11.653-26.027-26.027-26.027v-.026Z"></path></svg>
                                </div>
                                <div>Undo</div>
                            </button>
                            <button className="h-5 fill-white flex text-[#c7c7c7] font-bold items-center" onClick={clearBet}>
                                <div>Clear</div>
                                <div className="w-6 px-1">
                                    <svg viewBox="0 0 64 64" >
                                        <path fillRule="evenodd" clipRule="evenodd" d="M31.943 13.08c-9.37 0-17.128 6.904-18.476 16.004l4.798-.002-9.146 12.96-9.12-12.96h5.334l.012-.124C6.889 15.536 18.291 5.112 32.127 5.112a26.823 26.823 0 0 1 17.5 6.452l-5.334 6.186.02.018a18.584 18.584 0 0 0-12.37-4.688Zm22.937 8.752L64 34.792h-5.174l-.01.12C57.332 48.398 45.902 58.888 32.02 58.888a26.826 26.826 0 0 1-17.646-6.576l5.334-6.186a18.597 18.597 0 0 0 12.47 4.776c9.406 0 17.188-6.96 18.49-16.11h-4.934l9.146-12.96ZM19.708 46.126l-.016-.014.016.014Z"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                    <ResultModal
                        visible={showResult}
                        profitAmount={resultData?.profit || 0}
                        multiplier={resultData?.multiplier}
                        onClose={() => { setShowResult(false) }}
                        // currency={currency}
                        showAnimation={showGameAnimation} />
                </div>
                {isMobile && <div className={`w-full bg-[#213743] p-2`}>
                    <div className="flex flex-col">
                        {
                            isAuto && <Button
                                onClick={() => {
                                    isAuto ? autoBetting ? stopAutobet() : startAutoBet() : placeBet();
                                }}
                                disabled={loading || (!isAuto && gameStart) || (isAuto && stoppedAutobet)} >
                                {!activeTab ? "Bet" : autoBetting ? "Stop AutoBet" : "Start AutoBet"}
                            </Button>
                        }
                        <div className="text-[#cccccc] text-sm mt-3 flex items-center font-bold">
                            <div>Chip Value {chipValues[chipValue] / ratio}</div>
                            <div className="ml-2 w-4 h-4"><CurrencyIcon /></div>
                        </div>
                        <ChipButtonGroup
                            onChooseChip={(v) => { !disabled && selectChip(v as Chip) }}
                            selected={chipValue}
                            chipValues={chipValues} />
                        {
                            !isAuto && <Button
                                onClick={() => {
                                    isAuto ? autoBetting ? stopAutobet() : startAutoBet() : placeBet();
                                }}
                                disabled={loading || (!isAuto && gameStart) || (isAuto && stoppedAutobet)} >
                                {!activeTab ? "Bet" : autoBetting ? "Stop AutoBet" : "Start AutoBet"}
                            </Button>
                        }
                        <AmountInput
                            value={totalBet}
                            onChange={(v: number) => { }}
                            disabled={true}
                            label="Total Bet"
                            amount={0} />

                        {isAuto && <>
                            <BetNumberInput
                                value={autoBetCount === Infinity ? 0 : autoBetCount}
                                disabled={disabled}
                                onChange={v => {
                                    setAutoBetCount(v)
                                }} />
                            <StopProfitAmount
                                disabled={disabled}
                                Label={"Stop on Profit"}
                                onChange={setStopPorfitA}
                                value={stopProfitA === Infinity ? 0 : stopProfitA}
                                Icon={<CurrencyIcon />} />
                            <StopProfitAmount
                                disabled={disabled}
                                Label={"Stop on Loss"}
                                onChange={setStopLossA}
                                value={stopLossA === Infinity ? 0 : stopLossA}
                                Icon={<CurrencyIcon />} />
                        </>
                        }
                        <SwitchTab
                            active={activeTab}
                            onChange={setActiveTab}
                            disabled={disabled} />
                    </div>
                </div>}
            </div>
            <div className={`${isMobile ? "flex flex-col  items-center max-w-[400px]" : "flex  max-w-[1300px]"} w-full`}>
                <SettingBar maxBetDisable={true} fairness={
                    <FairnessView gameId="baccarat" privateHash={serverSeedHash} publicSeed={clientSeed} privateSeed={serverSeed}  >
                        <div className="text-white">Fairness</div>
                    </FairnessView>
                } />
            </div>
        </Container>
    )
}

export default BaccaraStGame;

const GameCard = ({ card, pos, dpos, showAnimation }: { card: Card, pos: { x: number, y: number }, dpos: { x: number, y: number }, showAnimation: boolean }) => {
    const [_card, setCard] = useState<Card | null>();
    const [startDeal, setStartDeal] = useState(false);
    const [rotate, setRotate] = useState(false);

    let icon, color = "", isHide = true, rank = "";
    if (_card) {
        icon = suits[_card.suit]?.icon;
        color = suits[_card.suit]?.color;
        rank = _card?.rank;
        isHide = !startDeal;
    }

    const isEnd = !card;  // Determines if the card dealing is finished.

    useEffect(() => {
        let timeout: any;
        if (card) {
            setStartDeal(true);  // Start dealing animation.
            playAudio("deal");
            timeout = setTimeout(() => {
                setRotate(true);  // Trigger flip animation.
                playAudio("flip");
            }, 200);
        } else {
            setStartDeal(false);  // No card means end animation.
            setRotate(false);
        }
        setCard(card);  // Update the card state.

        return () => clearTimeout(timeout);
    }, [card]);


    return (
        <div
            className="w-0 h-0 absolute"
            style={{
                transition: showAnimation ? startDeal ? "all 0.2s" : "all 0.3s" : "all 0s",
                opacity: isEnd ? 0 : 1,
                transform: startDeal
                    ? `translate(${pos.x}px, ${pos.y}px)`
                    : `translate(${dpos.x}px, ${dpos.y}px)`,
            }}
        >
            <div
                className="absolute w-[55px] md:w-[95px] select-none"
                style={{
                    perspective: '3000px',
                    aspectRatio: '2 / 3',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div
                    className={`w-full h-full flex items-center justify-center rounded-sm shadow-md ${rotate ? 'rotate-y-180' : ''
                        } transition-transform ${showAnimation ? 'duration-500' : 'duration-0'} ease-in-out`}
                    style={{ position: 'relative', transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face of the Card */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center bg-white rounded-sm shadow-md backface-hidden ${!isHide ? 'transition-all' : ''
                            }`}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: rotate ? 'rotateY(0deg)' : 'rotateY(180deg)',
                        }}
                    >
                        <div className="flex-col h-full w-full md:p-1 p-1" style={{ color, fill: color }}>
                            <span className="font-bold md:text-[2.5em] text-[1.7em]">{rank}</span>
                            <div className="w-1/2 p-1">{icon}</div>
                        </div>
                    </div>

                    {/* Back Face of the Card */}
                    <div
                        className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-sm shadow-md ${!isHide && `transition-transform ${showAnimation ? "duration-500" : "duration-0"}`} border-2`}
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

const ResultModal = ({ visible, profitAmount, multiplier, onClose, showAnimation }: { visible?: boolean, profitAmount: number, multiplier: number, onClose: () => void, showAnimation: boolean }) => {
    return visible ? <div onClick={onClose} className="top-0 left-0 absolute w-full h-full z-40 bg-[#00000048] flex justify-center items-center">
        <div className={`relative  ${showAnimation ? "animate-zoomIn" : ""} w-[60%] max-w-[300px] md:w-[30%] min-h-40 border-2 rounded-md border-[#36e95d] bg-[#0a0a0aaf] flex-col justify-around flex `}
            style={{
                boxShadow: "0 0px 15px 3px rgb(0 188 15 / 73%), 0 4px 6px -4px rgb(86 252 26 / 75%)"
            }}
        >
            <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
                <div className=" font-bold text-white text-lg">You Win!</div>
            </div>
            <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
                <div className="font-bold">{multiplier}x</div>
            </div>
            <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
                <div>{profitAmount.toFixed(6)}</div>
                <div className="w-4 h-4 ml-1"><CurrencyIcon /></div>
            </div>
        </div>
    </div> : <></>
}


const EmptyCard = ({ pos }: { pos: { x: number, y: number } }) => {
    let isHide = true;
    const isHold = false;
    const isEnd = false;
    return (
        <div className="w-0 h-0 absolute"
            style={{
                transition: "all 0s",
                transform: `translate(${pos.x}px,${pos.y}px)`,
            }}
        >
            <div className="absolute w-[55px] md:w-[95px] select-none"
                style={{
                    perspective: '3000px',
                    aspectRatio: '2 / 3',
                    opacity: isEnd ? 0 : 1,
                    transform: `translate(-50%,-50%)`,
                }}
            >
                <div className={`w-full h-full flex items-center justify-center rounded-sm shadow-md   ${isHide ? 'transform rotate-y-180' : `transition-transform duration-0 ease-in-out`
                    }`}
                    style={{ position: 'relative', transformStyle: 'preserve-3d' }}>

                    <div
                        className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-sm shadow-md ${!isHide && `transition-transform duration-500`} border-2`}
                        style={{
                            backfaceVisibility: 'hidden',
                            background: 'green',
                            transform: isHide ? 'rotateY(0deg)' : 'rotateY(180deg)',
                        }}
                    >
                    </div>
                </div>
            </div>
        </div>
    );
}