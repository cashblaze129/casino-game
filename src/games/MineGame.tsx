import React, { useEffect, useRef, useState } from "react";
import {
  BombSvg,
  EthSvg,
  ExpolitionBombSvg,
  InfinitySvg,
  JewlSvg,
  PercentSvg,
} from "../components/svgs";
import mineEffect from "../assets/img/mineEffect.webp";
import axios from "../utils/axios";
import { GAME_STATUS, MINE_OBJECT, MineArea, MineButtonProps, MineModalPropsType } from "../types";
import useIsMobile from "../hooks/useIsMobile";
import SwitchTab from "../components/SwitchTab";
import AmountInput from "../components/AmountInput";
import ProfitAmount from "../components/ProfitAmount";
import BetNumberInput from "../components/BetNumberInput";
export const MINE_API = "/mine";

const SelectedPaymentIcon = () => <EthSvg />;

const MineButton = ({ point, mine, isAuto, onClick }: MineButtonProps) => {
  const handleClick = () => {
    onClick(point);
  };

  const renderMineContent = (mine: MineArea | undefined) => {
    if (!mine?.mined) return null;

    const isGem = mine.mine === MINE_OBJECT.GEM;
    const isBomb = mine.mine === MINE_OBJECT.BOMB;

    if (isGem) {
      return (
        <div className="animate-bounding">
          <JewlSvg />
        </div>
      );
    }

    if (isBomb) {
      return (
        <div className="animate-bounding relative">
          <img
            src={mineEffect}
            className="z-10 absolute inset-0 w-full h-full"
          />
          <ExpolitionBombSvg />
        </div>
      );
    }

    return null;
  };

  const renderHiddenMineContent = (mine: MineArea | undefined) => {
    if (mine?.mined) return null;

    const isGem = mine?.mine === MINE_OBJECT.GEM;
    const isBomb = mine?.mine === MINE_OBJECT.BOMB;

    if (isGem) {
      return (
        <div className="animate-bounding opacity-40 p-2">
          <JewlSvg />
        </div>
      );
    }

    if (isBomb) {
      return (
        <div className="animate-bounding opacity-40 p-2">
          <ExpolitionBombSvg />
        </div>
      );
    }

    return null;
  };

  const svgContent = renderMineContent(mine) ||
    renderHiddenMineContent(mine) || (
      <div className="w-full relative pb-full" />
    );

  return (
    <button
      className={
        mine?.mine
          ? `p-2 w-full h-full rounded-lg aspect-square bg-[#071824] ${isAuto && "border-[5px] border-[#9000ff]"
          }`
          : mine
            ? `p-2 animate-bounding1 w-full h-full rounded-lg aspect-square ${isAuto ? "bg-[#9000ff]" : "bg-[#2f4553]"
            }`
            : `p-2 w-full h-full rounded-lg aspect-square ${isAuto ? "bg-[#9000ff]" : "bg-[#2f4553]"
            }`
      }
      onClick={handleClick}
    >
      {svgContent}
    </button>
  );
};

const MineModal = ({ visible, data }: MineModalPropsType) => {
  if (!visible) return <></>;
  return (
    <div className="absolute left-1/2 top-1/2 opacity-90 z-10">
      <div className="w-36 h-28 absolute left-[-4.5rem] top-[-3rem] pb-3 rounded-md bg-[#1a2c38] text-sm shadow-md border-4 border-[#00e701] text-center animate-zoomIn">
        <div className="flex flex-col items-center p-4">
          <div className="text-[#00e701] font-bold text-4xl leading-[1.5]">
            {data.odds.toFixed(2)}×
          </div>
          <div className="inline-flex items-center">
            <div className="text-[#00e701] font-bold whitespace-nowrap tabular-nums">
              {data.profit.toFixed(8)}
            </div>
            <div className="w-[20px] px-1">
              <SelectedPaymentIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MineCustomInput = ({
  disabled,
  onChange,
  value,
  label,
}: {
  disabled: boolean;
  onChange: (e: number) => void;
  value: number;
  label: string;
}) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [inputValue, seInputValue] = useState(value);
  const handleChange = (v: number) => {
    seInputValue(v);
  };

  useEffect(() => {
    if (!visible) onChange(0);
    else onChange(inputValue);
  }, [visible, inputValue]);
  return (
    <div className="mt-2 flex flex-col">
      {label && (
        <p className={`text-sm ${disabled ? "text-[#879097]" : "text-white"}`}>
          {label}
        </p>
      )}
      <div className="flex bg-[#2f4553] rounded overflow-hidden p-[1px]">
        <button
          className={`px-2 text-[#879097] focus:outline-none rounded-md text-[.75rem] hover:bg-[#557086] ${visible == false && "bg-[#0f212e]"
            }`}
          onClick={() => !disabled && setVisible(false)}
        >
          Rest
        </button>
        <button
          onClick={() => !disabled && setVisible(true)}
          className={`px-2 text-[#879097] focus:outline-none  rounded-md text-[.75rem] text-nowrap hover:bg-[#557086] ${visible && "bg-[#0f212e]"
            }`}
        >
          Increase By:
        </button>
        <div
          className={`flex ${!visible || disabled ? "bg-[#172c38]" : "bg-[#0f212e]"
            } border-[2px] border-[#2f4553] hover:border-[#557086] w-full rounded`}
        >
          <input
            type="number"
            value={visible ? inputValue : value}
            min={0}
            disabled={disabled || !visible}
            onChange={(e) => handleChange(Number(e.target.value))}
            className=" px-3 py-1 text-white bg-[#0f212e00] w-[80%] focus:outline-none"
          />
          <div className="flex items-center justify-center pl-2 pr-1.5 w-[35px] ">
            <PercentSvg />
          </div>
        </div>
      </div>
    </div>
  );
};
const MineGame: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState(0); // 0 for Manual, 1 for Auto
  const [mineCount, setMineCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [status, setStatus] = useState<GAME_STATUS>(GAME_STATUS.READY);
  const [loading, setLoading] = useState(false);
  const [mineAreas, setMineAreas] = useState<MineArea[]>([]);
  const [autoAreas, setAutoAreas] = useState<MineArea[]>([]);

  const statusRef = useRef<any>();
  const [resultVisible, setResultVisible] = useState(false);
  const [autoBetCount, setAutoBetCount] = useState(0);
  const [isInfinity, setInfinity] = useState(false);
  const [stopProfitA, setStopProfitA] = useState(0);
  const [stopLossA, setStopLossA] = useState(0);
  const [onWinP, setOnWinP] = useState(0);
  const [onLossP, setOnLossP] = useState(0);
  const [areaFlag, setAreaFlag] = useState(true);

  const [totalProfit, setProfitA] = useState<number>(0);
  const [totalLoss, setLossA] = useState<number>(0);

  const [result, setResult] = useState({
    odds: 0,
    profit: 0,
  });
  const profitAndOdds = calculateMinesGame(
    mineCount,
    mineAreas.length,
    betAmount
  );
  const resetGame = () => {
    setResultVisible(false);
    setMineAreas([]);
    setStatus(GAME_STATUS.READY);
    setLoading(false);
  };

  const handleApiError = (point?: number) => {
    if (point !== undefined) {
      setMineAreas(mineAreas.filter((m) => m.point !== point));
    }
    setLoading(false);
  };

  const checkActiveGame = async () => {
    try {
      const { data } = await axios.post(`${MINE_API}/status`);
      if (data.success) {
        const { datas, amount, mines } = data;
        setStatus(GAME_STATUS.LIVE);
        setMineAreas(datas);
        setBetAmount(amount);
        setMineCount(mines);
      }
    } catch (error) {
      handleApiError();
    }
  };

  const createBet = async () => {
    if (loading) return;
    resetGame();
    setLoading(true);
    try {
      const { data } = await axios.post(`${MINE_API}/create`, {
        mines: mineCount,
        amount: betAmount,
      });
      data.status === "BET" ? setStatus(GAME_STATUS.LIVE) : checkActiveGame();
    } catch (error) {
      handleApiError();
    }
    setLoading(false);
  };

  const selectArea = async (point: number) => {
    if (GAME_STATUS.LIVE === status) return;
    const autoIndex = autoAreas.findIndex((m: MineArea) => m.point === point);
    if (autoIndex === -1) {
      setAutoAreas((prev) => [...prev, { point, mine: null, mined: false }]);
    } else {
      setAutoAreas([
        ...autoAreas.filter(
          (m: MineArea, index: number) => index !== autoIndex
        ),
      ]);
    }
  };

  const placeBet = async (point: number) => {
    if (GAME_STATUS.READY === status) return;
    const mine = mineAreas.find((m: MineArea) => m.point === point);
    if (mine) return;

    setLoading(true);

    setMineAreas((prev) => [...prev, { point, mine: null, mined: false }]);

    try {
      const { data } = await axios.post(`${MINE_API}/bet`, { point });
      if (data.status === "BET") {
        setMineAreas((prev) =>
          prev.map((m) =>
            m.point === point ? { ...m, mine: MINE_OBJECT.GEM, mined: true } : m
          )
        );
      } else if (data.status === "END") {
        if (
          data.datas.findIndex(
            (m: any) => !m.mined || m.mine == MINE_OBJECT.BOMB
          ) == -1
        ) {
          console.log(data.datas);
          setResult({
            odds: profitAndOdds.probability,
            profit: profitAndOdds.roundedWinAmount,
          });
          setResultVisible(true);
        }
        setMineAreas(data.datas);
        setStatus(GAME_STATUS.READY);
      } else {
        checkActiveGame();
      }
    } catch (error) {
      handleApiError(point);
    }
    setLoading(false);
  };

  const cashout = async () => {
    if (status !== GAME_STATUS.LIVE || loading || mineAreas.length === 0)
      return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${MINE_API}/cashout`);
      if (data.status === "END") {
        setResult({
          odds: profitAndOdds.probability,
          profit: profitAndOdds.roundedWinAmount,
        });
        setMineAreas(data.datas);
        setStatus(GAME_STATUS.READY);
        setResultVisible(true);
      } else checkActiveGame();
    } catch (error) { }
    setLoading(false);
  };

  const randomBet = async () => {
    const excludeArray = mineAreas.map((m) => m.point);
    const allNumbers: number[] = Array.from({ length: 25 }, (_, i) => i); // Creates an array [0, 1, 2, ..., 24]
    const availableNumbers = allNumbers.filter(
      (num) => !excludeArray.includes(num)
    ); // Exclude numbers

    if (availableNumbers.length === 0) {
      throw new Error("No available numbers to choose from");
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    placeBet(availableNumbers[randomIndex]);
  };

  const handleAmountChange = (amount: number) => {
    if (status === GAME_STATUS.READY) {
      setBetAmount(amount);
    }
  };

  const handleTabChange = (s: number) => {
    if (status === GAME_STATUS.READY) {
      setActiveTab(s);
      resetGame();
    }
  };

  const handleBetCount = (value: number) => {
    const count = value;
    if (count >= 0) {
      setAutoBetCount(value);
    }
    setInfinity(count === 0);
  };

  useEffect(() => {
    checkActiveGame();
  }, []);

  //------------------- auto -----------------------//

  // Function to start auto betting
  const autoBet = () => {
    if (loading) return;
    setLoading(true);
    setInfinity(autoBetCount === 0);
    setStatus(GAME_STATUS.LIVE);
  };

  // Function to stop auto betting
  const stopBet = () => {
    setLoading(false);
    setStatus(GAME_STATUS.READY);
  };

  // Function to handle the betting loop
  const runTimeBet = async () => {
    if (statusRef.current == GAME_STATUS.READY) return;

    setMineAreas([...autoAreas]);

    try {
      const { data } = await axios.post(`${MINE_API}/autobet`, {
        points: autoAreas.map((a) => a.point),
        mines: mineCount,
        amount: betAmount,
      });

      if (data.status == "END") {
        let minedBombIndex = data.datas.findIndex(
          (m: any) => m.mined && m.mine == MINE_OBJECT.BOMB
        );
        if (minedBombIndex == -1) {
          const _profitAndOdds = calculateMinesGame(
            mineCount,
            autoAreas.length,
            1
          );

          setResult({
            odds: _profitAndOdds.probability,
            profit: _profitAndOdds.roundedWinAmount,
          });
          setResultVisible(true);
          if (stopProfitA !== 0) {
            setProfitA((prevCount) => {
              if (prevCount + betAmount >= stopProfitA) {
                stopBet();
                return 0;
              }
              return prevCount + betAmount;
            });
          }
        } else {
          if (stopLossA !== 0) {
            setLossA((prevCount) => {
              if (prevCount + betAmount >= stopLossA) {
                stopBet();
                return 0;
              }
              return prevCount + betAmount;
            });
          }
        }
        setMineAreas(data.datas);
      } else {
        stopBet();
      }
    } catch (error) {
      stopBet(); // Stop betting if the conditions aren't met
    }

    if (isInfinity) {
      setTimeout(() => {
        setResultVisible(false);
        setMineAreas([]);
        setTimeout(() => {
          runTimeBet();
        }, 1000);
      }, 1500);
    } else if (autoBetCount > 0) {
      setTimeout(() => {
        setResultVisible(false);
        setMineAreas([]);
        setAutoBetCount((prevCount) => {
          const newCount = prevCount > 0 ? prevCount - 1 : prevCount;
          if (newCount == 0) {
            stopBet(); // Stop betting when no more bets are left
          }
          return newCount;
        });
      }, 1500);
    } else {
      stopBet(); // Stop betting if the conditions aren't met
    }
  };

  // Automatically trigger the betting loop when autoBetCount or isAutoRun changes
  useEffect(() => {
    if (status === GAME_STATUS.LIVE && activeTab === 1) {
      setTimeout(runTimeBet, 1000); // Adjust delay as needed
    }
  }, [status, activeTab, autoBetCount]);

  // -------------auto end ---------------------//

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (autoAreas.length > 0) {
      setAreaFlag(true);
    }
  }, [autoAreas]);

  const disabled = GAME_STATUS.LIVE === status || loading;
  const isAuto = activeTab === 1;



  // Render mine count slider
  const renderMineCount = () => (
    <div className="mt-2 flex flex-col">
      <p className={`text-xs ${disabled ? "text-[#879097]" : "text-white"}`}>
        Mines
      </p>
      <div
        className={`flex items-center p-1.5 ${disabled ? "bg-[#172c38]" : "bg-[#0f212e]"
          } rounded border-[2px] border-[#2f4553] hover:border-[#557086]`}
      >
        <div className="px-4 w-[10px] text-white">{mineCount}</div>
        <input
          type="range"
          min="1"
          max="24"
          disabled={disabled}
          value={mineCount}
          onChange={(e) => setMineCount(Number(e.target.value))}
          className="mx-2 w-full h-2 bg-[#879097] rounded-lg cursor-pointer "
        />
        <div className="px-4 text-white">24</div>
      </div>
    </div>
  );

  // Render mine status fields
  const renderMineStatus = () => (
    <div className="mt-2 w-[100%]">
      <div style={{ display: "grid" }}>
        <div className="pr-2 flex flex-col" style={{ gridRow: 1 }}>
          <p
            className={`text-sm w-full ${disabled ? "text-[#879097]" : "text-white"
              }`}
          >
            Mines
          </p>
          <input
            value={mineCount}
            disabled
            className="bg-[#2f4553] text-white  border-[2px] border-[#2f4553] hover:border-[#557086] rounded w-full p-1.5 text-sm"
          />
        </div>
        <div className="pl-2 flex flex-col" style={{ gridRow: 1 }}>
          <p
            className={`text-sm w-full ${disabled ? "text-[#879097]" : "text-white"
              }`}
          >
            Games
          </p>
          <input
            value={25 - mineCount - mineAreas.length}
            disabled
            className="bg-[#2f4553] text-white  border-[2px] border-[#2f4553] hover:border-[#557086] rounded w-full p-1.5 text-sm"
          />
        </div>
      </div>
    </div>
  );

  // Render pick random tile button
  const renderRandomPickBtn = () => (
    <div className="mt-3 w-full">
      <button
        onClick={randomBet}
        className="bg-[#2f4553] w-full hover:bg-[#496170] text-white font-bold py-2 px-4 rounded"
      >
        Pick random tile
      </button>
    </div>
  );

  // Render bet button
  const renderBetBtn = () => {
    const disabledbtn =
      (!isAuto && loading) || (isAuto && autoAreas.length == 0);
    return (
      <div className="mt-3 w-full">
        <button
          disabled={disabledbtn}
          onClick={() => {
            if (!isAuto) {
              if (!loading) {
                if (status === GAME_STATUS.LIVE) {
                  cashout();
                } else {
                  createBet();
                }
              }
            } else {
              if (status === GAME_STATUS.LIVE) {
                stopBet();
              } else {
                if (!loading) {
                  autoBet();
                }
              }
            }
          }}
          className={`${disabledbtn ? "bg-[#178317]" : "bg-[#00e701] hover:bg-[#00d600]"
            } text-black font-bold py-2 px-4 rounded w-full flex  justify-center text-center`}
        >
          <div className="flex text-nowrap">
            {status === GAME_STATUS.LIVE
              ? isAuto
                ? "Stop Autobet"
                : "CASHOUT"
              : isAuto
                ? "Start AutoBet"
                : "BET"}
            {loading && (
              <div className="h-6 flex w-full items-center justify-center animate-zoom p-1">
                <BombSvg />
              </div>
            )}
          </div>
        </button>
      </div>
    );
  };

  const renderStopProfitAmount = () => (
    <div className="mt-2">
      <p className={`text-sm ${disabled ? "text-[#879097]" : "text-white"}`}>
        Stop on Profit
      </p>
      <div
        className={`flex w-full items-center  border-[2px] border-[#2f4553] hover:border-[#557086] ${disabled ? "bg-[#172c38]" : "bg-[#0f212e]"
          } rounded p-1.5`}
      >
        <input
          disabled={disabled}
          type="number"
          min={0}
          value={stopProfitA}
          onChange={(e: any) => setStopProfitA(Number(e.target.value))}
          className={`${disabled ? "bg-[#172c38]" : "bg-[#0f212e]"
            } text-white  w-[90%] flex-1 text-sm focus:outline-none`}
        />
        <div className="w-5">
          <SelectedPaymentIcon />
        </div>
      </div>
    </div>
  );

  const renderStopLossAmount = () => (
    <div className="mt-2">
      <p className={`text-sm ${disabled ? "text-[#879097]" : "text-white"}`}>
        Stop on Loss
      </p>
      <div
        className={`flex w-full items-center  border-[2px] border-[#2f4553] hover:border-[#557086] ${disabled ? "bg-[#172c38]" : "bg-[#0f212e]"
          } rounded p-1.5`}
      >
        <input
          disabled={disabled}
          type="number"
          min={0}
          onChange={(e: any) => setStopLossA(Number(e.target.value))}
          value={stopLossA}
          className={`${disabled ? "bg-[#172c38]" : "bg-[#0f212e]"
            } text-white  w-[90%] flex-1 text-sm focus:outline-none`}
        />
        <div className="w-5">
          <SelectedPaymentIcon />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full justify-center mt-5 items-center">
      <div
        className={` ${isMobile ? "flex flex-col  items-center" : "flex"
          } bg-[#0f212e] w-full max-w-[1300px] rounded-md overflow-hidden`}
      >
        {!isMobile && (
          <div className={`w-[300px]  bg-[#213743] p-2`}>
            {isAuto ? (
              <div className="flex flex-col">
                <SwitchTab onChange={handleTabChange} active={activeTab} disabled={disabled} />
                <AmountInput value={betAmount} onChange={handleAmountChange} disabled={disabled} />
                {renderMineCount()}
                <BetNumberInput value={autoBetCount} disabled={disabled} onChange={handleBetCount} />
                <MineCustomInput
                  onChange={(value) => {
                    setOnWinP(value);
                  }}
                  value={onWinP}
                  label={"On Win"}
                  disabled={disabled}
                />
                <MineCustomInput
                  onChange={(value) => {
                    setOnLossP(value);
                  }}
                  value={onLossP}
                  label={"On Loss"}
                  disabled={disabled}
                />
                {renderStopProfitAmount()}
                {renderStopLossAmount()}
                {renderBetBtn()}
              </div>
            ) : (
              <div className="flex flex-col">
                <SwitchTab onChange={handleTabChange} active={activeTab} disabled={disabled} />
                <AmountInput value={betAmount} onChange={handleAmountChange} disabled={disabled} />

                {status === GAME_STATUS.READY && renderMineCount()}
                {status === GAME_STATUS.LIVE && renderMineStatus()}
                {status === GAME_STATUS.LIVE && <ProfitAmount
                  disabled={disabled}
                  multiplier={profitAndOdds.probability}
                  profit={profitAndOdds.roundedWinAmount}
                  icon={
                    <SelectedPaymentIcon />
                  } />}
                {status === GAME_STATUS.LIVE && renderRandomPickBtn()}
                {renderBetBtn()}
              </div>
            )}
          </div>
        )}
        {/* Main content */}
        <div
          className={`${isMobile ? "w-[350px]" : "w-[630px]  p-5"} mx-auto relative`}
        >
          <div
            className={`grid grid-cols-5 gap-2.5 p-1.5 ${!areaFlag ? "animate-bounding2" : ""
              } `}>
            {[...Array(25)].map((_, index) => {
              const mine = mineAreas.find((m) => m.point == index);
              const auto = isAuto
                ? autoAreas.findIndex((m) => m.point == index) !== -1
                : false;
              return (
                <div
                  key={index}
                  className={`overflow-hidden max-h-[126px] ${mineAreas.length == 0 ? "animate-zoomIn" : ""
                    } `}
                >
                  <MineButton
                    point={index}
                    mine={mine}
                    isAuto={auto}
                    onClick={isAuto ? selectArea : placeBet}
                  />
                </div>
              );
            })}
          </div>
          <MineModal
            visible={resultVisible}
            data={{
              odds: result.odds,
              profit: result.profit,
              coin: null,
            }}
          />
        </div>
        {isMobile &&
          (isAuto ? (
            <div className="w-[350px] bg-[#213743] p-2">
              {renderBetBtn()}
              <AmountInput value={betAmount} onChange={handleAmountChange} disabled={disabled} />
              {renderMineCount()}
              <BetNumberInput value={autoBetCount} disabled={disabled} onChange={handleBetCount} />
              <MineCustomInput
                onChange={(value) => {
                  setOnWinP(value);
                }}
                value={onWinP}
                label={"On Win"}
                disabled={disabled}
              />
              <MineCustomInput
                onChange={(value) => {
                  setOnLossP(value);
                }}
                value={onLossP}
                label={"On Loss"}
                disabled={disabled}
              />
              {renderStopProfitAmount()}
              {renderStopLossAmount()}
              <SwitchTab onChange={handleTabChange} active={activeTab} disabled={disabled} />
            </div>
          ) : (
            <div className="w-[350px] bg-[#213743] p-2">
              <AmountInput value={betAmount} onChange={handleAmountChange} disabled={disabled} />
              {renderBetBtn()}
              {status === GAME_STATUS.READY && renderMineCount()}
              {status === GAME_STATUS.LIVE && renderMineStatus()}
              {status === GAME_STATUS.LIVE && <ProfitAmount
                disabled={disabled}
                multiplier={profitAndOdds.probability}
                profit={profitAndOdds.roundedWinAmount}
                icon={
                  <SelectedPaymentIcon />
                } />}
              <SwitchTab onChange={handleTabChange} active={activeTab} disabled={disabled} />
            </div>
          ))}
      </div>
    </div>
  );
};

export default MineGame;

function calculateMinesGame(mines: number, picks: number, bet: number): any {
  const totalSlots = 25; // Total number of slots
  const safeSlots = totalSlots - mines; // Slots without mines

  // Function to calculate factorial
  function factorial(n: number): number {
    let value = 1;
    for (let i = 2; i <= n; i++) {
      value *= i;
    }
    return value;
  }

  // Function to calculate combinations
  function combination(n: number, k: number): number {
    if (k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
  }

  // Calculate total combinations and safe combinations
  const totalCombinations = combination(totalSlots, picks);
  const safeCombinations = combination(safeSlots, picks);

  // Calculate probability and other metrics
  let probability = 0.99 * (totalCombinations / safeCombinations);
  probability = Math.round(probability * 100) / 100;

  const winAmount = bet * probability;
  const roundedWinAmount = Math.round(winAmount * 100000000) / 100000000;

  const lossAmount = 100 / (probability - 1);
  const roundedLossAmount = Math.round(lossAmount * 100) / 100;

  const chance = 99 / probability;
  const roundedChance = Math.round(chance * 100000) / 100000;

  // Log results if conditions are met
  if (mines + picks <= totalSlots && picks > 0 && mines > 0) {
    if (mines && picks) {
      return {
        probability,
        roundedLossAmount,
        roundedChance,
        roundedWinAmount,
      };
      // console.log("Probability:", probability);
      // console.log("Loss:", roundedLossAmount);
      // console.log("Chance:", roundedChance);
      // if (bet > 0.00000000999) console.log("Win:", roundedWinAmount);
    }
  }
  return {
    probability: 0,
    roundedLossAmount: 0,
    roundedChance: 0,
    roundedWinAmount: 0,
  };
}
