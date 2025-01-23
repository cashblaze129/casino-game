import CryptoJS from 'crypto-js';

// Function to hash the server key using CryptoJS
export function hashServerKey(serverKey: string): string {
    return CryptoJS.SHA256(serverKey).toString(CryptoJS.enc.Hex);
}

// Function to regenerate a card based on the clientKey, serverKey, and round
export function regenerateCard(clientKey: string, serverKey: string, round: number): number {
    const combinedKey = clientKey + serverKey + round.toString();
    const cardHash = CryptoJS.SHA256(combinedKey).toString(CryptoJS.enc.Hex);
    return parseInt(cardHash.slice(0, 8), 16) % 13 + 1; // Cards 1 (Ace) to 13 (King)
}


export const generateHiloCard = (publicKey: string, privateKey: string, round: number) => {
    const combinedKey = publicKey + privateKey + round.toString();
    const cardHash = CryptoJS.SHA256(combinedKey).toString();
    // Card rank: values from 1 (Ace) to 13 (King)
    const cardRank = parseInt(cardHash.slice(0, 8), 16) % 13;
    console.log("card Rank", cardRank);
    // Card suit: 0 = Hearts, 1 = Diamonds, 2 = Clubs, 3 = Spades
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cardSuitIndex = parseInt(cardHash.slice(8, 12), 16) % 4;
    const cardSuit = suits[cardSuitIndex];

    return { rank: ranks[cardRank], suit: cardSuit };
};




// Generate a random card with value and suit
export const getHiloMGameCard = (privateSeed: string, publicSeed: string) => {
    const combinedSeed = privateSeed + publicSeed;
    const cardHash = CryptoJS.SHA256(combinedSeed).toString();
    const cardValue = parseInt(cardHash.slice(0, 8), 16) % 13; // 0-12
    const suitIndex = parseInt(cardHash.slice(8, 10), 16) % 4;

    const suit = ['Clubs', 'Spades', 'Hearts', 'Diamonds'][suitIndex];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'Joker'];

    return { rank: ranks[cardValue], suit };
}