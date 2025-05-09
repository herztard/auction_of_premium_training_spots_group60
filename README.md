# Auction of Premium Training Spots | Group 60

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
`/gym` - frontend part


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

...