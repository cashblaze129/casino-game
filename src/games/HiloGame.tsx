import { useCallback, useEffect, useRef, useState } from "react";
import AmountInput from "../components/AmountInput";
import Container from "../components/Container";
import useIsMobile from "../hooks/useIsMobile";
import Button from "../components/Button";
import CurrencyIcon from "../components/CurrencyIcon";
import axios from "../utils/axios";
import { CopyIcon, Forward, Same, Upward } from "../components/svgs";
import ProfitAmount from "../components/ProfitAmount";
import { toast } from "react-toastify";
import betaudio from "../assets/audio/bet.DUx2OBl3.mp3";
import flipaudio from "../assets/audio/flip.xdzctLJY copy.mp3";
import winaudio from "../assets/audio/win.BpDMfFMt.mp3";
import guessaudio from "../assets/audio/guess.B5vUJlDv.mp3";
import correctaudio from "../assets/audio/correct.iqRwTJwE.mp3";
import SwitchTab from "../components/SwitchTab";
import CustomInput from "../components/CustomInput";
import { buildPrivateHash } from "../utils/crash";
import { generateHiloCard } from "../utils/hilo";

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

type BetType = "Start" | "Skip" | "Lower" | "Higher" | "LOST";

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

function generateRandomCard(): Card {
    const suits: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    // Get a random suit and rank
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomRank = ranks[Math.floor(Math.random() * ranks.length)];

    return {
        suit: randomSuit,
        rank: randomRank
    };
}

function getCardRankValue(card: Card): number {
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
    };
    return rankValueMap[card.rank];
}

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
    }
}

let isSoundEnable = false;

const playAudio = (key: string) => {
    if (!isSoundEnable) return;
    try {
        if (key === "bet") {
            if (betaudio) {
                const auido = new Audio();
                auido.src = betaudio;
                auido.play().then(() => { }).catch((error: any) => {
                    console.log("Failed to autoplay audio:", error);
                });
            }
        } else if (key === "correct") {
            if (correctaudio) {
                const auido = new Audio();
                auido.src = correctaudio;
                auido.volume = .5;
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
            const audio = new Audio();
            audio.src = winaudio;
            audio.play().then(() => { }).catch((error: any) => {
                console.log("Failed to autoplay audio:", error);
            });
        } else if (key === "guess") {
            const audio = new Audio();
            audio.src = guessaudio;
            audio.play().then(() => { }).catch((error: any) => {
                console.log("Failed to autoplay audio:", error);
            })
        }
    } catch (error) {
        console.log(error)
    }
}


const HiloGame = () => {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState(0);
    const [betAmount, setBetAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const cardContain = useRef(null);
    const [gameId, setGameId] = useState("");
    const [privatekeyHash, setPrivateKeyHash] = useState("");
    const [publickey, setPublicKey] = useState("");
    const [privatekey, setPrivateKey] = useState("");
    const [startCard, setStartCard] = useState(generateRandomCard());
    const [visible, setVisibleModal] = useState(false);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalOdds, setTotalOdds] = useState(1);
    const [isLose, setLose] = useState(false);
    const [cardData, setCardData] = useState<{
        newCard: Card | null,
        currentCard: Card | null,
        rounds: {
            card: Card;
            type: BetType;
            multiplier: number
        }[]
    }>({
        newCard: null,
        currentCard: null,
        rounds: []
    });

    const isCahOut = gameId !== "";

    const disabled = loading || isCahOut;

    const onHigher = () => {
        if (currentCardValue === 13) {
            onBet("Same_H");
        } else if (currentCardValue === 1) {
            onBet("Higher");
        } else {
            onBet("HSame");
        }
    }

    const onLower = () => {
        if (currentCardValue === 1) {
            onBet("Same_L");
        } else if (currentCardValue === 13) {
            onBet("Lower");
        } else {
            onBet("LSame");
        }
    }

    const onSkip = () => {
        onBet("Skip");
    }

    const onBet = async (type: string) => {
        setLoading(true);
        setLose(false);
        playAudio("guess");
        try {
            if (gameId !== "") {
                const { data } = await axios.post("/hilo/bet", { type });
                const { status, odds, profit, rounds, privateKey, type: _type } = data;
                if (status) {
                    setTotalProfit(profit);
                    setTotalOdds(odds);
                    setCardData({
                        ...cardData,
                        newCard: rounds[rounds.length - 1]?.card || null,
                        currentCard: rounds.length === 2 ? startCard : cardData.newCard,
                        rounds: rounds
                    });
                    if (_type === "LOST") {
                        setGameId("");
                        setLose(true);
                        setPrivateKey(privateKey)
                    }
                }
            } else {
                const newcard = generateRandomCard();
                setStartCard(newcard);
                setCardData({
                    ...cardData,
                    newCard: null,
                    currentCard: startCard,
                    rounds: [{ card: newcard, multiplier: 1, type: "Start" }]
                });
            }
        } catch (error) {
            setLoading(false);
        }
        setTimeout(() => {
            setLoading(false);
        }, 800)
    }

    const createBet = async () => {
        setLoading(true);
        setLose(false);
        playAudio("bet");
        try {
            const { data } = await axios.post("/hilo/create", {
                currencyId: "",
                amount: betAmount,
                startCard
            });
            const { status, odds, publicKey, privateHash, rounds, gameId: _gameId } = data;
            if (status) {
                setGameId(_gameId);
                setPrivateKeyHash(privateHash);
                setPublicKey(publicKey)
                setCardData({
                    ...cardData,
                    rounds: rounds
                });
            }
        } catch (error) {
            toast.error("error");
        }
        setTimeout(() => {
            setLoading(false);
        }, 800)
    }

    const cashOut = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post("/hilo/cashout", {
                currencyId: "",
                amount: betAmount,
                startCard
            });
            const { status, profit, multiplier, privateKey } = data;
            if (status) {
                setGameId("");
                setStartCard(cardData.rounds[cardData.rounds.length - 1].card);
                setVisibleModal(true);
                setPrivateKey(privateKey);
                playAudio("win");
            } else {
                toast.error("Not found game");
            }
        } catch (error) {
            toast.error("error");
        }
        setLoading(false);
    }

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const { data } = await axios.get("/hilo/game");
                const {
                    status,
                    odds,
                    publicKey,
                    privateHash,
                    rounds,
                    gameId: _gameId,
                    profit,
                    amount,
                    currency
                } = data;
                if (status) {
                    setGameId(_gameId);
                    setPrivateKeyHash(privateHash);
                    setPublicKey(publicKey);
                    setTotalProfit(profit);
                    setTotalOdds(odds);
                    setBetAmount(amount);
                    setCardData({
                        ...cardData,
                        newCard: rounds.length > 0 ? rounds[0].card : startCard,
                        rounds: rounds
                    });
                } else {
                    setCardData({
                        ...cardData,
                        rounds: [{ card: startCard, multiplier: 1, type: 'Start' }]
                    })
                }
            } catch (error) {
                console.log(error);
            }
            isSoundEnable = true;
        }
        fetchGame();
    }, [])

    const checkDisable = () => {
        if (isCahOut) {
            if (!loading && cardData.rounds.filter((v) => (v.type !== "Start" && v.type !== "Skip")).length > 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return loading;
        }
    }

    const getCurrentCardValue = () => {
        return cardData.rounds.length == 0 ? 1 : getCardRankValue(cardData.rounds[cardData.rounds.length - 1]?.card || { suit: "Clubs", rank: "A" });
    }

    const getMultipliers = () => {
        const card: Card = cardData.rounds[cardData.rounds.length - 1]?.card || { suit: "Clubs", rank: "A" };
        return multipliers[card.rank]
    }

    const currentCardValue = getCurrentCardValue();
    const currentMultipliers = getMultipliers();

    const getProbability = () => {
        const value = currentCardValue;
        if (value === 13) {
            return [(100 / 13).toFixed(2), ((100 / 13) * value - 1).toFixed(2)]
        } else if (value === 1) {
            return [(100 - (100 / 13) * value).toFixed(2), (100 / 13).toFixed(2)]
        } else {
            return [(100 - (100 / 13) * value - 1).toFixed(2), ((100 / 13) * value).toFixed(2)]
        }
    }

    const probability = getProbability();

    return <Container className="w-full bg-[#10100f] h-full flex justify-center ">
        <div className={`max-w-[1300px] mt-5 ${isMobile ? "w-full p-1" : "w-full"} `}>
            <div className="grid grid-cols-1 sm:grid-cols-4 rounded-md overflow-hidden bg-panel shadow-md">
                {!isMobile &&
                    <div className="col-span-1 p-2 md:min-h-[560px] bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-start">
                        <SwitchTab active={activeTab} onChange={setActiveTab} options={["BET", "Fairness"]} />
                        {activeTab === 0 ? <>
                            <AmountInput disabled={disabled} value={betAmount} onChange={setBetAmount} />
                            <div className="w-[100%] mt-2">
                                <div className="text-white flex text-sm"><HigherSvg /> Profit Higher  {`(${currentMultipliers.Higher.toFixed(2)}x)`}</div>
                                <div className="hover:border-input_hover border-[2px] border-inputborader bg-inputborader flex justify-between rounded-sm text-white items-center  p-1">
                                    <div>{(currentMultipliers.Higher * betAmount).toFixed(2)}</div>
                                    <div className="w-6 h-6">
                                        <CurrencyIcon />
                                    </div>
                                </div>
                            </div>
                            <div className="w-[100%] mt-2">
                                <div className="text-white flex text-sm"> <LowerSvg /> Profit Lower {`(${currentMultipliers.Lower.toFixed(2)}x)`}</div>
                                <div className="hover:border-input_hover border-[2px] border-inputborader bg-inputborader flex justify-between rounded-sm text-white items-center  p-1">
                                    <div>{(currentMultipliers.Lower * betAmount).toFixed(2)}</div>
                                    <div className="w-6 h-6">
                                        <CurrencyIcon />
                                    </div>
                                </div>
                            </div>
                            <div className="w-[100%] mt-2">
                                <div className="text-white text-sm">Total Profit {`(${totalOdds.toFixed(2)}x)`}</div>
                                <div className="hover:border-input_hover border-[2px] border-inputborader bg-inputborader flex justify-between rounded-sm text-white  items-center p-1">
                                    <div>{totalProfit.toFixed(2)}</div>
                                    <div className="w-6 h-6">
                                        <CurrencyIcon />
                                    </div>
                                </div>
                            </div>
                            <Button disabled={checkDisable()} onClick={isCahOut ? cashOut : createBet}>{isCahOut ? "Cashout" : "Bet"}</Button>
                        </> : <div className="flex flex-col mt-2"><FairnessView publicSeed={publickey} privateHash={privatekeyHash} privateSeed={privatekey} /></div>}
                    </div>
                }
                <div className={`col-span-3 ${isMobile ? "min-h-[470px] " : "min-h-[300px] "} relative h-full overflow-hidden`}>
                    <div className="flex flex-col w-full h-full justify-between p-2" >
                        <div className="flex justify-around min-h-[45%] items-center">
                            <div className="flex justify-center">
                                <div className="fill-[#ffce00] md:w-32 w-16 flex flex-col  items-center opacity-80">
                                    <Upward />
                                    <div className="text-[#ffce00] font-bold md:text-sm text-xs">
                                        {probability[0]}%
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="-translate-y-[70px]">
                                    <div className="absolute min:w-[110px] -translate-x-1/2 translate-y-[8px] w-[90px] md:w-[110px] select-none"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px',
                                            aspectRatio: '2 / 3',
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 w-full  h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                            }}
                                        />
                                    </div>
                                    <div className="absolute min:w-[110px] -translate-x-1/2 translate-y-[6px] w-[90px] md:w-[110px] select-none"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px',
                                            aspectRatio: '2 / 3',
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 w-full  h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                            }}
                                        />
                                    </div>
                                    <div className="absolute min:w-[110px] -translate-x-1/2 translate-y-[4px] w-[90px] md:w-[110px] select-none"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px',
                                            aspectRatio: '2 / 3',
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 w-full  h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                            }}
                                        />
                                    </div>
                                    <div className="absolute min:w-[110px] -translate-x-1/2 translate-y-[2px] w-[90px] md:w-[110px] select-none"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px',
                                            aspectRatio: '2 / 3',
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 w-full  h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                background: 'green',
                                            }}
                                        />
                                    </div>
                                    {!cardData.newCard && startCard && <StartCard card={startCard} />}
                                    {cardData.newCard && <NewCard card={cardData.newCard} isLose={isLose} />}
                                    {cardData.currentCard && <CurrentCard card={cardData.currentCard} />}
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="fill-[#7F47FD] md:w-32 w-16 flex flex-col items-center  opacity-80">
                                    <div className="rotate-180 md:w-32 w-16">
                                        <Upward />
                                    </div>
                                    <div className="text-[#7F47FD] font-bold md:text-sm text-xs">
                                        {probability[1]}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex max-w-full min-w-full min-h-24 bg-[#00000040] md:p-2 p-1 overflow-y-hidden overflow-x-scroll" ref={cardContain}>
                            <div className="max-w-[100%] flex">
                                {cardData.rounds.map((round, index) => {
                                    return <CardItem key={index} round={round} index={index}
                                        isLose={cardData.rounds.length - 1 === index && isLose}
                                        onEndAnimation={() => {
                                            if (index == cardData.rounds.length - 1) {
                                                if (cardContain.current) {
                                                    const contain = (cardContain.current as HTMLElement);
                                                    contain.scrollIntoView({ behavior: 'smooth' });
                                                    contain.scrollTo({
                                                        left: contain.scrollWidth,
                                                        top: 0,
                                                        behavior: 'smooth'
                                                    });

                                                }
                                            }
                                        }} />
                                })}
                            </div>
                        </div>
                        <div className="flex justify-between py-1 rounded-sm">
                            <Button disabled={loading || !isCahOut} onClick={onHigher} className="bg-input_bg hover:bg-input_hover shadow-input text-white flex flex-col items-center justify-between  md:text-sm text-xs select-none">
                                {
                                    currentCardValue === 13 ? <>
                                        <div className="fill-[#ffce00] w-10"><Same /></div>
                                        <div>Same</div>
                                    </> : currentCardValue === 1 ? <>
                                        <div className="fill-[#ffce00] w-10 "><Upward /></div>
                                        <div>Higher</div>
                                    </> : <>
                                        <div className="fill-[#ffce00] w-10"><Upward /></div>
                                        <div>Higher or Same</div>
                                    </>
                                }
                            </Button>
                            <div className="w-2"></div>
                            <Button disabled={loading} onClick={onSkip} className="bg-input_bg hover:bg-input_hover shadow-input text-white flex flex-col items-center justify-between  md:text-sm text-xs select-none">
                                <div className="w-10 fill-[#fff]"> <Forward /> </div>
                                <div>Skip Card</div>
                            </Button>
                            <div className="w-2"></div>
                            <Button disabled={loading || !isCahOut} onClick={onLower} className="bg-input_bg hover:bg-input_hover shadow-input text-white flex flex-col items-center justify-between  md:text-sm text-xs select-none">
                                {
                                    currentCardValue === 1 ? <>
                                        <div className="fill-[#7F47FD] rotate-180 w-10 "><Same /></div>
                                        <div>Same</div>
                                    </> : currentCardValue === 13 ? <>
                                        <div className="fill-[#7F47FD] w-10 rotate-180"><Upward /></div>
                                        <div>Lower</div>
                                    </> : <>
                                        <div className="fill-[#7F47FD] rotate-180 w-10 "><Upward /></div>
                                        <div>Lower or Same</div>
                                    </>
                                }
                            </Button>
                        </div>
                    </div>
                    <ResultModal visible={visible} profit={totalProfit} odds={totalOdds} onClose={() => setVisibleModal(false)} />
                </div>
                {isMobile &&
                    <div className="col-span-1 p-2 bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] flex flex-col justify-start">
                        {activeTab == 0 && <>
                            <Button disabled={checkDisable()} onClick={isCahOut ? cashOut : createBet}>{isCahOut ? "Cashout" : "Bet"}</Button>
                            <AmountInput value={betAmount} disabled={disabled} onChange={setBetAmount} />
                            <ProfitAmount disabled={true} multiplier={Math.floor(totalOdds * 100) / 100} profit={Math.floor(totalProfit * 100) / 100} icon={<CurrencyIcon />} />
                        </>}
                        <SwitchTab active={activeTab} onChange={setActiveTab} options={["BET", "Fairness"]} />
                        {activeTab === 1 && <FairnessView publicSeed={publickey} privateHash={privatekeyHash} privateSeed={privatekey} />}
                    </div>
                }
            </div>
        </div>
    </Container>
}

export default HiloGame;

const CurrentCard = ({ card }: { card: Card }) => {
    const [showAni, setShowAni] = useState(true);
    const Icon = suits[card.suit]?.icon;
    const Color = suits[card.suit]?.color;

    const [left, setLeft] = useState(false);

    useEffect(() => {
        setShowAni(true);
        setLeft((prov) => !prov)
    }, [card])

    if (!showAni)
        return <></>
    return (
        <div className={showAni ? left ? "animate-_outRotateZ" : "animate-outRotateZ" : ""} onAnimationEnd={() => {
            setShowAni(false);
        }}>
            <div className="absolute min:w-[110px] w-[90px] -translate-x-1/2 -translate-y-[2px]  md:w-[110px] select-none"
                style={{
                    aspectRatio: '2 / 3',
                }}
            >
                <div
                    className={`w-full h-full flex items-center justify-center rounded-lg shadow-md`}
                    style={{
                        position: 'relative',
                    }}
                >
                    <div
                        className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md"
                        style={{
                            backfaceVisibility: 'hidden',
                            color: Color,
                        }}
                    >
                        <div className="flex-col h-full w-full md:p-2 p-1">
                            <span className="font-bold md:text-[2.2em] text-[1.5em]">{card.rank}</span>
                            <div className="w-1/2">{Icon}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StartCard = ({ card }: { card: Card }) => {
    const Icon = suits[card.suit]?.icon;
    const Color = suits[card.suit]?.color;
    return (
        <div className="absolute min:w-[110px] w-[90px] -translate-x-1/2 translate-y-[0px] md:w-[110px] select-none"
            style={{
                aspectRatio: '2 / 3',
            }}
        >
            <div
                className={`w-full h-full flex items-center justify-center rounded-lg shadow-md`}
                style={{
                    position: 'relative',
                }}
            >
                <div
                    className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md"
                    style={{
                        backfaceVisibility: 'hidden',
                        color: Color,
                    }}
                >
                    <div className="flex-col h-full w-full md:p-2 p-1">
                        <span className="font-bold md:text-[2.2em] text-[1.5em]">{card.rank}</span>
                        <div className="w-1/2">{Icon}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const NewCard = ({ card, isLose }: { card: Card, isLose: boolean }) => {
    const Icon = suits[card.suit]?.icon;
    const Color = suits[card.suit]?.color;
    const [isHide, setShowAni] = useState(true);

    const isHold = isLose;
    useEffect(() => {
        setShowAni(true);
        setTimeout(() => {
            setShowAni(false);
            playAudio("flip");
        }, 1100)
    }, [card])

    return (
        <div className="absolute min:w-[110px] w-[90px] -translate-x-1/2 translate-y-[0px] md:w-[110px] select-none"
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                aspectRatio: '2 / 3',
            }}
        >
            <div
                className={`w-full h-full flex items-center justify-center rounded-lg shadow-md   ${isHide ? 'transform rotate-y-180' : 'transition-transform duration-500 ease-in-out'
                    }`}
                style={{ position: 'relative', transformStyle: 'preserve-3d' }}
            >
                <div
                    className={`absolute inset-0 flex items-center justify-center bg-white rounded-lg shadow-md backface-hidden ${!isHide && 'transition-all duration-500'} `}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: isHide ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        boxShadow: isHold ? "0 0 0 .3em #fa35aa" : ""
                    }}
                >
                    <div className={`flex-col h-full w-full md:p-2 p-1 `} style={{ color: Color }}>
                        <span className="font-bold md:text-[2.2em] text-[1.5em]">{card?.rank}</span>
                        <div className="w-1/2">
                            {Icon}
                        </div>
                    </div>
                </div>
                <div
                    className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md ${!isHide && 'transition-transform duration-500'} border-2`}
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

const CardItem = ({ round, onEndAnimation, index, isLose }: { round: { card: Card, multiplier: number, type: string }, onEndAnimation: () => void, index: number, isLose: boolean }) => {
    const [showAni, setShowAni] = useState(true);
    const [oldCard, setOldCard] = useState<Card | null>();
    let isHold = isLose;
    const [isHide, setHide] = useState(true);
    let cardsuit: any = "";
    let cardcolor = "";
    const card = round.card;
    cardsuit = suits[card.suit as Suit]?.icon;
    cardcolor = suits[card.suit as Suit]?.color;

    useEffect(() => {
        if (!oldCard || oldCard.rank !== round.card.rank || oldCard.suit !== round.card.suit) {
            setShowAni(true);
            setOldCard(round.card);
            if (index == 0) {
                setHide(false);
            }
            setTimeout(() => {
                setShowAni(false);
                setTimeout(() => {
                    onEndAnimation();
                    setTimeout(() => {
                        setHide(false);
                        if (!isLose && round.type !== "Start" && round.type !== "Skip") {
                            playAudio("correct");
                        }
                    }, 300)
                }, 300)
            }, 500);
        }
    }, [round, oldCard])

    return (
        <div className={showAni ? "w-[60px] mx-1 md:w-[90px] transform translate-x-[1200px]" : "w-[60px] mx-1 md:w-[90px] transition-transform duration-500 transform translate-x-0"}  >
            <div className="flex flex-col">
                <div
                    className="relative w-[60px] md:w-[90px] cursor-pointer"
                    style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1000px',
                        aspectRatio: '2 / 3',
                    }}
                >
                    <div
                        className={`w-full relative h-full flex items-center justify-center rounded-md shadow-md  transition-transform duration-500 ease-in-out ${isHide ? 'transform rotate-y-180' : ''
                            }`}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <div
                            className={`absolute inset-0 flex items-center justify-center bg-white rounded-md shadow-md backface-hidden transition-all duration-500  ${round.type === "Skip" ? "opacity-45" : ""}`}
                            style={{
                                backfaceVisibility: 'hidden',
                                transform: isHide ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                boxShadow: isHold ? "0 0 0 .3em #fa35aa" : ""
                            }}
                        >
                            <div className={`flex-col h-full w-full md:p-2 p-1 `} style={{ color: cardcolor }}>
                                <span className="font-bold md:text-[2.1em] text-[1.3em]">{card?.rank}</span>
                                <div className="w-1/2">
                                    {cardsuit}
                                </div>
                            </div>
                        </div>
                        <div
                            className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-lg shadow-md transition-transform duration-500 border-2`}
                            style={{
                                backfaceVisibility: 'hidden',
                                background: 'green',
                                transform: isHide ? 'rotateY(0deg)' : 'rotateY(180deg)',
                            }}
                        ></div>

                        {(round.type !== "Start" && !isHide) && <div className="absolute left-0 top-1/2 -translate-x-5 -translate-y-1/2 ">
                            <div className="w-7 h-7 items-center justify-center flex rounded-md bg-white shadow-sm shadow-neutral-700 animate-zoomIn">
                                {round.type === "Skip" && <div className="w-6 fill-[#ffce00]"> <Forward /> </div>}
                                {(round.type === "Higher" || round.type === "HSame") && <div className={`w-6 ${isLose ? "fill-[#fa35aa]" : "fill-green-600"}`}> <Upward /> </div>}
                                {(round.type === "Lower" || round.type === "LSame") && <div className={`w-6 rotate-180 ${isLose ? "fill-[#fa35aa]" : "fill-green-600"}`}> <Upward /> </div>}
                                {(round.type === "Same_L" || round.type === "Same_H") && <div className={`w-6 ${isLose ? "fill-[#fa35aa]" : "fill-green-600"}`}> <Same /> </div>}
                            </div>
                        </div>}
                    </div>
                </div>
                {!isHide &&
                    <div className={`w-full mt-1 text-white p-1 ${isHold ? 'bg-[#fa35aa]' : 'bg-green-600'} md:text-sm text-xs font-bold rounded-sm text-center animate-zoomIn`}>
                        {round.type == "Start" ? "Start" : round.type == "Skip" ? "Skip" : `${round.multiplier.toFixed(2)}x`}
                    </div>
                }
            </div>
        </div>
    )
}

const LowerSvg = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16" className="w-[12px] rotate-180" fill="#2AB2E9"><path d="M4.4864 13.667C3.92507 13.667 3.4701 13.3014 3.4701 12.8494L3.47099 7.54931L1.18095 7.54931C0.306767 7.54931 -0.251889 6.81602 0.113696 6.19768L0.160176 6.127L3.9787 0.807585C4.43188 0.175683 5.56796 0.175683 6.02204 0.807585L9.84056 6.127C10.2937 6.7589 9.72704 7.54931 8.81889 7.54931L6.52974 7.54931L6.52974 12.8494C6.52974 13.3014 6.07477 13.667 5.51344 13.667L4.48819 13.667L4.4864 13.667Z"></path></svg>
}

const HigherSvg = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 16" className="w-[12px]" fill="#EECF2D"><path d="M4.4864 13.667C3.92507 13.667 3.4701 13.3014 3.4701 12.8494L3.47099 7.54931L1.18095 7.54931C0.306767 7.54931 -0.251889 6.81602 0.113696 6.19768L0.160176 6.127L3.9787 0.807585C4.43188 0.175683 5.56796 0.175683 6.02204 0.807585L9.84056 6.127C10.2937 6.7589 9.72704 7.54931 8.81889 7.54931L6.52974 7.54931L6.52974 12.8494C6.52974 13.3014 6.07477 13.667 5.51344 13.667L4.48819 13.667L4.4864 13.667Z"></path></svg>
}

const ResultModal = ({ visible, profit, odds, onClose }: { visible?: boolean, profit: number, odds: number, onClose: () => void }) => {
    return visible ? <div onClick={onClose} className="top-0 left-0 absolute w-full h-full bg-[#00000048] flex justify-center items-center">
        <div className="relative animate-zoomIn w-[40%] md:w-[30%] min-h-40 border-2 rounded-md border-[#36e95d] bg-[#0a0a0aaf] flex-col justify-around flex "
            style={{
                boxShadow: "0 0px 15px 3px rgb(0 188 15 / 73%), 0 4px 6px -4px rgb(86 252 26 / 75%)"
            }}
        >
            <div className="text-lg font-bold text-white flex justify-center">You Win!</div>
            <div className="text-lg text-white uppercase flex justify-center font-bold">
                {odds.toFixed(2)}x
            </div>
            <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
                <div>{profit.toFixed(6)}</div><div className="w-6 h-6"><CurrencyIcon /></div>
            </div>
        </div>
    </div> : <></>
}

const FairnessView = ({ publicSeed, privateHash, privateSeed }: { publicSeed: string, privateHash: string, privateSeed: string }) => {
    const [active, setActiveTab] = useState(0);
    const [_privateSeed, setPrivateSeed] = useState("");
    const [_publicSeed, setPublicSeed] = useState("");
    const [cards, setCards] = useState<Card[]>([]);
    const contain = useRef(null);
    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied!")
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
    useEffect(() => {
        setPrivateSeed(privateSeed);
    }, [privateSeed]);
    useEffect(() => {
        setPublicSeed(publicSeed);
    }, [publicSeed])
    useEffect(() => {
        if (_privateSeed !== "" && _publicSeed !== "") {
            let i = 0;
            let timer: any;
            const generate = () => {
                timer = setTimeout(() => {
                    if (i < 50) {
                        setCards((prev: any[]) => {
                            return [...prev, generateHiloCard(_publicSeed, _privateSeed, prev.length + 1)]
                        });
                        generate();

                        setTimeout(() => {
                            if (contain.current) {
                                const containElement = (contain.current as HTMLElement);
                                containElement.scrollTo({
                                    left: containElement.scrollWidth,
                                    top: 0,
                                    behavior: 'smooth'
                                });
                            }
                        }, 300)
                    }
                    i++
                }, 600);
            }
            generate();
            return () => {
                setCards([]);
                clearTimeout(timer);
            }
        }
    }, [_privateSeed, _publicSeed])
    return <>
        <SwitchTab options={["Seeds", "Verify"]} active={active} onChange={(e) => setActiveTab(e)} type={"sub"} />
        {active === 0 ? <>
            <CustomInput disabled={true} value={_privateSeed == "" ? publicSeed : ""} label={"Active Client Seed"} type={"text"} icon={<button onClick={() => copyToClipboard(publicSeed)} className="px-1 py-2 w-full "><CopyIcon /></button>} />
            <CustomInput disabled={true} value={_privateSeed == "" ? privateHash : ""} label={"Active Server Seed (Hashed)"} type={"text"} icon={<button onClick={() => copyToClipboard(privateHash)} className="px-1 py-2 w-full "><CopyIcon /></button>} />

            <div className="mt-4"></div>
            <CustomInput disabled={true} value={_privateSeed == "" ? "" : _publicSeed} label={"Previous Client Seed "} type={"text"} icon={<button onClick={() => copyToClipboard(publicSeed)} className="px-1 py-2 w-full "><CopyIcon /></button>} />
            <CustomInput disabled={true} value={_privateSeed == "" ? "" : _privateSeed} label={"Previous Server Seed"} type={"text"} icon={<button onClick={() => copyToClipboard(privateHash)} className="px-1 py-2 w-full "><CopyIcon /></button>} />
        </> : <>
            <div className="p-2 border-dashed mt-3 px-5 border-[1px] min-h-24 border-[#3dff23b4] rounded-md flex items-center font-bold text-[20px]  overflow-y-hidden overflow-x-scroll hilo-card-contain " ref={contain}>
                {cards.map((card, index) => {
                    const icon = suits[card.suit as Suit]?.icon;
                    const color = suits[card.suit as Suit]?.color;
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
                                    <div
                                        className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md transition-transform duration-500"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(-180deg)',
                                            color: color,
                                            animationDuration: rotateTime
                                        }}
                                    >
                                        <div className="flex-col h-full w-full md:p-2 p-1">
                                            <span className="font-bold md:text-[1.2em]">{card.rank}</span>
                                            <div className="w-1/2" style={{ fill: color }}>{icon}</div>
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
            <CustomInput onChange={setPrivateSeed} value={_privateSeed} label={"Server Seed"} type={"text"} />
            <CustomInput disabled={true} value={_privateSeed === "" ? "" : buildPrivateHash(_privateSeed || "")} label={"Server Seed(Hash)"} type={"text"} />
            <CustomInput onChange={setPublicSeed} value={_publicSeed} label={"Client Seed"} type={"text"} />
        </>}
    </>
}

