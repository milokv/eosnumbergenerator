const API_URL = 'https://node1.eosphere.io/v1/chain'; // eos blockchain API URL, change if needed


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
// 12 25 38 51

let balance = 1000;
let betAmount = 0;
let isGenerating = false;
let nonce = 0;
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let playerBust = false;
let dealerBust = false;
let playerTurn = false; // track if its players turn
let playerCanSplit = false; // track if player can split
let playerCanDouble = false; // track if player can double
let playerAces = 0; // track if player used an ace to reduce score
let playerConvertedAces = 0; // track how many aces were converted to 1
let dealerAces = 0; // track if dealer used an ace to reduce score
let dealerConvertedAces = 0; // track how many aces were converted to 1
let generatedDeck = [];
let currentCard = 3;

document.getElementById("hitButton").addEventListener("click", playerHit);
document.getElementById("stayButton").addEventListener("click", playerStay);
document.getElementById("doubleButton").addEventListener("click", playerDouble);


document.getElementById("balance").textContent = "Balance:  " + balance;

async function startHand() {
    // reset game state
    generatedDeck = [];
    playerHand = [];
    dealerHand = [];
    playerScore = 0;
    dealerScore = 0;
    playerBust = false;
    dealerBust = false;
    playerTurn = true;
    playerCanSplit = false;
    playerCanDouble = false;
    playerAces = 0;
    playerConvertedAces = 0;
    dealerAces = 0;
    dealerConvertedAces = 0;
    currentCard = 3;
    betAmount = Number(document.getElementById('betAmount').value);
    if (betAmount > balance) {
        document.getElementById('result').textContent = `You don't have enough balance!`;
        return;
    }
    balance -= betAmount;
    document.getElementById('balance').textContent = `Balance: ${balance}`;
    await generateMultipleNumbers(52);
    console.log(generatedDeck);
    document.getElementById('playerHand').textContent = `Player Hand: `;
    document.getElementById('dealerHand').textContent = `Dealer Hand: `;
    document.getElementById('playerScore').textContent = `Player Score: 0`;
    document.getElementById('dealerScore').textContent = `Dealer Score: 0`;
    // deal first cards
    document.getElementById('result').textContent = `Dealing first player card...`;
    playerHand.push(generatedDeck[0]);
    document.getElementById('playerHand').textContent = `Player Hand: ${deck[playerHand[0]]}`;
    document.getElementById('result').textContent = `Dealing first dealer card...`;
    dealerHand.push(generatedDeck[1]);    
    document.getElementById('dealerHand').textContent = `Dealer Hand: ${deck[dealerHand[0]]}, ?`;
    document.getElementById('result').textContent = `Dealing second player card...`;
    playerHand.push(generatedDeck[2]);
    document.getElementById('playerHand').textContent = `Player Hand: ${deck[playerHand[0]]}, ${deck[playerHand[1]]}`;
    document.getElementById('result').textContent = `Dealing second dealer card...`;
    dealerHand.push(generatedDeck[3]);

    // calculate initial scores
    playerScore = deckValues[playerHand[0]] + deckValues[playerHand[1]];
    dealerScore = deckValues[dealerHand[0]];

    // display initial scores
    document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;
    document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`; // hide full dealer score
    dealerScore = deckValues[dealerHand[0]] + deckValues[dealerHand[1]];

    // check for 2 aces
    if (playerScore == 22) {
        playerScore -= 10;
        playerAces = 0;
        playerConvertedAces = 1;
        document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;
    }
    if (dealerScore == 22) {
        dealerScore -= 10;
        dealerAces = 0;
        dealerConvertedAces = 1;
        document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`;
    }

    // Check for Blackjack
    if (dealerScore == 21 && playerScore != 21) {
        dealerBlackjack = true;
        revealDealerHand();
        document.getElementById('result').textContent = `Dealer has Blackjack!`;
        playerTurn = false;
        return;
    } 
    else if (playerScore == 21 && dealerScore == 21) {
        document.getElementById('result').textContent = `It's a Tie!`;
        playerTie();
    }
    else if (playerScore == 21) {
        document.getElementById('result').textContent = `Player has Blackjack!`;
        playerTurn = false;
        revealDealerHand();
        playerBlackjack();
        return;
    }
    else if (deckValues[playerHand[0]] == deckValues[playerHand[1]]) {
        playerCanSplit = true;
        playerCanDouble = true;
        playerTurn = true;
        document.getElementById('result').textContent = `Hit, Stay, Split or Double?`;
    }
    else {
        playerTurn = true;
        playerCanDouble = true;
        document.getElementById('result').textContent = `Hit, Stay or Double?`; // player's turn
    }
}

async function playerHit() {
    if (!playerTurn) return; // stop if player already stayed
    playerCanDouble = false;
    document.getElementById('result').textContent = `Hitting...`;
    currentCard++;
    let newCard = generatedDeck[currentCard];
    playerHand.push(newCard);
    document.getElementById('result').textContent = `Hit or Stay?`;
    playerScore += deckValues[newCard];

    // Update UI
    document.getElementById('playerHand').textContent = `Player Hand: ${playerHand.map(card => deck[card]).join(', ')}`;
    document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;

    // Check if player busts
    if (playerScore > 21) {

        // Count the number of Aces in the hand
        for (let i in playerHand) {
            if (deckValues[playerHand[i]] == 11) {
                playerAces++;
            }
        }
    
        // Convert Aces from 11 to 1 until the score is under 21
        while (playerScore > 21 && playerAces > playerConvertedAces) {
            playerScore -= 10;
            playerAces = 0;
            playerConvertedAces++;
            document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;
        }

        if (playerScore > 21) {
            playerBust = true;
            document.getElementById('result').textContent = `Player Busted!`;
            playerTurn = false;
            revealDealerHand();
            return;
        }
    }
    if (playerScore == 21) {
        playerTurn = false;
        document.getElementById('result').textContent = `You have 21! Dealer's turn.`;
        revealDealerHand();
        dealerTurn();
    }
}

function playerDouble() {
    if (!playerTurn) return;
    if (!playerCanDouble) return;
    playerCanDouble = false;
    playerTurn = false;
    if (betAmount > balance) {
        document.getElementById('result').textContent = `You don't have enough balance!`;
        return;
    }
    balance -= betAmount;
    document.getElementById('balance').textContent = `Balance: ${balance}`;
    betAmount *= 2;
    let newCard = generatedDeck[currentCard];
    playerHand.push(newCard);
    document.getElementById('result').textContent = `Hit or Stay?`;
    playerScore += deckValues[newCard];

    // Update UI
    document.getElementById('playerHand').textContent = `Player Hand: ${playerHand.map(card => deck[card]).join(', ')}`;
    document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;

    // Check if player busts
    if (playerScore > 21) {

        // Count the number of Aces in the hand
        for (let i in playerHand) {
            if (deckValues[playerHand[i]] == 11) {
                playerAces++;
            }
        }
    
        // Convert Aces from 11 to 1 until the score is under 21
        while (playerScore > 21 && playerAces > playerConvertedAces) {
            playerScore -= 10;
            playerAces = 0;
            playerConvertedAces++;
            document.getElementById('playerScore').textContent = `Player Score: ${playerScore}`;
        }

        if (playerScore > 21) {
            playerBust = true;
            document.getElementById('result').textContent = `Player Busted!`;
            playerTurn = false;
            revealDealerHand();
            return;
        }
    }
    if (playerScore == 21) {
        playerTurn = false;
        document.getElementById('result').textContent = `You have 21! Dealer's turn.`;
        revealDealerHand();
        dealerTurn();
    }
    else {
        revealDealerHand();
        dealerTurn();
    }
}


function playerStay() {
    if (!playerTurn) return;

    playerTurn = false;
    document.getElementById('result').textContent = `You stayed. Dealer's turn.`;
    revealDealerHand();
    dealerTurn();
}

function playerWin() {
    balance += 2 * betAmount;
    document.getElementById('balance').textContent = `Balance: ${balance}`;
}

function playerTie() {
    balance += betAmount;
    document.getElementById('balance').textContent = `Balance: ${balance}`;
}

function playerBlackjack() {
    balance += betAmount * 2.5;
    document.getElementById('balance').textContent = `Balance: ${balance}`;
}

function revealDealerHand() {
    document.getElementById('dealerHand').textContent = `Dealer Hand: ${dealerHand.map(card => deck[card]).join(', ')}`;
    document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`;
}

async function dealerTurn() {
    let i = 0;
    while (dealerScore < 17) {
        document.getElementById('result').textContent = `Dealer Hitting...`;
        dealerHand.push(generatedDeck[currentCard + i]);
        dealerScore += deckValues[dealerHand[2+i]];
        if (dealerScore > 21) {

            // Count the number of Aces in the hand
            for (let i in dealerHand) {
                if (deckValues[dealerHand[i]] == 11) {
                    dealerAces++;
                }
            }
        
            // Convert Aces from 11 to 1 until the score is under 21
            while (dealerScore > 21 && dealerAces > dealerConvertedAces) {
                dealerScore -= 10;
                dealerAces = 0; // Only remove 1 Ace at a time
                dealerConvertedAces++;
                document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`;
            }
        }
        i++;
        document.getElementById('dealerHand').textContent = `Dealer Hand: ${dealerHand.map(card => deck[card]).join(', ')}`;
        document.getElementById('dealerScore').textContent = `Dealer Score: ${dealerScore}`;
    }


    if (dealerScore > 21) {
        dealerBust = true;
        document.getElementById('result').textContent = `Dealer Busted! You Win!`;
        playerWin();
    } else if (dealerScore > playerScore) {
        document.getElementById('result').textContent = `Dealer Wins!`;
    } else if (dealerScore < playerScore) {
        document.getElementById('result').textContent = `You Win!`;
        playerWin();
    } else {
        document.getElementById('result').textContent = `It's a Tie!`;
        playerTie();
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
async function fetchNextBlockHash(retries = 6, delay = 150) {
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
        const clientSeed = document.getElementById('clientSeed').value || "7e6fc018"; // default seed is random hex
        const nextBlockHash = await fetchNextBlockHash();
        let i = 0;
        while (i < amountOfNumbers) {
            const currentCombinedString = nextBlockHash + clientSeed + i; // add some random string to make the hash unique, + nonce and client seed
            const currentHashedValue = await hashData(currentCombinedString);
            console.log(currentHashedValue);
            const currentRandomNumber = BigInt("0x" + currentHashedValue) % BigInt(52); // convert the hash to a number in the range
            i++;
            const currentRandomInt = Number(currentRandomNumber);
            console.log(`Nonce: ${nonce}, Random Number: ${currentRandomNumber}, Hashed Value: ${currentHashedValue}`);
            generatedDeck.push(currentRandomInt);
        }
        nonce++;
        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;

    } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = 'Error fetching data. Make sure the API is running.';
        document.getElementById('error').textContent = errorMessage;        
    } finally {
        isGenerating = false; // unlock the function after completion
    }
}