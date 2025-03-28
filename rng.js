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
        const numberRange = Number(document.getElementById('numberRange').value) || 1000;

        const combinedString = nextBlockHash + clientSeed + nonce; // add client seed and nonce to the hash to make it unique
        const hashedValue = await hashData(combinedString);
        const randomNumber = BigInt("0x" + hashedValue) % BigInt(numberRange + 1); 
        

        nonce++; // nonce to keep track of number of times a random number is generated, and support generating multiple random numbers with the same seed

        console.log(`Nonce: ${nonce}, Random Number: ${randomNumber}, Hash: ${hashedValue}`);

        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;

        document.getElementById('result').textContent = `Random Number: ${randomNumber}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = 'Error fetching data. Make sure the API is running.';
        document.getElementById('result').textContent = errorMessage;   
    } finally {
        isGenerating = false; // unlock the function after completion
    }
}


// fetches the hash from the next block from the "latest"
// if the next block hasn't generated or isn't available, it retries after a 1s delay. this is needed as bad timings sometimes cause the next block to not exist when the script is run.
async function fetchNextBlockHash(retries = 5, delay = 1000) {
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


async function generateMultipleNumbers() {
    if (isGenerating) {
        console.warn("Already generating a number. Please wait...");
        return;
    }

    isGenerating = true; // lock the function while already running

    try {
        const nonceBefore = nonce;
        const amountOfNumbers = Number(document.getElementById('amountOfNumbers').value) || 1;

        const clientSeed = document.getElementById('clientSeed').value || "7e6fc018"; // default seed is random hex
        const nextBlockHash = await fetchNextBlockHash();
        const numberRange = Number(document.getElementById('numberRange').value) || 1000;

        document.getElementById('resultMultiple').textContent = '';

        while (nonce < nonceBefore + amountOfNumbers) {
            const currentCombinedString = nextBlockHash + clientSeed + nonce; // add some random string to make the hash unique, + nonce and client seed
            const currentHashedValue = await hashData(currentCombinedString);
            console.log(currentHashedValue);
            const currentRandomNumber = BigInt("0x" + currentHashedValue) % BigInt(numberRange + 1); // convert the hash to a number in the range
            nonce = nonce + 1;
            console.log(`Nonce: ${nonce}, Random Number: ${currentRandomNumber}, Hashed Value: ${currentHashedValue}`);
            document.getElementById('resultMultiple').textContent += (deck[currentRandomNumber] + ', ');
        }
        document.getElementById('resultMultiple').textContent = document.getElementById('resultMultiple').textContent.slice(0, -2); // remove trailing comma

        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;

    } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = 'Error fetching data. Make sure the API is running.';
        document.getElementById('resultMultiple').textContent = errorMessage;        
    } finally {
        isGenerating = false; // unlock the function after completion
    }
}