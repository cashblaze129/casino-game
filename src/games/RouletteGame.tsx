import { useEffect, useRef, useState } from "react";
import SwitchTab from "../components/SwitchTab";
import useIsMobile from "../hooks/useIsMobile";
import ChipButtonGroup from "../components/ChipButtonGroup";
import AmountInput from "../components/AmountInput";
import Button from "../components/Button";
import CurrencyIcon from "../components/CurrencyIcon";
import wheelImg from "../assets/img/roulette/wheel.webp";
import chipBoard from "../assets/img/chipboard.svg";
import { toast } from "react-toastify";
import axios from "../utils/axios";

import betaudio from "../assets/audio/bet.DUx2OBl3.mp3";
import spinaudio from "../assets/audio/spin.CyU0-M-n.mp3";
import winaudio from "../assets/audio/win.BpDMfFMt.mp3";
import loseaudio from "../assets/audio/lose.CSJf_1E1.mp3";
import successaudio from "../assets/audio/success.wav";
import BetNumberInput from "../components/BetNumberInput";
import StopProfitAmount from "../components/StopAmount";
import SettingBar from "../components/Setting";
import { useSelector } from "../store";
import FairnessView from "../components/FairnessView";

const WheelImg = new Image();
WheelImg.src = wheelImg;

type ChipIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const chipValues = [1, 10, 100, 1000, 10000, 100000, 1000000];

const ratio = 100000;

export const rouletteWheelNumbers = [
  { Number: 0, Color: "Green" },
  { Number: 32, Color: "Red" },
  { Number: 15, Color: "Black" },
  { Number: 19, Color: "Red" },
  { Number: 4, Color: "Black" },
  { Number: 21, Color: "Red" },
  { Number: 2, Color: "Black" },
  { Number: 25, Color: "Red" },
  { Number: 17, Color: "Black" },
  { Number: 34, Color: "Red" },
  { Number: 6, Color: "Black" },
  { Number: 27, Color: "Red" },
  { Number: 13, Color: "Black" },
  { Number: 36, Color: "Red" },
  { Number: 11, Color: "Black" },
  { Number: 30, Color: "Red" },
  { Number: 8, Color: "Black" },
  { Number: 23, Color: "Red" },
  { Number: 10, Color: "Black" },
  { Number: 5, Color: "Red" },
  { Number: 24, Color: "Black" },
  { Number: 16, Color: "Red" },
  { Number: 33, Color: "Black" },
  { Number: 1, Color: "Red" },
  { Number: 20, Color: "Black" },
  { Number: 14, Color: "Red" },
  { Number: 31, Color: "Black" },
  { Number: 9, Color: "Red" },
  { Number: 22, Color: "Black" },
  { Number: 18, Color: "Red" },
  { Number: 29, Color: "Black" },
  { Number: 7, Color: "Red" },
  { Number: 28, Color: "Black" },
  { Number: 12, Color: "Red" },
  { Number: 35, Color: "Black" },
  { Number: 3, Color: "Red" },
  { Number: 26, Color: "Black" },
];

let isSoundEnable = false;
let audioVolume = 1;

const spinAuido = new Audio();

const playAudio = (key: string, bool?: boolean) => {
  if (!isSoundEnable) return;
  try {
    if (key === "bet") {
      if (betaudio) {
        const auido = new Audio();
        auido.src = betaudio;
        auido
          .play()
          .then(() => {})
          .catch((error: any) => {
            console.log("Failed to autoplay audio:", error);
          });
      }
    } else if (key === "success") {
      if (successaudio) {
        const auido = new Audio();
        auido.src = loseaudio;
        auido.volume = 0.5;
        auido
          .play()
          .then(() => {})
          .catch((error: any) => {
            console.log("Failed to autoplay audio:", error);
          });
      }
    } else if (key === "spin") {
      if (spinaudio) {
        if (spinAuido.src == "") {
          spinAuido.src = spinaudio;
          spinAuido.loop = false;
          spinAuido.volume = 0.7;
        }
        if (bool) {
          spinAuido
            .play()
            .then(() => {})
            .catch((error: any) => {
              console.log("Failed to autoplay audio:", error);
            });
        } else {
          spinAuido.pause();
        }
      }
    } else if (key === "win") {
      const audio = new Audio();
      audio.src = winaudio;
      audio
        .play()
        .then(() => {})
        .catch((error: any) => {
          console.log("Failed to autoplay audio:", error);
        });
    } else if (key === "loss") {
      const audio = new Audio();
      audio.src = loseaudio;
      audio
        .play()
        .then(() => {})
        .catch((error: any) => {
          console.log("Failed to autoplay audio:", error);
        });
    }
  } catch (error) {
    console.log(error);
  }
};

const RouletteGame = () => {
  const isMobile = useIsMobile();
  const { currency } = useSelector((state) => state.auth);
  const {
    soundVolume,
    showGameAnimation,
    gameHotKeyEnabled,
    showGameInfo,
    showHotkeyPanel,
  } = useSelector((state) => state.setting);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [chipValue, selectChip] = useState<ChipIndex>(0);
  const [outcomeNumber, setOutComeNumber] = useState<number>(-1);
  const [bets, setBets] = useState<
    { placeId: string | number; amount: number }[]
  >([]);
  const [selectHover, setSelectHover] = useState<string | number | null>(null);
  const [totalBet, setTotalBet] = useState(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isWheeling, setIsWheeling] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [clientSeed, setClientSeed] = useState<string>("");
  const [serverSeed, setServerSeed] = useState<string>("");
  const [serverSeedHash, setServerSeedHash] = useState<string>("");

  const [profit, setProfit] = useState<number>(0);
  const [lossAmount, setLossAmount] = useState<number>(0);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);

  const [stopProfitA, setStopPorfitA] = useState<number>(0);
  const [stopLossA, setStopLossA] = useState<number>(0);
  const [sumProfit, setSumProfit] = useState(0);
  const [sumLost, setSumLost] = useState(0);
  const [stoppedAutobet, setStoppedAutobet] = useState(false);
  const [autoBetting, setAutoBetting] = useState(false);
  const [visibleVerify, setVisibleVerify] = useState(false);

  const isAuto = activeTab == 1;

  const disabled = loading || isWheeling || autoBetting;

  const showVerifyView = () => {
    setVisibleVerify(true);
  };

  const handleClickBet = () => {
    if ((disabled && !activeTab) || (!!activeTab && stoppedAutobet)) return;
    if (activeTab === 0) {
      placeBet();
    } else if (autoBetting) {
      setStoppedAutobet(true);
    } else {
      startAutoBet();
    }
  };

  const startBet = async () => {
    setLoading(true);
    setServerSeed("");
    const { data } = await axios.post("/roulette/create", {
      clientSeed: clientSeed,
      bets,
    });
    if (data.status) {
      setClientSeed(data.clientSeed);
      setServerSeedHash(data.serverHash);
    }
    setLoading(false);
  };

  const placeBet = async () => {
    setLoading(true);
    setShowResult(false);
    if (bets.length === 0) {
      toast.error("Please place a bet");
    } else {
      const { data } = await axios.post("/roulette/bet", {
        currency: "",
        bets: bets.map((b) => {
          return { ...b, amount: b.amount / ratio };
        }),
      });
      if (data.status) {
        setIsWheeling(true);
        setOutComeNumber(data.outcome);
        setServerSeedHash(data.serverHash);
        setClientSeed(data.clientSeed);
        setServerSeed(data.serverSeed);
        setProfit(data.profit);
        setLossAmount(data.lossAmount);
        playAudio("bet");
      }
    }
    setLoading(false);
  };

  const startAutoBet = () => {
    if (bets.length) {
      setAutoBetting(true);
      setStoppedAutobet(false);
      if (!autoBetCount) setAutoBetCount(Infinity);
      if (!stopProfitA) setStopPorfitA(Infinity);
      if (!stopLossA) setStopLossA(Infinity);
      setSumProfit(0);
      setSumLost(0);
      placeBet();
    } else {
      toast.warning("Please place a bet");
      setAutoBetting(false);
    }
  };

  useEffect(() => {
    if (showResult && activeTab) {
      let sumP = sumProfit + profit,
        sumL = lossAmount > 0 ? sumLost + lossAmount : sumLost;
      setSumProfit(sumP);
      setSumLost(sumL);
      console.log(
        autoBetCount > 0,
        sumLost < stopLossA,
        sumP < stopProfitA,
        !stoppedAutobet
      );
      if (
        autoBetCount > 0 &&
        sumL < stopLossA &&
        sumP < stopProfitA &&
        !stoppedAutobet
      ) {
        setTimeout(() => {
          setAutoBetCount(autoBetCount - 1);
          if (autoBetCount) {
            placeBet();
          }
          setShowResult(false);
        }, 2500);
      } else {
        setAutoBetting(false);
        setStoppedAutobet(false);
      }
    }
  }, [showResult]);

  const cancelBet = () => {
    if (disabled) return;
    const bet = bets.pop();
    setTotalBet(totalBet - (bet?.amount || 0) / ratio);
    setBets([...bets]);
  };

  const clearBet = () => {
    if (disabled) return;
    setBets([]);
    setTotalBet(0);
  };

  const handleHoverPlace = (id: string | number | null) => {
    if (disabled) return;
    setSelectHover(id);
  };

  const handlePlaceBet = (id: string | number) => {
    if (disabled) return;
    setBets([...bets, { placeId: id, amount: chipValues[chipValue] }]);
    playAudio("bet");
    setTotalBet(totalBet + chipValues[chipValue] / ratio);
  };

  const handleBetCount = (v: number) => {
    setAutoBetCount(v);
  };

  const renderPlace = (position: number, index: number) => {
    const number = isMobile
      ? position + 1 + 12 * index
      : (position + 1) * 3 - 13 * Math.floor(position / 4) + 12 * index;
    let odd = Math.ceil(number / 9) % 2 === 0;
    let color = odd ? (number % 2 ? 0 : 1) : number % 2 ? 1 : 0;
    let origincolor = color;
    if (number === 28 || number === 10) {
      color = 0;
    }
    let hover = false;
    if (selectHover) {
      if (typeof selectHover === "number") {
        hover = number === selectHover;
      } else if (typeof selectHover === "string") {
        if (selectHover.includes("_to_")) {
          let n = selectHover.split("_to_");
          let start = Number(n[0]);
          let end = Number(n[1]);
          hover = start <= number && end >= number;
        } else if (selectHover.includes("Red")) {
          hover = color === 1;
        } else if (selectHover.includes("Black")) {
          hover = color === 0;
        } else if (selectHover.includes("Odd")) {
          if (odd) {
            hover = origincolor === 0;
          } else {
            hover = origincolor === 1;
          }
        } else if (selectHover.includes("Even")) {
          if (odd) {
            hover = origincolor === 1;
          } else {
            hover = origincolor === 0;
          }
        } else if (selectHover.includes("2:1")) {
          const num = selectHover.split(":");
          const s = isMobile ? (number + 2) % 3 : Math.floor(position / 4);
          if (Number(num[2]) == s) {
            hover = true;
          }
        }
      }
    } else if (number === outcomeNumber && showResult) {
      hover = true;
    }

    return (
      <div
        key={position}
        className={`col-span-1 flex items-center cursor-pointer select-none relative justify-center font-bold aspect-[1] rounded border-[1px] border-[#ffffff3d] ${
          color === 0
            ? hover
              ? "bg-[#709cb9]"
              : "bg-[#2f4553]"
            : hover
            ? "bg-[#fa617b]"
            : "bg-[#fe2247]"
        } text-white`}
        onMouseEnter={() => {
          handleHoverPlace(number);
        }}
        onMouseLeave={() => {
          handleHoverPlace(null);
        }}
        onClick={() => handlePlaceBet(number)}
      >
        {number}
        <div className="absolute left-[50%] top-[50%] ">
          {renderChips(number)}
        </div>
      </div>
    );
  };

  const renderPlace2 = (index: number) => {
    const startNumber = 1 + 12 * index;
    const endNumber = 12 + 12 * index;
    const leftId = index === 0 ? "1_to_18" : index === 1 ? "Red" : "Odd";
    const rightId = index === 0 ? "Even" : index === 1 ? "Black" : "19_to_36";
    const centerId = `${startNumber}_to_${endNumber}`;
    return isMobile ? (
      <>
        <div className="w-[50%] flex-col h-full text-white">
          <div
            className={`flex h-[50%] text-sm items-center cursor-pointer text-center justify-center relative select-none font-bold rounded border-[1px] border-[#ffffff3d] ${
              index === 1
                ? leftId === selectHover
                  ? "bg-[#fa617b]"
                  : "bg-[#fe2247]"
                : leftId === selectHover
                ? `bg-[#709cb9]`
                : "bg-[#2f4553]"
            }`}
            onMouseEnter={() => {
              handleHoverPlace(leftId);
            }}
            onMouseLeave={() => {
              handleHoverPlace(null);
            }}
            onClick={() => handlePlaceBet(leftId)}
            style={{ aspectRatio: "1/2" }}
          >
            {leftId.split("_")}
            <div className="absolute left-[50%] top-[50%] ">
              {renderChips(leftId)}
            </div>
          </div>
          <div
            className={`flex h-[50%] text-sm items-center cursor-pointer text-center justify-center relative select-none font-bold rounded border-[1px] border-[#ffffff3d] ${
              rightId === selectHover ? `bg-[#709cb9]` : `bg-[#2f4553]`
            }`}
            onMouseLeave={() => {
              handleHoverPlace(null);
            }}
            onMouseEnter={() => {
              handleHoverPlace(rightId);
            }}
            onClick={() => handlePlaceBet(rightId)}
            style={{ aspectRatio: "1/2" }}
          >
            {rightId.split("_")}
            <div className="absolute left-[50%] top-[50%] ">
              {renderChips(rightId)}
            </div>
          </div>
        </div>
        <div
          className={`w-[50%] text-sm flex h-full items-center cursor-pointer  text-white text-center justify-center relative select-none font-bold rounded border-[1px] border-[#ffffff3d] ${
            centerId === selectHover ? `bg-[#709cb9]` : `bg-[#2f4553]`
          }`}
          onMouseEnter={() => {
            handleHoverPlace(centerId);
          }}
          onMouseLeave={() => {
            handleHoverPlace(null);
          }}
          onClick={() => handlePlaceBet(centerId)}
          style={{ aspectRatio: "1/4" }}
        >
          {startNumber} to {endNumber}
          <div className="absolute left-[50%] top-[50%]">
            {renderChips(centerId)}
          </div>
        </div>
      </>
    ) : (
      <div className="grid grid-cols-2  gap-1 text-white">
        <div
          className={`md:col-span-2 col-span-1 flex items-center cursor-pointer justify-center relative select-none font-bold rounded border-[1px] border-[#ffffff3d] ${
            centerId === selectHover ? `bg-[#709cb9]` : `bg-[#2f4553]`
          }`}
          onMouseEnter={() => {
            handleHoverPlace(centerId);
          }}
          onMouseLeave={() => {
            handleHoverPlace(null);
          }}
          onClick={() => handlePlaceBet(centerId)}
          style={{ aspectRatio: isMobile ? "1/2" : "4/1" }}
        >
          {startNumber} to {endNumber}
          <div className="absolute left-[50%] top-[50%] ">
            {renderChips(centerId)}
          </div>
        </div>
        <div
          className={`col-span-1 flex items-center cursor-pointer justify-center relative select-none font-bold rounded border-[1px] border-[#ffffff3d] ${
            index === 1
              ? leftId === selectHover
                ? "bg-[#fa617b]"
                : "bg-[#fe2247]"
              : leftId === selectHover
              ? `bg-[#709cb9]`
              : "bg-[#2f4553]"
          }`}
          onMouseEnter={() => {
            handleHoverPlace(leftId);
          }}
          onMouseLeave={() => {
            handleHoverPlace(null);
          }}
          onClick={() => handlePlaceBet(leftId)}
          style={{ aspectRatio: isMobile ? "1/1" : "2/1" }}
        >
          {leftId.split("_")}
          <div className="absolute left-[50%] top-[50%] ">
            {renderChips(leftId)}
          </div>
        </div>
        <div
          className={`col-span-1 flex items-center cursor-pointer justify-center relative select-none font-bold rounded border-[1px] border-[#ffffff3d] ${
            rightId === selectHover ? `bg-[#709cb9]` : `bg-[#2f4553]`
          }`}
          onMouseLeave={() => {
            handleHoverPlace(null);
          }}
          onMouseEnter={() => {
            handleHoverPlace(rightId);
          }}
          onClick={() => handlePlaceBet(rightId)}
          style={{ aspectRatio: isMobile ? "1/1" : "2/1" }}
        >
          {rightId.split("_")}
          <div className="absolute left-[50%] top-[50%] ">
            {renderChips(rightId)}
          </div>
        </div>
      </div>
    );
  };

  const renderChips = (placeId: string | number) => {
    let value = 0;
    for (let bet of bets.filter((b) => b.placeId === placeId)) {
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
      if (value < 100) return "#5176a7";
      if (value < 1000) return "#2679e7";
      if (value < 10000) return "#8a5bed";
      if (value < 100000) return "#51e4ed";
      if (value < 1000000) return "#ed5151 ";
      if (value < 10000000) return "#CD7F32";
      return "#e7c651";
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
                top: `${-1 * index2 * (index1 + 1)}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: `url(${chipBoard})`,
                aspectRatio: "1",
                width: isMobile ? "35px" : "40px",
                minWidth: isMobile ? "35px" : "40px",
                fontSize: isMobile ? "10px" : "12px",
                backgroundColor: color,
                borderRadius: "50%",
                color: "#ffff",
                fontWeight: "bold",
                userSelect: "none",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)",
                outline: "2px solid rgba(0, 0, 0, 0.3)",
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
  };

  const renderPlacePanel = () => {
    return isMobile ? (
      <div
        className={`flex flex-col justify-end w-full ${
          disabled ? "opacity-70" : "opacity-100"
        }`}
      >
        <div className="h-[7.08%] flex justify-end">
          <div
            className={`flex w-[60%] justify-center h-full aspect-[4/1] items-center select-none border-[1px] relative rounded ${
              selectHover === 0 || (outcomeNumber === 0 && showResult)
                ? "bg-green-200"
                : `bg-green-500`
            } text-white font-bold`}
            onMouseLeave={() => {
              handleHoverPlace(null);
            }}
            onMouseEnter={() => {
              handleHoverPlace(0);
            }}
            onClick={() => handlePlaceBet(0)}
          >
            0
            <div className="absolute left-[50%] top-[50%] ">
              {renderChips(0)}
            </div>
          </div>
        </div>
        {[...Array(3)].map((_, index) => {
          return (
            <div key={index} className="flex flex-col h-[28.4%] w-full">
              <div className="flex justify-end h-full">
                <div className="w-[40%] h-full flex">{renderPlace2(index)}</div>
                <div className="w-[60%] grid grid-cols-3 h-full">
                  {[...Array(12)].map((_, index1) => {
                    return renderPlace(index1, index);
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-[6.8%]">
          <div className="flex justify-end">
            {[...Array(3)].map((_, index) => {
              let id = `2:1:${index}`;
              return (
                <div
                  key={index}
                  onMouseLeave={() => {
                    handleHoverPlace(null);
                  }}
                  onMouseEnter={() => {
                    handleHoverPlace(id);
                  }}
                  onClick={() => handlePlaceBet(id)}
                  className={`w-[20%] flex items-center select-none cursor-pointer relative justify-center font-bold aspect-[1] rounded ${
                    id === selectHover ? "bg-[#709cb9]" : "bg-[#00000094]"
                  }  border-[1px] border-[#424242] text-white`}
                >
                  2:1
                  <div className="absolute left-[50%] top-[50%] ">
                    {renderChips(id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ) : (
      <div
        className={`flex w-[80%] space-x-1 ${
          disabled ? "opacity-70" : "opacity-100"
        }`}
      >
        <div className="w-[7.08%] h-full">
          <div
            className={`flex justify-center w-full cursor-pointer aspect-[1/3] items-center select-none border-[1px] relative rounded ${
              selectHover === 0 || (outcomeNumber === 0 && showResult)
                ? "bg-green-200"
                : `bg-green-500`
            } text-white font-bold`}
            onMouseLeave={() => {
              handleHoverPlace(null);
            }}
            onMouseEnter={() => {
              handleHoverPlace(0);
            }}
            onClick={() => handlePlaceBet(0)}
          >
            0
            <div className="absolute left-[50%] top-[50%] ">
              {renderChips(0)}
            </div>
          </div>
        </div>
        {[...Array(3)].map((_, index) => {
          return (
            <div key={index} className="flex flex-col w-[28.4%]  space-y-1">
              <div className="grid grid-cols-4 gap-1">
                {[...Array(12)].map((_, index1) => {
                  return renderPlace(index1, index);
                })}
              </div>
              {renderPlace2(index)}
            </div>
          );
        })}
        <div className="w-[6.8%]">
          <div className="grid grid-cols-1 gap-1">
            {[...Array(3)].map((_, index) => {
              let id = `2:1:${index}`;
              return (
                <div
                  key={index}
                  onMouseLeave={() => {
                    handleHoverPlace(null);
                  }}
                  onMouseEnter={() => {
                    handleHoverPlace(id);
                  }}
                  onClick={() => handlePlaceBet(id)}
                  className={`col-span-1 flex items-center select-none cursor-pointer relative justify-center font-bold aspect-[1] rounded ${
                    id === selectHover ? "bg-[#709cb9]" : "bg-[#00000094]"
                  }  border-[1px] border-[#424242] text-white`}
                >
                  2:1
                  <div className="absolute left-[50%] top-[50%] ">
                    {renderChips(id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (showResult) {
      startBet();
      playAudio("win");
      setTimeout(() => {
        setIsWheeling(false);
      }, 3000);
    }
  }, [showResult]);

  useEffect(() => {
    isSoundEnable = true;
    startBet();
  }, []);

  useEffect(() => {
    audioVolume = soundVolume;
  }, [soundVolume]);

  return (
    <div className="flex w-full justify-center mt-5 items-center flex-col">
      <div
        className={`${
          isMobile
            ? "flex flex-col  items-center max-w-[400px]"
            : "flex  max-w-[1300px]"
        } bg-[#0f212e] w-full rounded-md overflow-hidden`}
      >
        {!isMobile && (
          <div className={`w-[300px]  bg-[#213743] p-2`}>
            <div className="flex flex-col">
              <SwitchTab
                active={activeTab}
                onChange={setActiveTab}
                disabled={disabled}
              />
              <div className="text-white text-sm mt-3 flex items-center">
                <div>Chip Value {chipValues[chipValue] / ratio}</div>
                <div className="ml-2 w-4 h-4">
                  <CurrencyIcon />
                </div>
              </div>
              <ChipButtonGroup
                onChooseChip={(v) => {
                  !disabled && selectChip(v as ChipIndex);
                }}
                selected={chipValue}
                chipValues={chipValues}
              />
              <AmountInput
                value={totalBet}
                onChange={(v: number) => {}}
                disabled={true}
                label="Total Bet"
                amount={0}
              />
              {isAuto && (
                <>
                  <BetNumberInput
                    value={autoBetCount === Infinity ? 0 : autoBetCount}
                    disabled={disabled}
                    onChange={(v) => {
                      setAutoBetCount(v);
                    }}
                  />
                  <StopProfitAmount
                    disabled={disabled}
                    Label={"Stop on Profit"}
                    onChange={setStopPorfitA}
                    value={stopProfitA === Infinity ? 0 : stopProfitA}
                    Icon={<CurrencyIcon />}
                  />
                  <StopProfitAmount
                    disabled={disabled}
                    Label={"Stop on Loss"}
                    onChange={setStopLossA}
                    value={stopLossA === Infinity ? 0 : stopLossA}
                    Icon={<CurrencyIcon />}
                  />
                </>
              )}
              <Button
                onClick={handleClickBet}
                disabled={
                  (disabled && !activeTab) || (!!activeTab && stoppedAutobet)
                }
              >
                {activeTab === 0
                  ? "Bet"
                  : autoBetting
                  ? "Stop AutoBet"
                  : "Start AutoBet"}
              </Button>
            </div>
          </div>
        )}
        <div
          className={`${
            isMobile ? "min-w-[350px] w-full" : "w-full  p-5"
          } mx-auto relative`}
        >
          <div className="flex flex-col w-full h-full">
            {!isMobile && (
              <div className="flex justify-center p-2 w-full">
                <div
                  className=" md:w-[30%] w-[60%] relative"
                  style={{
                    aspectRatio: "1/1",
                    background:
                      "linear-gradient(#0c3a6d 0%, rgba(49, 93, 207, 0) 100%)",
                    borderRadius: "50% 50% 0 0",
                  }}
                >
                  <RouletteCanvas
                    outcomeNumber={outcomeNumber}
                    onAnimationEnd={() => {
                      setShowResult(true);
                    }}
                  />
                  <div
                    className={`absolute transition-opacity ${
                      showResult ? "opacity-95" : "opacity-0"
                    } duration-300 ease-out top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-[50%] aspect-square rounded-full bg-gradient-to-r ${
                      rouletteWheelNumbers.find(
                        (n) => n.Number == outcomeNumber
                      )?.Color == "Red"
                        ? "from-red-600 via-[#e79494] to-red-600"
                        : rouletteWheelNumbers.find(
                            (n) => n.Number == outcomeNumber
                          )?.Color == "Black"
                        ? "from-gray-800 via-gray-600 to-gray-800"
                        : "from-[#00ff15] via-[#92f09a] to-[#00ff15]"
                    } shadow-lg`}
                  >
                    <div className="text-white text-4xl font-bold">
                      {outcomeNumber}
                    </div>
                    <div className="text-white text-sm mt-2 uppercase">
                      {
                        rouletteWheelNumbers.find(
                          (n) => n.Number == outcomeNumber
                        )?.Color
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex w-full justify-end relative">
              {isMobile && (
                <div
                  className={`${
                    !isWheeling && !autoBetting
                      ? "w-[35%] left-[20%] top-[20%]"
                      : "w-[80%] left-[50%] top-[50%]"
                  } absolute  -translate-y-1/2 -translate-x-1/2  z-20  transition-all duration-300 aspect-square `}
                  style={{ aspectRatio: "1/1", borderRadius: "50% 50% 0 0" }}
                >
                  <RouletteCanvas
                    outcomeNumber={outcomeNumber}
                    onAnimationEnd={() => setShowResult(true)}
                  />
                  <div
                    className={`absolute transition-opacity ${
                      showResult && isWheeling ? "opacity-95" : "opacity-0"
                    } duration-300 ease-out top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-[50%] aspect-[1/1] rounded-full bg-gradient-to-r ${
                      rouletteWheelNumbers.find(
                        (n) => n.Number == outcomeNumber
                      )?.Color == "Red"
                        ? "from-red-600 via-[#e79494] to-red-600"
                        : rouletteWheelNumbers.find(
                            (n) => n.Number == outcomeNumber
                          )?.Color == "Black"
                        ? "from-gray-800 via-gray-600 to-gray-800"
                        : "from-[#00ff15] via-[#92f09a] to-[#00ff15]"
                    } shadow-lg`}
                  >
                    <div className="text-white text-4xl font-bold">
                      {outcomeNumber}
                    </div>
                    <div className="text-white text-sm mt-2 uppercase">
                      {
                        rouletteWheelNumbers.find(
                          (n) => n.Number == outcomeNumber
                        )?.Color
                      }
                    </div>
                  </div>
                </div>
              )}
              <div className="md:bg-gray-900 p-4 rounded-lg md:w-full w-[60%]">
                <div className="flex justify-center w-full">
                  {renderPlacePanel()}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    className="h-5 fill-white flex text-white font-bold items-center"
                    onClick={cancelBet}
                  >
                    <div className="w-6 px-1">
                      <svg viewBox="0 0 64 64">
                        <path d="M37.973 11.947H16.24l5.84-5.84L15.973 0 .053 15.92l15.92 15.92 6.107-6.107-5.76-5.76h21.653C47.92 19.973 56 28.053 56 38c0 9.947-8.08 18.027-18.027 18.027h-21.76v8h21.76C52.347 64.027 64 52.373 64 38c0-14.373-11.653-26.027-26.027-26.027v-.026Z"></path>
                      </svg>
                    </div>
                    <div>Undo</div>
                  </button>
                  <button
                    className="h-5 fill-white flex text-white font-bold items-center"
                    onClick={clearBet}
                  >
                    <div>Clear</div>
                    <div className="w-6 px-1">
                      <svg viewBox="0 0 64 64">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M31.943 13.08c-9.37 0-17.128 6.904-18.476 16.004l4.798-.002-9.146 12.96-9.12-12.96h5.334l.012-.124C6.889 15.536 18.291 5.112 32.127 5.112a26.823 26.823 0 0 1 17.5 6.452l-5.334 6.186.02.018a18.584 18.584 0 0 0-12.37-4.688Zm22.937 8.752L64 34.792h-5.174l-.01.12C57.332 48.398 45.902 58.888 32.02 58.888a26.826 26.826 0 0 1-17.646-6.576l5.334-6.186a18.597 18.597 0 0 0 12.47 4.776c9.406 0 17.188-6.96 18.49-16.11h-4.934l9.146-12.96ZM19.708 46.126l-.016-.014.016.014Z"
                        ></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ResultModal
            visible={showResult}
            totalBetAmount={totalBet}
            profitAmount={profit}
            lossAmount={lossAmount}
            onClose={() => {
              setShowResult(false);
              if (!autoBetting) clearBet();
            }}
          />
        </div>
        {isMobile && (
          <div className={`md:w-[300px] w-full bg-[#213743] p-2`}>
            <div className="flex flex-col">
              <div className="text-white text-sm mt-3 flex items-center">
                <div>Chip Value {chipValues[chipValue] / ratio}</div>
                <div className="ml-2 w-4 h-4">
                  <CurrencyIcon />
                </div>
              </div>
              <ChipButtonGroup
                onChooseChip={(v) => {
                  !disabled && selectChip(v as ChipIndex);
                }}
                selected={chipValue}
                chipValues={chipValues}
              />
              <Button
                onClick={handleClickBet}
                disabled={
                  (disabled && !activeTab) || (!!activeTab && stoppedAutobet)
                }
              >
                {activeTab === 0
                  ? "Bet"
                  : autoBetting
                  ? "Stop AutoBet"
                  : "Start AutoBet"}
              </Button>
              <AmountInput
                value={totalBet / ratio}
                onChange={(v: number) => {}}
                disabled={true}
                label="Total Bet"
                amount={0}
              />
              {isAuto && (
                <>
                  <BetNumberInput
                    value={autoBetCount === Infinity ? 0 : autoBetCount}
                    disabled={disabled}
                    onChange={(v) => {
                      setAutoBetCount(v);
                    }}
                  />
                  <StopProfitAmount
                    disabled={disabled}
                    Label={"Stop on Profit"}
                    onChange={setStopPorfitA}
                    value={stopProfitA === Infinity ? 0 : stopProfitA}
                    Icon={<CurrencyIcon />}
                  />
                  <StopProfitAmount
                    disabled={disabled}
                    Label={"Stop on Loss"}
                    onChange={setStopLossA}
                    value={stopLossA === Infinity ? 0 : stopLossA}
                    Icon={<CurrencyIcon />}
                  />
                </>
              )}
              <SwitchTab
                active={activeTab}
                onChange={setActiveTab}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
      <div
        className={`flex  w-full ${
          isMobile ? "max-w-[400px] flex-col" : "max-w-[1300px]"
        }`}
      >
        <SettingBar
          maxBetDisable={true}
          fairness={
            <FairnessView
              gameId={"roulette"}
              privateSeed={serverSeed}
              privateHash={serverSeedHash}
              publicSeed={clientSeed}
              prev={true}
            >
              <div className="text-white">Fairness</div>
            </FairnessView>
          }
        />
      </div>
    </div>
  );
};

export default RouletteGame;

class GameEngine {
  sectorAngle = 360 / 37;
  width: number = 400;
  height: number = 400;
  canvas: HTMLCanvasElement | null = null;
  radius: number = 200;
  wheelAngle: number = 0;
  ballAngle: number = 0;
  ballSpeed: number = 15;
  wheelSpeed: number = 0.5; // Initial wheel speed
  maxSpeed: number = 4; // Maximum speed when starting a new round
  normalSpeed: number = 0.5; // Normal rotation speed for the wheel
  acceleration: number = 0.05; // Speed increment for acceleration
  outcomeNumber = 0;
  targetBallAngle: number = 0;
  ballRadius: number = 190;
  currentBallRaidus: number = 190;
  ctx: CanvasRenderingContext2D | null = null;
  timer: any;
  state: 0 | 1 | 2 = 0; // 0: idle, 1: running, 2: round ended
  onAnimationEnd: Function | null = null;
  contain: HTMLElement | null = null;
  constructor() {
    this.timer = setInterval(() => {
      if (this.contain && this.canvas) {
        this.width = this.contain.offsetWidth;
        this.height = this.contain.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.radius = this.contain.offsetWidth / 2;
        if (this.ballRadius !== this.radius * 0.8) {
          this.ballRadius = this.radius * 0.8;
          this.currentBallRaidus = this.radius * 0.8;
        }
      }
      this.animate();
    }, 1000 / 60);
  }

  setCanvas(contain: HTMLElement, canvas: HTMLCanvasElement) {
    this.contain = contain;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = contain.offsetWidth;
    this.height = contain.offsetHeight;
    canvas.width = this.width;
    canvas.height = this.height;
    this.radius = contain.offsetWidth / 2;
    this.ballRadius = this.radius * 0.8;
    this.currentBallRaidus = this.radius * 0.8;
  }

  setOutComeNumber(outcomeNumber: number) {
    if (this.state !== 1) {
      this.outcomeNumber = outcomeNumber;
      this.state = 1;
      this.ballSpeed = 15;
      this.ballRadius = this.radius * 0.8;
      this.currentBallRaidus = this.radius * 0.8;
      this.wheelSpeed = this.normalSpeed;
      this.ballAngle = 0;
      this.targetBallAngle = this.getBallTargetAngle(outcomeNumber);
      playAudio("spin", true);
    }
  }

  getWheelIndex(outcomeNumber: number) {
    return rouletteWheelNumbers.findIndex((n) => n.Number === outcomeNumber);
  }

  getBallTargetAngle(outcomeNumber: number) {
    const index = this.getWheelIndex(outcomeNumber);
    return index * this.sectorAngle;
  }

  drawWheel(angle: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.drawImage(
      WheelImg,
      -this.radius,
      -this.radius,
      this.radius * 2,
      this.radius * 2
    );
    ctx.stroke();
    ctx.restore();
  }

  drawBall(angle: number) {
    const ctx = this.ctx;
    if (!ctx) return false;
    this.currentBallRaidus -=
      this.state === 2 && this.currentBallRaidus > this.radius * 0.6 ? 3 : 0;
    const ballX =
      this.width / 2 +
      this.currentBallRaidus * Math.cos((angle * Math.PI) / 180);
    const ballY =
      this.height / 2 +
      this.currentBallRaidus * Math.sin((angle * Math.PI) / 180);

    const gradient = ctx.createRadialGradient(
      ballX,
      ballY,
      this.radius * 0.04 * 0.1,
      ballX,
      ballY,
      this.radius * 0.04
    );

    // Define gradient colors (from center to edge)
    gradient.addColorStop(0, "white"); // Center of the ball
    gradient.addColorStop(1, "gray"); // Edge of the ball

    ctx.beginPath();
    ctx.arc(ballX, ballY, this.radius * 0.04, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  drawWheelAndBall() {
    if (this.state !== 0) {
      if (this.ballSpeed > 1) {
        this.ballAngle = (this.ballAngle + this.ballSpeed) % 360;
        this.ballSpeed *= 0.99;
      } else {
        let delta = (this.targetBallAngle - this.ballAngle + 270) % 360;

        if (delta > 1) {
          this.ballAngle += Math.min(delta, this.ballSpeed);
          this.ballAngle = this.ballAngle % 360;
        } else if (this.state !== 2) {
          this.state = 2;
          this.ballSpeed = 0;
          if (this.onAnimationEnd) {
            this.onAnimationEnd();
            playAudio("spin", false);
          }
        }
      }
    }
    this.wheelAngle = (this.wheelAngle + this.wheelSpeed) % 360;
    this.ctx?.clearRect(0, 0, this.width, this.height);
    const relativeAngle = (this.ballAngle + this.wheelAngle + 360) % 360;

    this.drawWheel(this.wheelAngle);
    if (this.state !== 0) {
      this.drawBall(relativeAngle);
    }
  }

  animate() {
    this.drawWheelAndBall();
  }
}

(window as any).rouletteGame = new GameEngine();

export const RouletteCanvas = ({
  outcomeNumber,
  onAnimationEnd,
}: {
  outcomeNumber: number;
  onAnimationEnd: () => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | any>(null);
  const containRef = useRef<HTMLElement | any>(null);

  useEffect(() => {
    const setCanvas = () => {
      if (canvasRef.current)
        (window as any).rouletteGame.setCanvas(
          containRef.current,
          canvasRef.current
        );
    };
    window.onresize = () => {
      setCanvas();
    };

    (containRef.current as HTMLElement)?.addEventListener("resize", setCanvas);

    setCanvas();

    return () => {
      (containRef.current as HTMLElement)?.removeEventListener(
        "resize",
        setCanvas
      );
    };
  }, []);

  useEffect(() => {
    if (outcomeNumber !== -1) {
      (window as any).rouletteGame.setOutComeNumber(outcomeNumber);
      (window as any).rouletteGame.onAnimationEnd = onAnimationEnd;
    }
  }, [outcomeNumber]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={containRef}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

const ResultModal = ({
  visible,
  totalBetAmount,
  profitAmount,
  lossAmount,
  onClose,
}: {
  visible?: boolean;
  totalBetAmount: number;
  profitAmount: number;
  lossAmount: number;
  onClose: () => void;
}) => {
  return visible ? (
    <div
      onClick={onClose}
      className="top-0 left-0 absolute w-full h-full z-40 bg-[#00000048] flex justify-center items-center"
    >
      <div
        className="relative animate-zoomIn w-[60%] md:w-[30%] min-h-40 border-2 rounded-md border-[#36e95d] bg-[#0a0a0aaf] flex-col justify-around flex "
        style={{
          boxShadow:
            "0 0px 15px 3px rgb(0 188 15 / 73%), 0 4px 6px -4px rgb(86 252 26 / 75%)",
        }}
      >
        <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
          <div>Total Bet</div>
          <div className="flex justify-end items-center">
            <div>{totalBetAmount.toFixed(6)}</div>
            <div className="w-5 h-5 ml-1">
              <CurrencyIcon />
            </div>
          </div>
        </div>
        <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
          <div>Profit Amount</div>
          <div className="flex justify-end items-center">
            <div>{profitAmount.toFixed(6)}</div>
            <div className="w-5 h-5 ml-1">
              <CurrencyIcon />
            </div>
          </div>
        </div>
        <div className="flex text-white text-sm p-2 items-center justify-around font-bold">
          <div>Lost amount</div>
          <div className="flex justify-end items-center">
            <div>{lossAmount.toFixed(6)}</div>
            <div className="w-5 h-5 ml-1">
              <CurrencyIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
