const API_URL = 'https://node1.eosphere.io/v1/chain'; // eos blockchain API URL, change if needed


nonce = 0;
let isGenerating = false;
// deck of cards in order, for card generation
const deck = [
    "2 ♠", "3 ♠", "4 ♠", "5 ♠", "6 ♠", "7 ♠", "8 ♠", "9 ♠", "10 ♠", "J ♠", "Q ♠", "K ♠", "A ♠",  // Spades (♠)
    "2 ♥", "3 ♥", "4 ♥", "5 ♥", "6 ♥", "7 ♥", "8 ♥", "9 ♥", "10 ♥", "J ♥", "Q ♥", "K ♥", "A ♥",  // Hearts (♥)
    "2 ♦", "3 ♦", "4 ♦", "5 ♦", "6 ♦", "7 ♦", "8 ♦", "9 ♦", "10 ♦", "J ♦", "Q ♦", "K ♦", "A ♦",  // Diamonds (♦)
    "2 ♣", "3 ♣", "4 ♣", "5 ♣", "6 ♣", "7 ♣", "8 ♣", "9 ♣", "10 ♣", "J ♣", "Q ♣", "K ♣", "A ♣"   // Clubs (♣)
];
const deckValues = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, // Spades (♠)
    2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, // Hearts (♥)
    2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11, // Diamonds (♦)
    2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11  // Clubs (♣)
];

let playerHand = [];
let dealerHand = [];
let hands = [];
let playerScore = 0;
let dealerScore = 0;
let playerBlackjack = false;
let dealerBlackjack = false;
let playerBust = false;
let dealerBust = false;


async function startHand() {
    playerHand = [];
    dealerHand = [];
    hands = [];
    playerScore = 0;
    dealerScore = 0;
    playerBlackjack = false;
    dealerBlackjack = false;
    playerBust = false;
    dealerBust = false;


    playerHand.push(await generateRandomNumber());
    document.getElementById('playerHand').textContent = `Player Hand: ${deck[playerHand[0]]}, ?`;
    playerScore = deckValues[playerHand[0]];
    dealerHand.push(await generateRandomNumber());
    document.getElementById('dealerHand').textContent = `Dealer Hand: ${deck[dealerHand[0]]}, ?`;
    dealerScore = 11;
    playerHand.push(await generateRandomNumber());
    document.getElementById('playerHand').textContent = `Player Hand: ${deck[playerHand[0]]}, ${deck[playerHand[1]]}`;
    playerScore = deckValues[playerHand[0]] + deckValues[playerHand[1]];
    dealerHand.push(await generateRandomNumber());
    document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;
    console.log(playerScore);
    document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`;
    console.log(dealerScore);
    if (dealerScore == 11) {
        if (deckValues[dealerHand[1]] == 10 && playerScore != 21) {
            console.log(deckValues[dealerHand[1]]);
            dealerScore = 21;
            document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`;
            document.getElementById('result').textContent = `Dealer has Blackjack!`;
            console.log("dealer blackjack");
            document.getElementById('dealerHand').textContent = `Dealer Hand: ${deck[dealerHand[0]]}, ${deck[dealerHand[1]]}`; // show dealer hand
            return;
        }
        else {
            document.getElementById('result').textContent = `Dealer does not have Blackjack!`;
            console.log("no blackjack");
            return;
        }
        return
    }
    if (playerScore == 21) {
        document.getElementById('result').textContent = `Player has Blackjack!`;
        playerBlackjack = true;
        return;
    }
}

async function fetchLatestBlock() {
    const response = await fetch(`${API_URL}/get_info`, {
        method: 'POST',
    });
    const data = await response.json();
    const blockNum = data.head_block_num + 1; // current block number, last block # +1
    console.log("Block URL: " + `https://eosauthority.com/block/${blockNum}`)
    console.log(new Date().toISOString()); // log current (iso formatted) time for debugging (compare with eos block time)
    return blockNum;
}

async function fetchBlockHash(blockNum) {
    const response = await fetch(`${API_URL}/get_block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_num_or_id: blockNum })
    });
    const data = await response.json();
    return data.id;
}

async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function generateRandomNumber() {
    if (isGenerating) {
        console.warn("Already generating a number. Please wait...");
        return;
    }

    isGenerating = true; // lock the function while already running

    try {
        const clientSeed = document.getElementById('clientSeed').value || "7e6fc018"; // default seed is random hex
        const nextBlockHash = await fetchNextBlockHash();

        const combinedString = nextBlockHash + clientSeed + nonce; // add some random string to make the hash unique, + nonce and client seed
        const hashedValue = await hashData(combinedString);
        console.log(hashedValue);
        const randomNumber = BigInt("0x" + hashedValue) % BigInt(52); // convert the hash to a number in the range
        nonce++; // nonce to keep track of number of times a random number is generated, and support generating multiple random numbers with the same seed
        const randomInt = Number(randomNumber);
        console.log(`Nonce: ${nonce}, Random Number: ${randomNumber}, Hashed Value: ${hashedValue}`);
        
        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;

        return randomInt;

    } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = 'Error fetching data. Make sure the API is running.';
        document.getElementById('error').textContent = errorMessage;   
    } finally {
        isGenerating = false; // unlock the function after completion
    }
}


// fetches the hash from the next block from the "latest"
// if the next block hasn't generated or isn't available, it retries after a 1s delay. this is needed as bad timings sometimes cause the next block to not exist when the script is run.
async function fetchNextBlockHash(retries = 5, delay = 300) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const latestBlock = await fetchLatestBlock();
            console.log(`Latest Block Number: ${latestBlock}`);
            
            const nextBlockHash = await fetchBlockHash(latestBlock);

            if (nextBlockHash) {
                console.log(`Next Block Hash: ${nextBlockHash}`);
                return nextBlockHash; // return valid hash
            }

            throw new Error("Received an undefined or invalid block hash.");
        } catch (error) {
            console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`, error);

            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delay)); // wait before retrying
            } else {
                throw new Error(`Failed to fetch next block after ${retries} attempts.`);
            }
        }
    }
}


async function generateMultipleNumbers(amountOfNumbers) {
    if (isGenerating) {
        console.warn("Already generating a number. Please wait...");
        return;
    }

    isGenerating = true; // lock the function while already running

    try {
        const nonceBefore = nonce;

        const clientSeed = document.getElementById('clientSeed').value || "7e6fc018"; // default seed is random hex
        const nextBlockHash = await fetchNextBlockHash();

        while (nonce < nonceBefore + amountOfNumbers) {
            const currentCombinedString = nextBlockHash + clientSeed + nonce; // add some random string to make the hash unique, + nonce and client seed
            const currentHashedValue = await hashData(currentCombinedString);
            console.log(currentHashedValue);
            const currentRandomNumber = BigInt("0x" + currentHashedValue) % BigInt(52); // convert the hash to a number in the range
            nonce = nonce + 1;
            const currentRandomInt = Number(currentRandomNumber);
            console.log(`Nonce: ${nonce}, Random Number: ${currentRandomNumber}, Hashed Value: ${currentHashedValue}`);
            hands.push(currentRandomInt);
        }
        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;
        console.log(hands);

    } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = 'Error fetching data. Make sure the API is running.';
        document.getElementById('error').textContent = errorMessage;        
    } finally {
        isGenerating = false; // unlock the function after completion
    }
}