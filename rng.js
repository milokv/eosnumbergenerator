const API_URL = 'https://node1.eosphere.io/v1/chain'; // eos blockchain API URL, change if needed


nonce = 0;

async function fetchLatestBlock() {
    const response = await fetch(`${API_URL}/get_info`, {
        method: 'POST',
    });
    const data = await response.json();
    const blockNum = data.head_block_num + 1; // current block number, last block # +1
    console.log("Block URL: " + `https://eosflare.io/block/${blockNum}`)
    console.log(Date()); // log current time for debugging (compare with eos block time)
    return data.head_block_num;
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
    try {
        const clientSeed = document.getElementById('clientSeed').value || 'defaultSeed';
        const nextBlockHash = await fetchNextBlockHash();
        
        const combinedString = nextBlockHash + clientSeed + nonce;
        const hashedValue = await hashData(combinedString);
        
        console.log('Hashed Value:', hashedValue); // log hashed value for debugging

        const hashNum = parseInt(hashedValue.slice(0, 16), 16);
        const randomNumber = hashNum % 1000; // Generate a number between 0-999
        

        nonce = nonce + 1; //nonce to keep track of number of times a random number is generated, and support generating multiple random numbers with the same seed

        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;

        document.getElementById('result').textContent = `Random Number: ${randomNumber}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('result').textContent = 'Error fetching data. Make sure the API is running.';
    }
}


// fetches the hash from the next block from the "latest"
// if the next block hasn't generated or isn't available, it retries after a 1s delay. this is needed as bad timings sometimes cause the next block to not exist when the script is run.
async function fetchNextBlockHash(retries = 5, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const latestBlock = await fetchLatestBlock();
            console.log(`Latest Block Number: ${latestBlock}`);
            
            const nextBlockHash = await fetchBlockHash(latestBlock + 1);

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



async function generateRandomNumberWithNonce(n, nonceBefore) {
    try {
        const clientSeed = document.getElementById('clientSeed').value || 'defaultSeed';
        const nextBlockHash = await fetchNextBlockHash();
        
        const combinedString = nextBlockHash + clientSeed + nonce;
        const hashedValue = await hashData(combinedString);
        
        console.log('Hashed Value:', hashedValue); // log hashed value for debugging

        const hashNum = parseInt(hashedValue.slice(0, 16), 16);
        const randomNumber = hashNum % 1000; // Generate a number between 0-999
        
        for (let i = nonce; i < n + nonceBefore; i = nonce) {
            const currentCombinedString = nextBlockHash + clientSeed + nonce;
            const currentHashedValue = await hashData(currentCombinedString);
            currentHashNum = parseInt(currentHashedValue.slice(0, 16), 16);
            currentRandomNumber = currentHashNum % 1000; // Generate a number between 0-999
            nonce = nonce + 1;
            console.log("Nonce: " + nonce + " Random Number: " + currentRandomNumber + " Hash: " + currentHashedValue);
        }


        document.getElementById('nonce').textContent = `Nonce: ${nonce}`;

        document.getElementById('result').textContent = `Random Number: ${randomNumber}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('result').textContent = 'Error fetching data. Make sure the API is running.';
    }
}