import { useEffect, useState } from "react";
import CustomInput from "./Input";
import SwitchTab from "./SwitchTab";
import { buildPrivateHash, generateCrashPoint } from "../utils/crash";
import Modal from "./Modal";
import { combineSeeds, generateRouletteOutcome } from "../utils/generateHash";
import { rouletteWheelNumbers } from "../games/RouletteGame";
import { CopyIcon } from "./svgs";
import { toast } from "react-toastify";
import { getHiloMGameCard } from "../utils/hilo";

const FairnessView = ({ privateHash, publicSeed, privateSeed, gameId, children, prev }: { privateHash: string, publicSeed: string, privateSeed: string, gameId: string, children: any, prev?: boolean }) => {
    const [verifyOpen, setVerifyOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const [_publicSeed, setPublicSeed] = useState("");
    const [_privateSeed, setPrivateSeed] = useState("");
    const [_privateHash, setPrivateHash] = useState("");

    const [prevPrivateSeed, setPrevPrivateSeed] = useState("");
    const [prevPublicSeed, setPrevPublicSeed] = useState("");

    useEffect(() => {
        if (_privateSeed.length > 0) {
            setPrivateHash(buildPrivateHash(_privateSeed));
        } else {
            setPrivateHash("")
        }
    }, [_privateSeed]);


    useEffect(() => {
        if (publicSeed !== "" && privateSeed !== "") {
            setPrevPrivateSeed(privateSeed);
            setPrevPublicSeed(publicSeed);
        }
    }, [publicSeed, privateSeed])


    useEffect(() => {
        setPublicSeed(publicSeed);
    }, [publicSeed]);

    useEffect(() => {
        setPrivateSeed(privateSeed);
    }, [privateSeed]);


    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied!")
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    return <>
        <button onClick={() => setVerifyOpen(true)}>
            {children}
        </button>
        <Modal isOpen={verifyOpen} onClose={() => { setVerifyOpen(false) }} className="animate-zoomIn pb-0 bg-[#2d2d2d] max-w-[530px] w-svw rounded-md border-[2px] border-[#2fe42f]">
            <div className=" flex-col">
                <div className="flex  items-center px-3 text-white">
                    <div className="w-5 ">
                        <svg fill="currentColor" viewBox="0 0 64 64" > <title></title> <path d="M54.727 15.006h3.12V8.37H34.654V2.61H27.99v5.758H4.746v6.637h4.505L0 37.452c0 7.037 5.704 12.741 12.741 12.741 7.038 0 12.741-5.704 12.741-12.741l-9.25-22.446h11.73v39.745h-9.303v6.638h25.165V54.75h-9.171V15.006h13.115l-9.25 22.446c0 7.037 5.703 12.741 12.74 12.741C58.297 50.193 64 44.489 64 37.452l-9.273-22.446ZM5.334 37.452l7.411-17.887 7.357 17.887H5.334Zm38.492 0 7.357-17.887 7.463 17.887h-14.82Z"></path></svg>
                    </div>
                    <div className="font-bold px-1">
                        Fairness
                    </div>
                </div>
                <div className="p-4">
                    <SwitchTab disabled={false} active={activeTab} onChange={setActiveTab} options={["Seeds", "Verify"]} />
                </div>
            </div>
            <div className="p-3 bg-[#000000]">
                {
                    loading ? <div className="flex items-center justify-center h-full">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-400"></div>
                        </div>
                    </div> : <>
                        <div className="flex flex-col p-1">
                            {activeTab === 0 ? <>
                                <div className="text-white text-sm">{prev ? "Next" : "Active"} Client Seed</div>
                                <CustomInput type="string"
                                    disabled={true}
                                    value={_privateSeed === "" ? publicSeed : ""}
                                    onChange={() => { }}
                                    icon={<button onClick={() => copyToClipboard(_privateSeed === "" ? publicSeed : "")}
                                        className="px-1 py-2 w-full ">
                                        <CopyIcon />
                                    </button>} />
                                <div className="text-white text-sm">{prev ? "Next" : "Active"} Server Seed (Hashed)</div>
                                <CustomInput
                                    type="string"
                                    disabled={true}
                                    value={_privateSeed === "" ? privateHash : ""}
                                    icon={<button onClick={() => copyToClipboard(_privateSeed === "" ? privateHash : "")}
                                        className="px-1 py-2 w-full ">
                                        <CopyIcon />
                                    </button>} />

                                <div className="mt-4"></div>
                                <div className="text-white text-sm">{(prev && _privateSeed !== "") ? "Active" : "Previous"} Client Seed</div>
                                <CustomInput type="string"
                                    disabled={true}
                                    value={prevPublicSeed}
                                    onChange={() => { }}
                                    icon={<button onClick={() => copyToClipboard(prevPublicSeed)} className="px-1 py-2 w-full ">
                                        <CopyIcon />
                                    </button>} />
                                <div className="text-white text-sm">{(prev && _privateSeed !== "") ? "Active" : "Previous"}  Server Seed</div>
                                <CustomInput
                                    type="string"
                                    disabled={true}
                                    value={prevPrivateSeed}
                                    icon={<button onClick={() => copyToClipboard(prevPrivateSeed)} className="px-1 py-2 w-full ">
                                        <CopyIcon />
                                    </button>} />
                            </> : <>
                                <RenderContext privateSeed={_privateSeed} publicSeed={_publicSeed} gameId={gameId} />
                                <div className="text-white text-sm">Server Seed</div>
                                <CustomInput type="string" onChange={setPrivateSeed} value={_privateSeed} />
                                <div className="text-white text-sm">Server Seed(Hash)</div>
                                <CustomInput type="string" disabled={true} value={_privateHash} />
                                <div className="text-white text-sm">Client Seed</div>
                                <CustomInput type="string" onChange={setPublicSeed} value={_publicSeed} />
                            </>}
                        </div>
                    </>
                }
            </div>
        </Modal>
    </>
}

export default FairnessView;

const RenderContext = ({ gameId, privateSeed, publicSeed }: { gameId: string; privateSeed: string, publicSeed: string }) => {
    return {
        "roulette": <RoulleteView privateSeed={privateSeed} publicSeed={publicSeed} />,
        "crash": <CrashView privateSeed={privateSeed} publicSeed={publicSeed} />,
        "slide": <CrashView privateSeed={privateSeed} publicSeed={publicSeed} />,
        "baccarat": <BaccaratView privateSeed={privateSeed} publicSeed={publicSeed} />,
        "hilo-m": <HiloMView privateSeed={privateSeed} publicSeed={publicSeed} />
    }[gameId] || <></>
}

const CrashView = ({ privateSeed, publicSeed }: { privateSeed: string, publicSeed: string }) => {
    const [crashPoint, setCrashPoint] = useState(0);
    useEffect(() => {
        if (privateSeed !== "" && publicSeed !== "") {
            setCrashPoint(generateCrashPoint(privateSeed, publicSeed) / 100)
        } else {
            setCrashPoint(0)
        }
    }, [privateSeed, publicSeed]);

    return <div className="p-5 border-dashed mt-3 border-[1px] border-[#3dff23b4] rounded-md flex justify-center items-center font-bold text-[20px] text-white">
        {crashPoint !== 0 ?
            crashPoint < 1.2 ? (
                <div> {parseCommasToThousands(crashPoint)}x</div>
            ) : crashPoint >= 1.2 && crashPoint < 2 ? (
                <div >  {parseCommasToThousands(crashPoint)}x</div>
            ) : crashPoint >= 2 && crashPoint < 100 ? (
                <div > {parseCommasToThousands(crashPoint)}x</div>
            ) : (
                <div > {parseCommasToThousands(crashPoint)}x</div>
            )
            : <div className="text-[16px]"> More inputs are required to verify result</div>}
    </div>
}

const RoulleteView = ({ privateSeed, publicSeed }: { privateSeed: string, publicSeed: string }) => {
    const [outcome, setOutcome] = useState(0);
    const visible = privateSeed !== "" && publicSeed !== "";

    const getWheelIndex = (outcomeNumber: number) => {
        console.log(outcomeNumber)
        return rouletteWheelNumbers[rouletteWheelNumbers.findIndex((n) => n.Number === outcomeNumber)] || rouletteWheelNumbers[0];
    }

    useEffect(() => {
        if (privateSeed !== "" && publicSeed !== "") {
            console.log(privateSeed, publicSeed)
            setOutcome(generateRouletteOutcome(publicSeed, privateSeed));
        } else {
            setOutcome(0)
        }
    }, [privateSeed, publicSeed]);

    return <div className="p-5 border-dashed mt-3 border-[1px] border-[#3dff23b4] rounded-md flex justify-center items-center font-bold text-[20px]">
        {visible ? <div className={`w-[40%] aspect-[1/1] rounded-full flex justify-center items-center `}
            style={{
                background: getWheelIndex(outcome).Color === "Green" ? "radial-gradient(#0bc912, transparent)" : getWheelIndex(outcome).Color === "Black" ? "radial-gradient(#1f1d1d, transparent)" : "radial-gradient(#c90b0b, transparent)"
            }}
        >
            <div className="font-bold text-white">{getWheelIndex(outcome).Number}</div>
        </div> : <div>
            <div className="text-[16px]"> More inputs are required to verify result</div>
        </div>}
    </div>
}

type Suit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'Joker';

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
    },
    "Joker": {
        color: "#e9113c",
        icon: <svg viewBox="0 0 20 19"><g><path d="M16.2761 3.65844C17.2913 3.65844 18.1172 2.83785 18.1172 1.82922C18.1172 0.820593 17.2913 0 16.2761 0C15.2609 0 14.4349 0.820632 14.4349 1.82926C14.4349 2.83789 15.2608 3.65844 16.2761 3.65844Z"></path><path d="M1.84113 14.3415C0.825937 14.3415 0 15.1621 0 16.1707C0 17.1794 0.825937 18 1.84113 18C2.85633 18 3.68227 17.1793 3.68227 16.1707C3.68227 15.1621 2.85637 14.3415 1.84113 14.3415Z"></path><path d="M18.1589 14.3415C17.1437 14.3415 16.3177 15.1621 16.3177 16.1707C16.3177 17.1794 17.1437 18 18.1589 18C19.1741 18 20 17.1794 20 16.1707C20 15.1621 19.1741 14.3415 18.1589 14.3415Z"></path><path d="M10 8.5189C10.5623 7.44127 11.4921 6.58256 12.6231 6.10625L11.8496 5.33782C11.9286 4.2662 12.548 3.3414 13.4374 2.83183C13.3248 2.51817 13.263 2.1808 13.263 1.82922C13.263 1.63005 13.2831 1.43546 13.3207 1.24707H11.569C8.99242 1.24707 6.90367 3.32231 6.90367 5.88224V5.93323C8.24773 6.35238 9.36109 7.29437 10 8.5189Z"></path><path d="M5.02082 15.5472C5.02082 15.8687 5.28316 16.1293 5.60676 16.1293H14.3932C14.7168 16.1293 14.9792 15.8687 14.9792 15.5472V13.6351H5.02082V15.5472Z"></path><path d="M14.9792 11.8183C15.9066 11.9906 16.6934 12.5645 17.1496 13.3505C17.4653 13.2386 17.8049 13.1772 18.1589 13.1772C18.3593 13.1772 18.5552 13.1972 18.7448 13.2345V10.912C18.7448 8.67355 16.9184 6.85892 14.6654 6.85892C12.4123 6.85892 10.5859 8.67351 10.5859 10.912V12.4709H14.9791V11.8183H14.9792Z"></path><path d="M9.41406 10.912C9.41406 8.67359 7.58762 6.85896 5.33461 6.85896C3.0816 6.85896 1.2552 8.67355 1.2552 10.912V13.2345C1.44484 13.1972 1.64066 13.1772 1.84113 13.1772C2.19504 13.1772 2.53469 13.2387 2.85043 13.3506C3.30668 12.5645 4.09336 11.9907 5.02082 11.8183V12.4709H9.41406V10.912Z"></path></g></svg>
    }
}

const SUITS: Suit[] = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];


const BaccaratView = ({ privateSeed, publicSeed }: { privateSeed: string, publicSeed: string }) => {
    const [bankerHand, setBankerHand] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);

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

    function createDeck() {
        const deck: Card[] = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push({ suit, rank });
            }
        }
        return deck;
    }
    const calculateScore = (hand: Card[]): number => {
        const score = hand.reduce((total, card) => {
            if (card.rank === 'A') return total + 1;
            if (['J', 'Q', 'K', '10'].includes(card.rank)) return total;
            return total + parseInt(card.rank, 10);
        }, 0);

        return score % 10;
    }

    useEffect(() => {
        if (privateSeed !== "" && publicSeed !== "") {
            const combinedhash = combineSeeds(publicSeed, privateSeed);
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
    }, [privateSeed, publicSeed])

    return <div className="p-5 border-dashed mt-3 border-[1px] border-[#3dff23b4] rounded-md flex justify-around items-center font-bold text-[20px]">
        <div className="flex mt-2 justify-center" >
            {bankerHand.map((card, index) => {
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
                                {/* Card Front */}
                                <div
                                    className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md transition-transform duration-500"
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(-180deg)',
                                        color: color,
                                        fill: color,
                                        animationDuration: rotateTime
                                    }}
                                >
                                    <div className="flex-col h-full w-full md:p-2 p-1">
                                        <span className="font-bold md:text-[1.2em]">{card.rank}</span>
                                        <div className="w-1/2">{icon}</div>
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
        <div className="flex mt-2 justify-center">
            {playerHand.map((card, index) => {
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
                                {/* Card Front */}
                                <div
                                    className="absolute inset-0 flex animate-cardRotate0 items-center justify-center bg-white rounded-lg shadow-md transition-transform duration-500"
                                    style={{
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(-180deg)',
                                        color: color,
                                        fill: color,
                                        animationDuration: rotateTime
                                    }}
                                >
                                    <div className="flex-col h-full w-full md:p-2 p-1">
                                        <span className="font-bold md:text-[1.2em]">{card.rank}</span>
                                        <div className="w-1/2">{icon}</div>
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
}

const parseCommasToThousands = (value: number) =>
    value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const HiloMView = ({ privateSeed, publicSeed }: { privateSeed: string, publicSeed: string }) => {
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
        if (privateSeed !== "" && publicSeed !== "") {
            const card = getHiloMGameCard(privateSeed, publicSeed);
            setHide(true);
            setTimeout(() => {
                setCard(card as Card);
                setHide(false);
            }, 500)
        } else {
            setHide(true);
        }
    }, [privateSeed, publicSeed])

    return <div className="p-5 border-dashed mt-3 border-[1px] border-[#3dff23b4] rounded-md flex justify-around items-center font-bold text-[20px]">
        <div
            className="w-[30%] select-none"
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
                    className={`absolute inset-0 flex items-center justify-center bg-white rounded-sm shadow-md backface-hidden transition-all duration-500 `}
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
                    className={`absolute inset-0 w-full h-full flex items-center justify-center bg-cover bg-center rounded-sm shadow-md transition-transform duration-500 border-2`}
                    style={{
                        backfaceVisibility: 'hidden',
                        background: 'green',
                        transform: isHide ? 'rotateY(0deg)' : 'rotateY(180deg)',
                    }}
                ></div>
            </div>
        </div>

    </div>
}