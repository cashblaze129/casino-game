import { createSlice } from '@reduxjs/toolkit';

interface initialUser {
    _id: string,
    email: string,
    username: string,
    iReferral: string,
    avatar: string,
};

interface initialCurrency {
    _id: string,
    icon: string,
    symbol: string,
    minBet: number,
    maxBet: number,
    price: number,
}


interface initColorGameInfo {
    gameType: string,
    betType: string,
    betValue: string,
    gamePeriod: string,
}


interface State {
    isInitialized: boolean,
    isLoggedIn: boolean,
    code: string,
    betsId: string,
    token: string,
    dgToken: string,
    balance: 0,
    balanceId: string,
    currencyId: string,
    user: initialUser,
    currency: initialCurrency,
    adminAddress: string,
    solAdminAddress: string,
    ethAdminAddress: string,
    balances: any[],
    nowpayMinAmount: number,
    colorGameInfo: initColorGameInfo,
    colorGameActive: boolean,
    contractChanged: boolean,
    winValue: number,
    solDeposit: boolean,
    crashInfo: number
}

const initialCurrency: initialCurrency = {
    _id: "",
    icon: process.env.REACT_APP_CURRENCY_ICON || "",
    symbol: process.env.REACT_APP_CURRENCY || "",
    minBet: 1000,
    maxBet: 100000,
    price: 0.1,
};

const initialUser: initialUser = {
    _id: "",
    email: "",
    username: "",
    iReferral: "",
    avatar: "",
};

const initColorGameInfo: initColorGameInfo = {
    gameType: '',
    betType: '',
    betValue: '',
    gamePeriod: '',
}

const wingoBettingDetail = {
    gamePeriod: '',
    betType: '',
    betValue: '',
    amount: '',
    resultNumber: '',
    resultColor: '',
    status: '',
}

const initialState: State = {
    isInitialized: true,
    isLoggedIn: false,
    code: "",
    betsId: "",
    token: "",
    dgToken: "",
    balance: 0,
    balanceId: "",
    currencyId: "",
    user: initialUser,
    currency: initialCurrency,
    adminAddress: "",
    solAdminAddress: "",
    ethAdminAddress: "",
    balances: [],
    nowpayMinAmount: 0,
    colorGameInfo: initColorGameInfo,
    colorGameActive: true,
    contractChanged: true,
    winValue: 0,
    solDeposit: false,
    crashInfo: 0
};


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        Login(state, action) {
            const {
                balance,
                user,
                session,
                adminAddress,
                solAdminAddress,
                ethAdminAddress,
            } = action.payload;
            state.user = user;
            state.token = session.accessToken;
            state.dgToken = session.accessToken;
            state.balance = balance.balance;
            state.balanceId = balance._id;
            state.currency = balance.currency;
            state.currencyId = balance.currency._id;
            state.isLoggedIn = true;
            state.isInitialized = true;
            state.adminAddress = adminAddress;
            state.solAdminAddress = solAdminAddress;
            state.ethAdminAddress = ethAdminAddress;
        },

        UpdateCrashInfo(state, action) {
            const data = action.payload;

            state.crashInfo = data
        },

        UpdateInfo(state, action) {
            const data = action.payload;

            state.user = { ...state.user, ...data };
        },

        UpdateBalance(state, action) {
            state.balance = action.payload;
        },

        SetSolDeposit(state, action) {
            state.solDeposit = action.payload;
        },

        SetEthAddress(state, action) {
            const { ethAdminAddress } = action.payload;

            state.ethAdminAddress = ethAdminAddress;
        },

        UpdateBalances(state, action) {
            const balance = action.payload;
            state.balance = balance.balance;
            state.balanceId = balance._id;
            state.currency = balance.currency;
            state.currencyId = balance.currency._id;
            state = { ...state };
        },

        SetNowpayMinAmount(state, action) {
            state.nowpayMinAmount = action.payload.minAmount;
        },

        SetBalances(state, action) {
            state.balances = action.payload;
        },

        SetCode(state, action) {
            state.code = action.payload;
        },

        SetBetsId(state, action) {
            state.betsId = action.payload;
        },

        Logout(state, action) {
            state.token = "";
            state.dgToken = "";
            state.balance = 0;
            state.balanceId = "";
            state.currencyId = "";
            state.user = initialUser;
            state.currency = initialCurrency;
            state.isLoggedIn = false;
            state.isInitialized = true;
            state = { ...state };
            if (
                window.location.pathname.toString().indexOf("blackjack") !== -1 ||
                window.location.pathname.toString().indexOf("roulette") !== -1 ||
                window.location.pathname.toString().indexOf("/sports") !== -1
            ) {
                window.location.reload();
            }
        },

        SetColorGameInfo(state, action) {
            state.colorGameInfo = action.payload;
        },

        SetColorGameActive(state, action) {
            state.colorGameActive = action.payload;
        },

        SetWinValue(state, action) {
            state.winValue = action.payload;
        },

        SetContractChanged(state, action) {
            state.contractChanged = !state.contractChanged;
        },

        UpdateToken(state, action) {
            state.dgToken = action.payload;
        },
    },
});

export const {
    Login,
    Logout,
    SetEthAddress,
    UpdateInfo,
    UpdateCrashInfo,
    UpdateBalances,
    SetBalances,
    UpdateBalance,
    SetCode,
    SetBetsId,
    UpdateToken,
    SetNowpayMinAmount,
    SetColorGameActive,
    SetColorGameInfo,
    SetWinValue,
    SetContractChanged,
    SetSolDeposit
} = authSlice.actions;

// Export the reducer to be used in the store  
export default authSlice.reducer;  