import React, { useEffect, useMemo, useState } from "react";
import Container from "../components/Container";
import useIsMobile from "../hooks/useIsMobile";
import AmountInput from "../components/AmountInput";
import Button from "../components/Button";
import axiosServices from "../utils/axios";
import SwitchTab from "../components/SwitchTab";
import { toast } from "react-toastify";
import { buildPrivateHash } from "../utils/crash";
import CustomInput from "../components/CustomInput";
import { CopyIcon } from "../components/svgs";
import CryptoJS from "crypto-js";
import deal from "../assets/audio/deal.bN7zuU7A.mp3";
import clean from "../assets/audio/mucked.BMTcJIOd.mp3";
import reverse from "../assets/audio/flip.xdzctLJY.mp3";
import CurrencyIcon from "../components/CurrencyIcon";
import { useSelector } from "../store";

let dealAudio = deal,
  cleanAudio = clean,
  reverseAudio = reverse;

type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
type Card =
  | {
    rank: string;
    suit: "Hearts" | "Diamonds" | "Clubs" | "Spades" | string;
  }
  | undefined;
const STATUS = {
  win: "Player wins! Dealer busts.",
  lose: "Dealer wins! Player busts.",
  draw: "It's a tie!",
  continue: "Player continues.",
  insuance: "Dealer has blackjack! Insurance paid 2:1.",
  notInsurance: "No blackjack. Insurance bet lost.",
};
const card_suits = {
  Hearts: {
    color: "#e9113c",
    icon: (
      <svg fill="currentColor" viewBox="0 0 64 64">
        <title></title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M30.907 55.396.457 24.946v.002A1.554 1.554 0 0 1 0 23.843c0-.432.174-.82.458-1.104l14.13-14.13a1.554 1.554 0 0 1 1.104-.458c.432 0 .821.175 1.104.458l14.111 14.13c.272.272.645.443 1.058.453l.1-.013h.004a1.551 1.551 0 0 0 1.045-.452l14.09-14.09a1.554 1.554 0 0 1 1.104-.457c.432 0 .82.174 1.104.457l14.13 14.121a1.557 1.557 0 0 1 0 2.209L33.114 55.396v-.002c-.27.268-.637.438-1.046.452v.001h.003a.712.712 0 0 1-.04.002h-.029c-.427 0-.815-.173-1.095-.453Z"
        ></path>
      </svg>
    ),
  },
  Diamonds: {
    color: "#e9113c",
    icon: (
      <svg fill="currentColor" viewBox="0 0 64 64">
        <title></title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m37.036 2.1 24.875 24.865a7.098 7.098 0 0 1 2.09 5.04c0 1.969-.799 3.75-2.09 5.04L37.034 61.909a7.076 7.076 0 0 1-5.018 2.078c-.086 0-.174 0-.25-.004v.004h-.01a7.067 7.067 0 0 1-4.79-2.072L2.089 37.05A7.098 7.098 0 0 1 0 32.009c0-1.97.798-3.75 2.09-5.04L26.965 2.102v.002A7.07 7.07 0 0 1 31.754.02l.002-.004h-.012c.088-.002.176-.004.264-.004A7.08 7.08 0 0 1 37.036 2.1Z"
        ></path>
      </svg>
    ),
  },
  Clubs: {
    color: "#1a2c38",
    icon: (
      <svg fill="currentColor" viewBox="0 0 64 64">
        <title></title>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M63.256 30.626 33.082.452A1.526 1.526 0 0 0 31.994 0c-.024 0-.048 0-.072.002h.004v.002a1.53 1.53 0 0 0-1.034.45V.452L.741 30.604a1.54 1.54 0 0 0-.45 1.09c0 .426.172.81.45 1.09l14.002 14.002c.28.278.663.45 1.09.45.426 0 .81-.172 1.09-.45l13.97-13.97a1.53 1.53 0 0 1 1.031-.45h.002l.027-.001.031-.001c.424 0 .81.172 1.088.452l14.002 14.002c.28.278.664.45 1.09.45.426 0 .81-.172 1.09-.45l14.002-14.002a1.546 1.546 0 0 0 0-2.192v.002ZM45.663 64H18.185a.982.982 0 0 1-.692-1.678L31.23 48.587h-.002a.986.986 0 0 1 .694-.285h.002v.047l.01-.047a.98.98 0 0 1 .686.285l13.736 13.736A.982.982 0 0 1 45.663 64Z"
        ></path>
      </svg>
    ),
  },
  Spades: {
    color: "#1a2c38",
    icon: (
      <svg fill="currentColor" viewBox="0 0 64 64">
        <title></title>
        <path d="M14.022 50.698.398 36.438A1.47 1.47 0 0 1 0 35.427c0-.395.152-.751.398-1.012l13.624-14.268c.249-.257.59-.417.967-.417.378 0 .718.16.967.417l13.625 14.268c.245.26.397.617.397 1.012 0 .396-.152.752-.397 1.013L15.957 50.698c-.25.257-.59.416-.968.416s-.718-.16-.967-.416Zm34.022 0L34.41 36.438a1.471 1.471 0 0 1-.398-1.012c0-.395.152-.751.398-1.012l13.633-14.268c.248-.257.589-.417.967-.417s.718.16.967.417l13.624 14.268c.246.26.398.617.398 1.012 0 .396-.152.752-.398 1.013L49.978 50.698c-.249.257-.59.416-.967.416-.378 0-.719-.16-.968-.416ZM44.541 62h.01c.685 0 1.239-.58 1.239-1.296 0-.36-.14-.686-.367-.92L32.871 46.657a1.206 1.206 0 0 0-.871-.375h-.04L27.335 62h17.207ZM32.963 32.965l13.624-14.25a1.47 1.47 0 0 0 .398-1.012 1.47 1.47 0 0 0-.398-1.013L32.963 2.422a1.334 1.334 0 0 0-.97-.422h-.03L26.51 16.229l5.455 17.156h.03c.38 0 .72-.16.968-.42Z"></path>
        <path d="M31.028 2.424 17.404 16.683c-.245.26-.397.616-.397 1.012s.152.752.397 1.012l13.624 14.26c.24.253.568.412.934.421L31.963 2a1.33 1.33 0 0 0-.935.424Zm-12.45 57.36c-.228.234-.368.56-.368.92 0 .717.554 1.296 1.238 1.296h12.515l-.002-15.718c-.33.008-.625.15-.841.375L18.576 59.784Z"></path>
      </svg>
    ),
  },
};

const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const ranks = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

let audioEnabled = false;
let audioVolume = 1;
const audioPlay = (audioClip: any) => {
  if (!audioEnabled) return;
  const audio = new Audio(audioClip);
  audio.volume = audioVolume;
  audio.play().then(() => { }).catch((error: any) => {
    console.log("Failed to autoplay audio:", error);
  });
}

const BlackjackGame = () => {
  const [disabled, setDisable] = useState<string[]>([
    "hit",
    "double",
    "stand",
    "split",
  ]);
  const { soundVolume, showGameAnimation, maxBetAllow, gameHotKeyEnabled, showGameInfo, showHotkeyPanel } = useSelector((state) => state.setting)

  const [amount, setAmount] = useState<number>(0);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [playerHand2, setPlayerHand2] = useState<Card[]>([]);
  const [dealerHandValue, setDealerHandValue] = useState(0);
  const [playerHandValue, setPlayerHandValue] = useState(0);
  const [playerHand2Value, setPlayerHand2Value] = useState(0);
  const [match, setMatch] = useState(0); //1 win,2 lose, 3draw
  const [loading, setLoading] = useState(true);
  const [clear, setClear] = useState(false);
  const [splited, setSplited] = useState(0);
  const [insuranceVisible, setInsuranceVisble] = useState(false);
  const [activedTab, setTab] = useState(0);
  const [resultvisble, setResultVsible] = useState(false)
  const isMobile = useIsMobile();

  const [clientSeed, setClientSeed] = useState("");
  const [serverSeed, setServerSeed] = useState("");
  const [serverSeedHash, setServerSeedHash] = useState("");

  const [multiplier, setMultiplier] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (match === 1) setResultVsible(true)
  }, [match])

  const init = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerHand2([]);
    setDisable([
      "hit",
      "double",
      "stand",
      "split",
      "bet",
      "amount",
      "insurance",
    ]);
    setMatch(0);
    setClear(false);
    setPlayerHandValue(0);
    setPlayerHand2Value(0);
    setDealerHandValue(0);
    setSplited(0);
    setResultVsible(false)
  };
  const startbet = () => {
    setClear(true);
    setDisable([
      "hit",
      "double",
      "stand",
      "split",
      "bet",
      "amount",
      "insurance",
    ]);
    if (playerHand.length) audioPlay(cleanAudio);
  };

  const getCards = async () => {
    const { data } = await axiosServices.post("/blackjack/start", { amount, currency: "" });
    console.log("startbet", playerHand, dealerHand);
    setServerSeedHash(data.serverSeedHash);
    setClientSeed(data.clientSeed);
    setServerSeed("");

    for (let i = 0; i < data.playerHand.length; i++) {
      setTimeout(() => {
        playerHand[i] = undefined;
        setPlayerHand([...playerHand]);
      }, 470 + 1000 * i);
      setTimeout(() => {
        playerHand[i] = data.playerHand[i];
        setPlayerHand([...playerHand]);
        audioPlay(dealAudio);
      }, 500 + 1000 * i);
    }
    for (let j = 0; j < data.dealerHand.length; j++) {
      setTimeout(() => {
        dealerHand[j] = undefined;
        setDealerHand([...dealerHand]);
      }, 970 + 1000 * j);
      setTimeout(() => {
        dealerHand[j] = data.dealerHand[j];
        setDealerHand([...dealerHand]);
        audioPlay(dealAudio);
      }, 1000 + 1000 * j);
    }

    setTimeout(() => {
      setPlayerHandValue(data.playerValue);
      setPlayerHand2Value(data.playerValue2);
    }, data.playerHand.length * 500 + 1000);

    setTimeout(() => {
      setDealerHandValue(data.dealerValue);
      switch (data.result) {
        case STATUS.continue:
          if (!data.canSplit) setDisable(["amount", "bet", "split"]);
          else setDisable(["amount", "bet"]);

          if (data.dealerHand[0].rank === "A") {
            setInsuranceVisble(true);
          }

          break;
        case STATUS.win:
          audioPlay(reverseAudio);
          setTimeout(() => {
            setDisable(["hit", "double", "stand", "split"]);
            setMatch(1);
          }, [data.playerHand, data.dealerHand, data.playerHand2].sort((a, b) => b.length - a.length)[0].length * 200 + 1000);
          setMultiplier(data.multiplier);
          setServerSeed(data.serverSeed);
          setProfit(data.profit);
          setClientSeed(data.clientSeed)
          break;
        case STATUS.lose:
          audioPlay(reverseAudio);
          setTimeout(() => {
            setDisable(["hit", "double", "stand", "split"]);
            setMatch(2);
          }, [data.playerHand, data.dealerHand, data.playerHand2].sort((a, b) => b.length - a.length)[0].length * 200 + 1000);
          setMultiplier(0);
          setServerSeed(data.serverSeed);
          setClientSeed(data.clientSeed)
          break;
        case STATUS.draw:
          audioPlay(reverseAudio);
          setTimeout(() => {
            setDisable(["hit", "double", "stand", "split"]);
            setMatch(3);
          }, [data.playerHand, data.dealerHand, data.playerHand2].sort((a, b) => b.length - a.length)[0].length * 200 + 1000);
          setMultiplier(1);
          setServerSeed(data.serverSeed);
          setClientSeed(data.clientSeed)
          break;
      }
    }, data.dealerHand.length * 500 + 1500);
  };

  const hit = async () => {
    setDisable(["hit", "double", "stand", "split", "bet", "amount"]);
    const { data } = await axiosServices.post("/blackjack/hit");
    console.log("hit", data);

    if (playerHand.length !== data.playerHand.length) {
      playerHand[playerHand.length] = undefined;
      setPlayerHand([...playerHand]);
    }

    setTimeout(() => {
      audioPlay(dealAudio);

      setTimeout(() => {
        audioPlay(reverseAudio);
      }, 500);
      setPlayerHand(data.playerHand);
    }, 500);
    setTimeout(() => {
      if (data.result === STATUS.lose) {
        setDealerHandValue(data.dealerValue);
        setDisable(["split", "double", "hit", "stand"]);
        setMatch(2);
        setMultiplier(0);
        setServerSeed(data.serverSeed);
        setClientSeed(data.clientSeed)
      } else if (data.result === STATUS.continue)
        setDisable(["bet", "amount", "split"]);
      setPlayerHandValue(data.handValue);
      if (data.handValue === 21) {
        stand();
      }

      if (data.switched) {
        console.log("switch", playerHand, playerHand2);
        setPlayerHand([...playerHand2]);
        setPlayerHand2(data.playerHand);
        setPlayerHandValue(playerHand2Value);
        setPlayerHand2Value(data.handValue);
        setSplited(2);
      }
    }, 1000);
  };
  const stand = async () => {
    setDisable(["hit", "double", "stand", "split", "bet", "amount"]);

    const { data } = await axiosServices.post("/blackjack/stand");
    console.log("stand", data);

    if (dealerHand.length === data.dealerHand.length) {
      audioPlay(reverseAudio);
      setDealerHand(data.dealerHand);
      setDealerHandValue(data.dealerValue);
      setMultiplier(data.multiplier);
      switch (data.result) {
        case STATUS.win:
          setMatch(1);
          break;
        case STATUS.lose:
          setMatch(2);
          break;
        case STATUS.draw:
          setMatch(3);
          break;
      }
    }

    for (
      let j = 0, i = dealerHand.length - 1;
      i < data.dealerHand.length;
      j++, i++
    ) {
      if (j) {
        setTimeout(() => {
          dealerHand[i] = undefined;
          setDealerHand([...dealerHand]);
        }, 470 + 1000 * j);
      }

      setTimeout(() => {
        if (i === data.dealerHand.length - 1) {
          setTimeout(() => {
            setDealerHandValue(data.dealerValue);
            setDisable(["split", "double", "hit", "stand"]);
            setMultiplier(data.multiplier);
            setServerSeed(data.serverSeed);
            setClientSeed(data.clientSeed)
            switch (data.result) {
              case STATUS.win:
                setMatch(1);
                break;
              case STATUS.lose:
                setMatch(2);
                break;
              case STATUS.draw:
                setMatch(3);
                break;
            }
          }, 500);
        }
        dealerHand[i] = data.dealerHand[i];
        setDealerHand([...dealerHand]);
        if (j) audioPlay(dealAudio);
        setTimeout(() => {
          audioPlay(reverseAudio);
        }, 500);
      }, 500 + 1000 * j);
    }
  };
  const double = async () => {
    setAmount(amount * 2)
    setDisable(["hit", "double", "stand", "split", "bet", "amount"]);
    const { data } = await axiosServices.post("/blackjack/double");
    console.log("double", data);
    if (playerHand.length !== data.playerHand.length) {
      playerHand[playerHand.length] = undefined;
      setPlayerHand([...playerHand]);
    }

    setTimeout(() => {
      audioPlay(dealAudio);
      setTimeout(() => {
        audioPlay(reverseAudio);
      }, 500);
      setPlayerHand(data.playerHand);
    }, 500);
    setTimeout(() => {
      if (data.result === STATUS.lose) {
        setDisable(["hit", "double", "stand", "split"]);
        setServerSeed(data.serverSeed);
        setClientSeed(data.clientSeed)
        setMatch(2);
      } else {
        stand();
      }
      setPlayerHandValue(data.handValue);
      if (data.handValue === 21) {
        stand();
      }
    }, 1000);
  };
  const split = async () => {
    setDisable(["hit", "double", "stand", "split", "bet", "amount"]);
    setPlayerHand2([playerHand[1], undefined]);
    setPlayerHand([playerHand[0], undefined]);
    setSplited(1);
    setPlayerHandValue(0);
    const { data } = await axiosServices.post("/blackjack/split", { amount });
    console.log("split", data);

    setTimeout(() => {
      audioPlay(dealAudio);
      setTimeout(() => {
        audioPlay(reverseAudio);
      }, 500);

      setPlayerHand2(data.hand2.cards);
      setPlayerHand2Value(data.hand2.value);
    }, 1000);

    setTimeout(() => {
      audioPlay(dealAudio);
      setPlayerHand(data.hand1.cards);
      setPlayerHandValue(data.hand1.value);
    }, 500);

    setTimeout(() => {
      if (data.hand1.value === 21) {
        stand();
      } else {
        setDisable(["split", "bet", "amount"]);
      }
    }, 1500);
  };
  const insurance = async (confirm: boolean) => {
    setDisable([
      "hit",
      "double",
      "stand",
      "split",
      "bet",
      "amount",
      "insurance",
    ]);
    setInsuranceVisble(false);
    const { data } = await axiosServices.post("/blackjack/insurance", {
      confirm,
    });
    switch (data.result) {
      case STATUS.insuance:
        audioPlay(reverseAudio);
        setDealerHand(data.dealerHand);
        setDealerHandValue(data.dealerHandValue);
        setMatch(2);
        setDisable(["hit", "double", "stand", "split"]);
        break;
      case STATUS.notInsurance:
        if (playerHand[0]?.rank === playerHand[1]?.rank)
          setDisable(["bet", "amount"]);
        else setDisable(["bet", "amount", "split"]);
        setInsuranceVisble(false);
        break;
    }
  };

  useEffect(() => {
    setLoading(false);
    if (!dealerHand.length && !playerHand.length && !loading) {
      getCards();
    }
  }, [dealerHand, playerHand]);
  useEffect(() => {
    if (clear) {
      setTimeout(() => {
        init();
      }, [playerHand, dealerHand, playerHand2].sort((a, b) => b.length - a.length)[0].length * 200 + 500);
    }
  }, [clear]);

  useEffect(() => {
    audioEnabled = true;
  }, [])

  useEffect(() => {
    audioVolume = Number(soundVolume) / 10;
  }, [soundVolume]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (!gameHotKeyEnabled) return;
      switch (event.keyCode) {
        case 32:
          startbet();
          event.preventDefault();
          break;
        case 83:
          setAmount(amount * 2);
          event.preventDefault();
          break;
        case 65:
          setAmount(amount / 2);
          event.preventDefault();
          break;
        case 68:
          setAmount(0)
          event.preventDefault();;
          break;
        case 81:
          hit();
          event.preventDefault();
          break;
        case 87:
          stand();
          event.preventDefault();
          break;
        case 69:
          split();
          event.preventDefault();
          break;
        case 82:
          double();
          event.preventDefault();
          break;
        case 84:
          insurance(true);
          event.preventDefault();
          break;
        case 89:
          insurance(false);
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
    match,
    playerHand,
    dealerHand,
    amount,
    playerHand2,
    insuranceVisible,
    disabled,
    loading,
    activedTab
  ])


  return (
    <Container className="w-full bg-[#10100f] h-full flex justify-center  ">
      <div className={`max-w-[1300px] mt-5 w-full p-1 flex justify-center `}>
        <div className="grid grid-cols-3 max-w-[400px] w-full  md:max-w-none   md:grid-cols-4 rounded-md overflow-hidden  bg-panel border-[1px] border-[#020202bb]  shadow-md">
          <div className="hidden col-span-1 p-2 min-h-[560px] bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] md:flex flex-col">
            <SwitchTab
              active={activedTab}
              onChange={setTab}
              options={["BET", "Fairness"]}
            />
            {activedTab ? (
              <FairnessView
                clientSeed={clientSeed}
                serverHash={serverSeedHash}
                serverSeed={serverSeed}
              />
            ) : (
              <>
                <AmountInput
                  onChange={setAmount}
                  value={amount}
                  disabled={disabled.includes("amount")}
                  label={"Bet Amount"}
                  amount={amount * 1}
                />
                {insuranceVisible ? (
                  <>
                    <div className=" text-white font-bold p-5 text-center w-full">
                      Insurance?
                    </div>
                    <div className="flex flex-row  max-[1000px]:block gap-4">
                      <button
                        onClick={() => insurance(true)}
                        disabled={disabled.includes("insurance")}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center  rounded-md p-2 bg-input_bg  my-2
                           text-white text-center  focus:outline-none  hover:bg-input_hover active:scale-90 transform
                         `}
                      >
                        Accept.
                      </button>
                      <button
                        onClick={() => insurance(false)}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center  rounded-md p-2 bg-input_bg  my-2
                           text-white text-center  focus:outline-none  hover:bg-input_hover active:scale-90 transform
                         `}
                      >
                        No.
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-row   max-[1000px]:block gap-4 ">
                      <button
                        disabled={disabled.includes("hit")}
                        onClick={hit}
                        className={`basis-full  drop-shadow-md  w-full font-bold flex justify-center  rounded-md p-2 bg-input_bg my-2   ${disabled.includes("hit")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("hit")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("hit")
                            ? ""
                            : "active:scale-90 transform"
                          } `}
                      >
                        Hit&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-amber-700/100 w-4 align-middle"
                        >
                          <path d="M52.615 44.136h4.272c1.138 0 1.992 1.425 1.138 2.28L43.502 62.931c-1.139 1.424-3.134 1.424-4.272 0L24.707 46.415c-.855-.854-.285-2.279 1.138-2.279h4.272c.854 0 1.424-.57 1.424-1.424V27.334c0-1.709 1.139-2.847 2.847-2.847h13.953c1.71 0 2.847 1.138 2.847 2.847v15.378c0 .854.57 1.424 1.425 1.424h.002ZM16.734 41.29c1.138-2.563 3.417-4.555 6.264-5.41v-8.827c0-6.264 5.126-11.39 11.39-11.39h2.563V2.847C36.951 1.138 35.813 0 34.104 0H8.474C6.766 0 5.627 1.138 5.627 2.847v42.432c0 1.709 1.139 2.847 2.847 2.847h7.69c-.57-2.279-.57-4.555.57-6.834v-.003Z"></path>
                        </svg>
                      </button>
                      <button
                        disabled={disabled.includes("stand")}
                        onClick={stand}
                        className={`basis-full  drop-shadow-md  w-full font-bold flex justify-center rounded-md p-2 bg-input_bg my-2   ${disabled.includes("stand")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("stand")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("stand")
                            ? ""
                            : "active:scale-90 transform"
                          }`}
                      >
                        Stand&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-violet-700/100 w-4 align-middle"
                        >
                          <path d="M59.102 14.4c0-2.666-2.134-4.534-4.534-4.534-2.666 0-4.534 2.134-4.534 4.534V32h-5.866V4.534C44.168 1.868 42.034 0 39.634 0S35.1 2.134 35.1 4.534V32h-5.6V12c0-2.666-2.134-4.534-4.534-4.534-2.666 0-4.534 2.134-4.534 4.534v30.666l-7.2-7.2c-1.866-1.866-5.066-1.866-6.934 0-1.868 1.866-1.866 5.066 0 6.934l14.4 17.6c1.6 2.666 4.534 4 7.734 4h16.266c7.734 0 14.134-6.4 14.134-14.134l.266-35.466h.004Z"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-row  max-[1000px]:block gap-4 ">
                      <button
                        disabled={disabled.includes("split")}
                        onClick={split}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center rounded-md p-2 bg-input_bg  my-2   max-[1000px]:my-0  max-[1000px]:mb-2  w-full ${disabled.includes("split")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("split")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("split")
                            ? ""
                            : "active:scale-90 transform"
                          }`}
                      >
                        Split&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-white-700/100 w-4 align-middle"
                        >
                          <path d="m62.716 17.48-19.897-7.259c-1.075-.268-2.152.269-2.42 1.075l-8.334 23.66-8.335-23.66c-.268-.806-1.345-1.345-2.42-1.075l-19.897 7.26C.338 17.749-.2 18.826.068 19.9L11.63 52.704c.538.806 1.613 1.345 2.688 1.075l17.746-6.453 17.745 6.453c1.075.268 2.152-.269 2.42-1.075L63.788 19.9c.54-1.075 0-2.152-1.074-2.42h.002Z"></path>
                        </svg>
                      </button>
                      <button
                        disabled={disabled.includes("double")}
                        onClick={double}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center rounded-md p-2 bg-input_bg  my-2 w-full ${disabled.includes("double")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("double")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("double")
                            ? ""
                            : "active:scale-90 transform"
                          }`}
                      >
                        Double&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-white-700/100 w-4 align-middle"
                        >
                          <path d="M18.285 6.994c6.454 0 12.1 3.497 15.327 8.605-8.337 4.303-14.252 13.177-14.252 23.125 0 1.614.27 3.227.539 4.572-.539.269-1.075.269-1.614.269C8.067 43.565 0 35.498 0 25.279 0 15.06 8.337 6.994 18.285 6.994ZM36.3 23.128c2.69-1.614 5.917-2.689 9.412-2.689l.002-.004C55.933 20.435 64 28.772 64 38.721c0 10.218-8.337 18.285-18.286 18.285-9.41 0-16.94-7.26-18.015-16.402-.268-.536-.268-1.343-.268-1.881 0-1.075 0-2.152.268-3.227.268-.268.268-.538.268-.807.269-1.077.539-2.152.807-2.958 0-.134.067-.269.134-.404.067-.134.134-.269.134-.403.168-.505.442-.905.69-1.265.147-.215.285-.415.385-.616.134-.135.269-.336.404-.538.134-.202.269-.403.403-.537.374-.188.619-.506.823-.773.09-.115.17-.221.252-.302.17-.17.34-.367.518-.574.386-.446.812-.94 1.363-1.308.135-.136.27-.203.405-.27.134-.068.269-.135.402-.268.27-.27.538-.471.807-.673.269-.202.537-.403.806-.672Z"></path>
                        </svg>
                      </button>
                    </div>
                  </>
                )}

                <Button
                  disabled={disabled.includes("bet")}
                  onClick={startbet}
                >
                  Bet
                </Button>
              </>
            )}
          </div>

          <div
            className={` gap-2  
                col-span-3  w-full min-h-[300px]     relative h-full overflow-hidden justify-center  flex`}
          >
            <ResultModal odds={1.5} profit={amount * 1.5} visible={resultvisble} onClose={() => setResultVsible(false)} />

            <div className=" h-full bg-no-repeat bg-center flex absolute bg-[length:400px_200px]  w-full space-x-1">
              <div className="">
                {[...Array(10)].map((val, key) => (
                  <RenderCard
                    key={key}
                    style={{
                      top: `${-10 - key / 2}% `,
                      right: "3%",
                    }}
                  />
                ))}
              </div>
              <div className="grid grid-rows-6 gap-1 w-full">
                <div className="row-span-1  w-full" />
                <div className="row-span-1  w-full relative">
                  <CardPanel
                    hand={dealerHand}
                    handValue={dealerHandValue}
                    match={match}
                    clear={clear}
                    isDealerCard={true}
                    isMobile={isMobile}
                  />
                </div>
                <div className="row-span-2  w-full" />
                <div className="row-span-1  w-full relative">
                  {splited === 0 ? (
                    <>
                      <CardPanel
                        hand={playerHand}
                        handValue={playerHandValue}
                        match={match}
                        clear={clear}
                      />
                    </>
                  ) : (
                    <div className=" grid  grid-cols-2 w-full h-full">
                      <div className=" z-10">
                        <CardPanel
                          hand={splited === 1 ? playerHand2 : playerHand}
                          handValue={
                            splited === 1 ? playerHand2Value : playerHandValue
                          }
                          match={match}
                          clear={clear}
                          isMain={splited === 2}
                          splited={splited}
                          isMobile={isMobile}
                        />
                      </div>
                      <div>
                        <CardPanel
                          hand={splited === 2 ? playerHand2 : playerHand}
                          handValue={
                            splited === 2 ? playerHand2Value : playerHandValue
                          }
                          match={match}
                          clear={clear}
                          isMain={splited === 1}
                          splited={splited}
                          isMobile={isMobile}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="row-span-1  w-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col col-span-3 w-full  p-2 bg-sider_panel shadow-[0px_0px_15px_rgba(0,0,0,0.25)] md:hidden ">
            {activedTab ? (
              <FairnessView
                clientSeed={clientSeed}
                serverHash={serverSeedHash}
                serverSeed={serverSeed}
              />
            ) : (
              <>
                {insuranceVisible ? (
                  <>
                    <div className=" text-white font-bold p-5 text-center w-full">
                      Insurance?
                    </div>
                    <div className="flex flex-row   gap-4">
                      <button
                        onClick={() => insurance(true)}
                        disabled={disabled.includes("insurance")}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center  rounded-md p-2 bg-input_bg  my-2
                           text-white text-center  focus:outline-none  hover:bg-input_hover active:scale-90 transform
                         `}
                      >
                        Accept.
                      </button>
                      <button
                        onClick={() => insurance(false)}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center  rounded-md p-2 bg-input_bg  my-2
                           text-white text-center  focus:outline-none  hover:bg-input_hover active:scale-90 transform
                         `}
                      >
                        No.
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-row    gap-4 ">
                      <button
                        disabled={disabled.includes("hit")}
                        onClick={hit}
                        className={`basis-full  drop-shadow-md  w-full font-bold flex justify-center  rounded-md p-2 bg-input_bg my-2   ${disabled.includes("hit")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("hit")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("hit")
                            ? ""
                            : "active:scale-90 transform"
                          } `}
                      >
                        Hit&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-amber-700/100 w-4 align-middle"
                        >
                          <path d="M52.615 44.136h4.272c1.138 0 1.992 1.425 1.138 2.28L43.502 62.931c-1.139 1.424-3.134 1.424-4.272 0L24.707 46.415c-.855-.854-.285-2.279 1.138-2.279h4.272c.854 0 1.424-.57 1.424-1.424V27.334c0-1.709 1.139-2.847 2.847-2.847h13.953c1.71 0 2.847 1.138 2.847 2.847v15.378c0 .854.57 1.424 1.425 1.424h.002ZM16.734 41.29c1.138-2.563 3.417-4.555 6.264-5.41v-8.827c0-6.264 5.126-11.39 11.39-11.39h2.563V2.847C36.951 1.138 35.813 0 34.104 0H8.474C6.766 0 5.627 1.138 5.627 2.847v42.432c0 1.709 1.139 2.847 2.847 2.847h7.69c-.57-2.279-.57-4.555.57-6.834v-.003Z"></path>
                        </svg>
                      </button>
                      <button
                        disabled={disabled.includes("stand")}
                        onClick={stand}
                        className={`basis-full  drop-shadow-md  w-full font-bold flex justify-center rounded-md p-2 bg-input_bg my-2   ${disabled.includes("stand")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("stand")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("stand")
                            ? ""
                            : "active:scale-90 transform"
                          }`}
                      >
                        Stand&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-violet-700/100 w-4 align-middle"
                        >
                          <path d="M59.102 14.4c0-2.666-2.134-4.534-4.534-4.534-2.666 0-4.534 2.134-4.534 4.534V32h-5.866V4.534C44.168 1.868 42.034 0 39.634 0S35.1 2.134 35.1 4.534V32h-5.6V12c0-2.666-2.134-4.534-4.534-4.534-2.666 0-4.534 2.134-4.534 4.534v30.666l-7.2-7.2c-1.866-1.866-5.066-1.866-6.934 0-1.868 1.866-1.866 5.066 0 6.934l14.4 17.6c1.6 2.666 4.534 4 7.734 4h16.266c7.734 0 14.134-6.4 14.134-14.134l.266-35.466h.004Z"></path>
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-row   gap-4 ">
                      <button
                        disabled={disabled.includes("split")}
                        onClick={split}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center rounded-md p-2 bg-input_bg  my-2     w-full ${disabled.includes("split")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("split")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("split")
                            ? ""
                            : "active:scale-90 transform"
                          }`}
                      >
                        Split&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-white-700/100 w-4 align-middle"
                        >
                          <path d="m62.716 17.48-19.897-7.259c-1.075-.268-2.152.269-2.42 1.075l-8.334 23.66-8.335-23.66c-.268-.806-1.345-1.345-2.42-1.075l-19.897 7.26C.338 17.749-.2 18.826.068 19.9L11.63 52.704c.538.806 1.613 1.345 2.688 1.075l17.746-6.453 17.745 6.453c1.075.268 2.152-.269 2.42-1.075L63.788 19.9c.54-1.075 0-2.152-1.074-2.42h.002Z"></path>
                        </svg>
                      </button>
                      <button
                        disabled={disabled.includes("double")}
                        onClick={double}
                        className={`basis-full  drop-shadow-md  font-bold flex justify-center rounded-md p-2 bg-input_bg  my-2 w-full ${disabled.includes("double")
                          ? "text-text_1"
                          : "text-white "
                          }  text-center  focus:outline-none ${disabled.includes("double")
                            ? "cursor-not-allowed"
                            : "hover:bg-input_hover"
                          } ${disabled.includes("double")
                            ? ""
                            : "active:scale-90 transform"
                          }`}
                      >
                        Double&nbsp;
                        <svg
                          fill="currentColor"
                          viewBox="0 0 64 64"
                          className="svg-icon text-white-700/100 w-4 align-middle"
                        >
                          <path d="M18.285 6.994c6.454 0 12.1 3.497 15.327 8.605-8.337 4.303-14.252 13.177-14.252 23.125 0 1.614.27 3.227.539 4.572-.539.269-1.075.269-1.614.269C8.067 43.565 0 35.498 0 25.279 0 15.06 8.337 6.994 18.285 6.994ZM36.3 23.128c2.69-1.614 5.917-2.689 9.412-2.689l.002-.004C55.933 20.435 64 28.772 64 38.721c0 10.218-8.337 18.285-18.286 18.285-9.41 0-16.94-7.26-18.015-16.402-.268-.536-.268-1.343-.268-1.881 0-1.075 0-2.152.268-3.227.268-.268.268-.538.268-.807.269-1.077.539-2.152.807-2.958 0-.134.067-.269.134-.404.067-.134.134-.269.134-.403.168-.505.442-.905.69-1.265.147-.215.285-.415.385-.616.134-.135.269-.336.404-.538.134-.202.269-.403.403-.537.374-.188.619-.506.823-.773.09-.115.17-.221.252-.302.17-.17.34-.367.518-.574.386-.446.812-.94 1.363-1.308.135-.136.27-.203.405-.27.134-.068.269-.135.402-.268.27-.27.538-.471.807-.673.269-.202.537-.403.806-.672Z"></path>
                        </svg>
                      </button>
                    </div>
                  </>
                )}
                <AmountInput
                  onChange={setAmount}
                  value={amount}
                  disabled={disabled.includes("amount")}
                  label="Bet Amount"
                  amount={amount * 1}
                />
                <Button
                  disabled={disabled.includes("bet")}
                  onClick={startbet}
                >
                  Bet
                </Button>
              </>
            )}
            <SwitchTab
              active={activedTab}
              onChange={setTab}
              options={["BET", "Fairness"]}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default BlackjackGame;

const CardPanel = ({
  hand,
  handValue,
  match,
  clear,
  isMain = false,
  isDealerCard = false,
  splited = 0,
  isMobile = false,
}: {
  hand: Card[];
  handValue: number;
  match: number;
  clear: boolean;
  splited?: number;
  isMain?: boolean;
  isDealerCard?: boolean;
  isMobile?: boolean;
}) => {
  let classname = "";
  let badgeClassName = `${handValue ? "" : "hidden"
    }  text-center w-10 h-5 text-xs md:w-14  md:text-[100%]  rounded-3xl absolute p-px font-bold text-white `;
  //classname set
  if (!isDealerCard) {
    classname = " -outline-offset-1 ";
    if (splited) {
      if (isMain) {
        switch (match) {
          case 1:
            classname += ` outline-[#00e701]`;
            break;
          case 2:
            classname += ` outline-[#e9113c]`;
            break;
          case 3:
            classname += ` outline-[#ff9d00]`;
            break;
          default:
            classname += ` outline-[#1475e1]`;
        }
      } else {
        classname += ` outline-none`;
      }
    } else {
      switch (match) {
        case 1:
          classname += ` outline-[#00e701]`;
          break;
        case 2:
          classname += ` outline-[#e9113c]`;
          break;
        case 3:
          classname += ` outline-[#ff9d00]`;
          break;
        default:
          classname += ` outline-none`;
      }
    }
  } else {
    classname += ` outline-none`;
  }

  //badge class

  if (!isDealerCard) {
    if (splited) {
      if (isMain) {
        switch (match) {
          case 1:
            badgeClassName += ` bg-[#00e701]`;
            break;
          case 2:
            badgeClassName += ` bg-[#e9113c]`;
            break;
          case 3:
            badgeClassName += ` bg-[#ff9d00]`;
            break;
          default:
            badgeClassName += ` bg-[#2f4553]`;
        }
      } else {
        badgeClassName += ` bg-[#2f4553]`;
      }
    } else {
      switch (match) {
        case 1:
          badgeClassName += ` bg-[#00e701]`;
          break;
        case 2:
          badgeClassName += ` bg-[#e9113c]`;
          break;
        case 3:
          badgeClassName += ` bg-[#ff9d00]`;
          break;
        default:
          badgeClassName += ` bg-[#2f4553]`;
      }
    }
  } else {
    badgeClassName += ` bg-[#2f4553]`;
  }

  let right = 50;

  if (splited) {
    if (isMain) {
      if (splited === 1) {
        right = 30;
      } else {
        right = 70;
      }
    } else {
      if (splited === 1) {
        right = 70;
      } else {
        right = 30;
      }
    }
  }

  return (
    <>
      {hand.map((data: Card, id) => {
        let card,
          style = {};

        //car set
        if (isDealerCard) {
          if (data?.rank !== "") card = data;
        } else {
          card = data;
        }

        //style set
        if (data) {
          style = {
            right: `${right}%`,
            top: "50%",
            transform: `translate(${clear
              ? 30 - (isMobile ? 40 : 60) * ((hand.length + 1) / 2 - (id + 1))
              : 50 - (isMobile ? 40 : 60) * ((hand.length + 1) / 2 - (id + 1))
              }%,${clear
                ? -20 - 8 * (hand.length - (id + 1))
                : -40 - 8 * (hand.length - (id + 1))
              }%)`,
            opacity: clear ? 0 : 1,
            transitionDelay: clear ? `${id * 0.2}s` : "",
          };
        } else {
          if (isDealerCard) {
            style = {
              top: "-300%",
              right: "3%",
            };
          } else {
            style = {
              top: "-640%",
              right: "3%",
            };
          }
        }

        return (
          <RenderCard
            key={id}
            card={card}
            className={classname}
            style={style}
          />
        );
      })}

      <div
        className={badgeClassName}
        style={{
          right: `${right}%`,
          top: `-${isMobile ? 100 : 70}%`,
          transition: "all 0.5s",
          // transform: `translate(${40 * hand.length + 80}%,${
          //   -400 - hand.length * 8
          // }%)`,
          transform: `translate(${25 * hand.length + 60}%,0%)`,
          opacity: clear ? 0 : 1,
          transitionDelay: clear ? `${(hand.length - 1) * 0.2}s` : "",
        }}
      >
        {handValue}
      </div>
      {isMain && (
        <div>
          <svg
            fill="currentColor"
            viewBox="0 0 64 64"
            className={`${match ? "hidden" : ""
              } w-[5%] min-w-8 absolute   text-[#1475e1] `}
            style={{
              top: `50%`,
              right: `${right}%`,
              transform: `translate(${150 + (isMobile ? 30 : 45) * hand.length
                }%,${-30 - 4 * hand.length}%)`,
              transition: "all 0.5s",
            }}
          >
            <path d="M36.998 53.995 16 32.998 36.998 12l6.306 6.306L28.61 33l14.694 14.694L36.998 54v-.005Z"></path>
          </svg>
          <svg
            fill="currentColor"
            viewBox="0 0 64 64"
            className={`${match ? "hidden" : ""
              } w-[5%] min-w-8 absolute      text-[#1475e1] `}
            style={{
              top: `50%`,
              right: `${right}%`,
              transform: `translate(${-70 - (isMobile ? 30 : 45) * hand.length
                }%,${-30 - 4 * hand.length}%)`,
              transition: "all 0.5s",
            }}
          >
            <title></title>
            <path d="m26.307 53.995 20.998-20.997L26.307 12 20 18.306 34.694 33 20.001 47.694 26.307 54v-.005Z"></path>
          </svg>
        </div>
      )}
    </>
  );
};

const RenderCard = ({
  card,
  style,
  className,
}: {
  card?: Card;
  style?: object;
  className?: string;
}) => {
  let isHide = true;
  let Icon: any = "";
  let Color = "";
  if (card) {
    isHide = false;
    Icon = card_suits[card.suit as Suit]?.icon;
    Color = card_suits[card.suit as Suit]?.color;
  }

  return (
    <div
      className={`absolute  w-[9%] min-w-[50px]   rounded-sm md:rounded-md   mx-1 cursor-pointer `}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        aspectRatio: "3 / 5",
        transition: "all 0.3s",

        ...style,
      }}
    >
      {/* Card Container */}
      <div
        className={`w-full h-full flex items-center justify-center  rounded-sm md:rounded-md  shadow-md  transition-transform delay-500 duration-300 ease-in-out ${isHide ? "transform rotate-y-180" : ""
          }`}
        style={{ position: "relative", transformStyle: "preserve-3d" }}
      >
        {/* Card Front */}
        <div
          className={`outline  outline-[4px] sm:outline-[4px] md:outline-[6px] ${className}  absolute inset-0 flex items-center justify-center  bg-white  rounded-sm md:rounded-md  shadow-md backface-hidden transition-all delay-500 duration-300 `}
          style={{
            backfaceVisibility: "hidden",
            transform: isHide ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className={`flex-col h-full w-full md:p-2 p-1 `}
            style={{ color: Color }}
          >
            <span className="font-bold md:text-[2.2em]">{card?.rank}</span>
            <div className="w-1/2">{Icon}</div>
          </div>
        </div>

        {/* Card Back */}
        <div
          className={`absolute inset-0 w-full h-full flex  items-center justify-center bg-cover bg-center bg-no-repeat bg-clip-border bg-origin-border  rounded-sm md:rounded-md  shadow-md transition-transform delay-500 duration-300 border-2  `}
          style={{
            backfaceVisibility: "hidden",
            // backgroundImage: `url(${CardBack})`,
            backgroundColor: 'green',
            transform: isHide ? "rotateY(0deg)" : "rotateY(180deg)",
          }}
        ></div>
      </div>
    </div>
  );
};

const FairnessView = ({
  clientSeed,
  serverHash,
  serverSeed
}: {
  clientSeed: string;
  serverHash: string;
  serverSeed: string;
}) => {
  const [active, setActiveTab] = useState(0);
  const [_privateSeed, setPrivateSeed] = useState("");
  const [_publicSeed, setPublicSeed] = useState("");

  const newDeck = useMemo(() => {
    let cards = [],
      cardPosition = 0,
      deck = createDeck();
    if (_publicSeed === "" || _privateSeed === "") return [];

    while (cardPosition < 52) {
      cards.push(getUniqueCard(deck, _publicSeed, _privateSeed, cardPosition++));
    }
    return cards;
  }, [_publicSeed, _privateSeed]);

  function createDeck() {
    return suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
  }
  function generateCardIndex(
    seed: string,
    cardPosition: number,
    deckSize: number
  ) {
    const combinedSeed = seed + cardPosition; // Combine seed with the card position
    const hash = CryptoJS.SHA256(combinedSeed).toString(CryptoJS.enc.Hex);
    const numericValue = parseInt(hash.slice(0, 8), 16); // Convert part of the hash to a number
    return numericValue % deckSize; // Use modulo to fit within the desired range
  }

  // Function to deal a unique card using dynamic deck and seeds
  function getUniqueCard(
    deck: any[],
    clientSeed: string,
    serverSeed: string,
    cardPosition: number
  ) {
    const seed = clientSeed + serverSeed; // Combine seeds
    const cardIndex = generateCardIndex(seed, cardPosition, deck.length); // Get card index based on seed
    const card = deck[cardIndex]; // Fetch card at this position
    deck.splice(cardIndex, 1); // Remove the card from the deck to avoid duplicates
    return card; // Return the card
  }

  useEffect(() => {
    setPrivateSeed(serverSeed);
  }, [serverSeed]);

  useEffect(() => {
    setPublicSeed(clientSeed);
  }, [clientSeed])


  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };


  return (
    <>
      <SwitchTab
        options={["Seeds", "Verify"]}
        active={active}
        onChange={(e) => setActiveTab(e)}
        type={"sub"}
      />

      {active === 0 ? (
        <>
          <CustomInput
            disabled={true}
            value={_privateSeed == "" ? clientSeed : ""}
            label={"Active Client Seed"}
            type="text"
            icon={
              <button
                onClick={() => copyToClipboard(_privateSeed == "" ? clientSeed : "")}
                className="px-1 py-2 w-full "
              >
                <CopyIcon />
              </button>
            }
          />
          <CustomInput
            disabled={true}
            value={_privateSeed === "" ? serverHash : ""}
            label={"Active Server Seed (Hashed)"}
            type="text"
            icon={
              <button
                onClick={() => copyToClipboard(_privateSeed === "" ? serverHash : "")}
                className="px-1 py-2 w-full "
              >
                <CopyIcon />
              </button>
            }
          />

          <div className="mt-4"></div>
          <CustomInput
            disabled={true}
            value={_privateSeed === "" ? "" : _publicSeed}
            label={"Previous Client Seed "}
            type="text"
            icon={
              <button
                onClick={() => copyToClipboard(_privateSeed === "" ? "" : _publicSeed)}
                className="px-1 py-2 w-full "
              >
                <CopyIcon />
              </button>
            }
          />
          <CustomInput
            disabled={true}
            value={_privateSeed === "" ? "" : _privateSeed}
            label={"Previous Server Seed"}
            type="text"
            icon={
              <button
                onClick={() => copyToClipboard(_privateSeed === "" ? "" : _privateSeed)}
                className="px-1 py-2 w-full "
              >
                <CopyIcon />
              </button>
            }
          />
        </>
      ) : (
        <>
          <div className=" w-full h-52  border-dashed border-[1px] rounded-md mt-4 grid grid-rows-4 border-green-500  overflow-hidden ">
            {newDeck.length ? <>
              <div className="  row-span-2 grid grid-cols-2 ">
                <div className="w-full relative py-1">
                  {newDeck.slice(0, 2).map((card, id) => (
                    <RenderCard
                      key={id}
                      className="outline-none"
                      card={card}
                      style={{
                        width: "1%",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        fontSize: "10px",
                        transform: `translate(${id === 0 ? -75 : -25}%,${id === 0 ? -55 : -45
                          }%)`,
                      }}
                    />
                  ))}
                </div>
                <div className="w-full  relative py-1">
                  {newDeck.slice(2, 4).map((card, id) => (
                    <RenderCard
                      key={id}
                      className="outline-none"
                      card={card}
                      style={{
                        width: "1%",
                        position: "absolute",
                        top: "50%",
                        fontSize: "10px",
                        left: "50%",
                        transform: `translate(${id === 0 ? -75 : -25}%,${id === 0 ? -55 : -45
                          }%)`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className=" row-span-2 overflow-x-auto flex relative p-1">
                {newDeck.slice(4).map((card, id) => (
                  <RenderCard
                    key={id}
                    className="outline-none"
                    card={card}
                    style={{
                      width: "1%",
                      position: "relative",
                      fontSize: "10px",
                      // top: "50%",
                      // left: "50%",
                      // transform: `translate(${id === 0 ? -85 : -15}%,${
                      //   id === 0 ? -55 : -45
                      // }%)`,
                      // bottom: 0,
                      // zIndex: 10,
                    }}
                  />
                ))}
              </div>
            </> :
              <div className="row-span-4 w-full h-full flex justify-center items-center text-white font-bold">
                Please enter the seed
              </div>}
          </div>
          <CustomInput
            onChange={setPublicSeed}
            value={_publicSeed}
            label={"Client Seed"}
            type="text"
          />
          <CustomInput
            onChange={setPrivateSeed}
            value={_privateSeed}
            label={"Server Seed"}
            type="text"
          />
          <CustomInput
            disabled={true}
            value={_privateSeed === "" ? "" : buildPrivateHash(_privateSeed || "")}
            type="text"
            label={"Server Seed(Hash)"}
          />
        </>
      )}
    </>
  );
};


const ResultModal = ({ visible, profit, odds, onClose }: { visible?: boolean, profit: number, odds: number, onClose?: () => void }) => {
  return visible ? <div onClick={onClose} className="top-0 left-0 absolute w-full h-full z-40 bg-[#00000048] flex justify-center items-center">
    <div className="relative animate-zoomIn w-[50%] md:w-[30%] min-h-40 border-2 rounded-md border-[#36e95d] bg-[#0a0a0aaf] flex-col justify-around flex "
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