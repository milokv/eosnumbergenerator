const API_URL = 'https://node1.eosphere.io/v1/chain'; // eos blockchain API URL, change if needed

async function fetchLatestBlock() {
    const response = await fetch(`${API_URL}/get_info`, {
        method: 'POST',
    });
    const data = await response.json();
    console.log("Last Block Number: " + data.head_block_num);
    const blockNum = data.head_block_num + 1; // current block number, last block # +1
    console.log("Block URL: " + `https://eosflare.io/block/${blockNum}`)
    return data.head_block_num;
}

async function fetchBlockHash(blockNum) {
    const response = await fetch(`${API_URL}/get_block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_num_or_id: blockNum })
    });
    const data = await response.json();
    console.log("Block Hash:" + data.id); // log block hash
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
        const latestBlock = await fetchLatestBlock();
        const nextBlockHash = await fetchBlockHash(latestBlock + 1); // current block number, last block # +1
        
        const combinedString = nextBlockHash + clientSeed;
        const hashedValue = await hashData(combinedString);
        
        console.log('Hashed Value:', hashedValue); // log hashed value for debugging

        const hashNum = parseInt(hashedValue.slice(0, 16), 16);
        const randomNumber = hashNum % 1000; // Generate a number between 0-999
        
        document.getElementById('result').textContent = `Random Number: ${randomNumber}`;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('result').textContent = 'Error fetching data. Make sure the API is running.';
    }
}