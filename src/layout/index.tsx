import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

export const gameList = [
    {
        link: "/mine",
        name: 'Mine'
    },
    {
        link: "/slide",
        name: "Slide"
    },
    {
        link: "/video-poker",
        name: "VideoPoker"
    },
    {
        link: "/crash",
        name: "Crash"
    },
    {
        link: "/baccarat",
        name: "Baccarat(Multiplayer)"
    },
    {
        link: "/hilo",
        name: "Hilo"
    },
    {
        link: "/goal",
        name: "Goal"
    },
    {
        link: "/blackjack",
        name: "Blackjack"
    },
    // {
    //     link: "/roulette",
    //     name: "Roulette"
    // },
    // {
    //     link: "/baccarat-single",
    //     name: "Baccarat"
    // },
    // {
    //     link: "/hilo-multiplayer",
    //     name: "Hilo(Multiplayer)"
    // }
]

function Layout() {

    const menuref = useRef<any>(null);

    const [auth, setAuth] = React.useState(true);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (menuref.current && !menuref.current?.contains(event.target)) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])

    return (
        <div>
            <header className='z-50'>
                <nav className="bg-[#1a2c38] shadow-custom-dark">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                            <button className="text-white mr-2" aria-label="menu">
                                <svg
                                    className="w-8 h-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16m-7 6h7"
                                    />
                                </svg>
                            </button>
                            <h1 className="text-white text-lg"></h1>
                        </div>
                        <Dropdown />
                        {auth && (
                            <div className='relative' ref={menuref}>
                                <button
                                    className="text-white"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleMenu}
                                >
                                    <svg
                                        className="w-8 h-8"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5.121 17.804A8.988 8.988 0 0112 15c2.486 0 4.735.99 6.879 2.804m-6.879 1.196a4.5 4.5 0 10-4.5-4.5 4.5 4.5 0 004.5 4.5z"
                                        />
                                    </svg>{" "}
                                </button>
                                {anchorEl && (
                                    <div
                                        id="menu-appbar"
                                        onClick={handleClose}
                                        className="absolute z-50 right-0 mt-2 w-48 bg-white shadow-lg origin-top-right rounded-sm"
                                    >
                                        <ul className="py-1 w-full" role="menu">
                                            {
                                                gameList.map((item, index) => {
                                                    return <li className='p-1 hover:bg-slate-500 transition-all duration-150 w-full' key={index}><Link to={item.link} className='w-full'><div className='w-full'>{item.name}</div></Link></li>
                                                })
                                            }
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            </header>
            <main>
                {/* The Outlet component will render the matched child route */}
                <Outlet />
            </main>
            <footer>
                <p>© 2024 My Website</p>
            </footer>
        </div>
    );
}

export default Layout;


const currencies = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'BCH', name: 'Bitcoin Cash' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'TRX', name: 'Tron' },
    { symbol: 'EOS', name: 'EOS' },
];

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const chooseCurrency = (symbal: string) => {
        toggleDropdown();
    }
    const toggleDropdown = () => setIsOpen(!isOpen);
    const filteredCurrencies = currencies.filter(currency =>
        currency.symbol.toLowerCase().includes(search.toLowerCase())
    );
    const dropdownRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    onClick={toggleDropdown}
                    className="inline-flex justify-between w-full rounded-md border-2 shadow-sm px-4 py-2 bg-panel text-white border-inputborader hover:border-input_hover focus:outline-none font-bold"
                >
                    0.00000000 <span className="ml-2">▼</span>
                </button>
            </div>

            {isOpen && (
                <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Search Currencies"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </div>
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredCurrencies.map((currency) => (
                            <li key={currency.symbol} onClick={() => chooseCurrency(currency.symbol)} className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                <span>{currency.symbol}</span>
                                <span className="text-gray-500">{currency.name}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="px-4 py-2 border-t border-gray-200">
                        <button className="text-blue-600 hover:underline">Wallet Settings</button>
                    </div>
                </div>
            )}
        </div>
    );
};
