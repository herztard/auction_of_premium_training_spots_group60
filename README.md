# Auction of Premium Training Spots | Group 60

As the owner of a gym, you’ve partnered with famous sportspeople and coaches to offer exclusive training sessions at select time slots. These sessions are extremely valuable, but instead of assigning a fixed price, you want to let the market decide through an auction system.

Each training session is represented as a unique NFT (ERC-721 token) — an asset that guarantees access to that exclusive training spot with a specific coach.

Users can bid on these premium spots, and the highest bidder wins the right to attend. This ensures fairness and transparency in allocating these limited high-value experiences

## Team Members

| Name Surname          | Student ID  | Lecture Group | Practice Group |
|-----------------------|-------------|---------------|----------------|
| Adilzhan Slyamgazy    | 220103151   | 01-N          | 03-P           | 
| Alikhan Toleberdyyev  | 220103050   | 01-N          | 03-P           | 
| Almat Zhuban          | 220103067   | 01-N          | 05-P           |
| Ibrahim Serkebay      | 220103069   | 01-N          | 03-P           |



## Instructions

`/contract` - blockchain part (contract code, deployment code, other configurations) 
<br>
`/client/client` - frontend part


### Blockchain Part
Contract have been already deployed, but if you want to deploy it by yourself, follow next instructions

1. Enter the contract directory
    ```bash
    cd contract 
    ```
2. Install npm dependencies
    ```bash
    npm install
    ```
3. Create and set up .env file. <br>
INFURA_SEPOLIA_ENDPOINT may be taken from here https://developer.metamask.io/key/active-endpoints <br>
ETHERSCAN_API_KEY may be taken from here https://etherscan.io/apidashboard <br>
PRIVATE_key may be taken from Metamask: open extension ---> tap on triple dots ---> Account Details ---> Show Private Key ---> Enter your password ---> Hold to reveal private key ---> copy your private key
    ```bash
    echo "INFURA_SEPOLIA_ENDPOINT=<your-infura-sepolia-endpoint>" > .env
    echo "PRIVATE_KEY=<your-private-key>"  >> .env
    echo "ETHERSCAN_API_KEY=<your-etherscan-api-key>" >> .env
    ```

4. Deploy contracts. 
   ```bash
   npx hardhat --network sepolia run scripts/deploy.js   
   ```


5. In output of previous step will be displayed addresses of TrainingSpotNFT contract, save them and put them into next files `client/client/src/contracts/TrainingSpotNFT.json` and `client/client/src/utils/contractHelpers.js` by replacing existing ones.
```javascript
const CONTRACT_ADDRESS = "<your-training-spot-nft-address>";
```
```json
  "networks": {
    "11155111": {
      "address": "<your-training-spot-nft-address>"
    }
  }
```


### Frontend Part
Run client to interact with contracts
1. Enter the gym directory
    ```bash
    cd client/client 
    ```
2. Install npm dependencies
    ```bash
    npm install
    ```
3. Run client
   ```bash
   npm start 
   ```
