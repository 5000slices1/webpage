// Import the required libraries
import { Principal } from "@dfinity/principal";
import fetch from 'isomorphic-fetch';
import { HttpAgent } from '@dfinity/agent';

const host = process.env.DFX_NETWORK ===   'https://icp-api.io';
const agent = new HttpAgent({ fetch, host });

// Function to fetch total supply and display it on the webpage
async function fetchTotalSupply() {
  try {
    const canisterId = 'zzriv-cqaaa-aaaao-a2gjq-cai';
    const response = await agent.fetch(`${host}/canister/${canisterId}`);
    const data = await response.json();

    // Extract the total supply value from the response
    const totalSupply = data.totalSupply;

    // Display the total supply on the webpage
    const totalSupplyElement = document.getElementById('totalSupply');
    totalSupplyElement.textContent = totalSupply.toString();

  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the fetchTotalSupply function
fetchTotalSupply();