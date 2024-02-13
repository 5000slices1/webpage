// Import the required dependencies
const { Actor, HttpAgent } = require("@dfinity/agent");
const { IDL } = require("@dfinity/candid");
const { Principal } = require("@dfinity/principal");
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from 'path/to/motoko_canister.did.js';

async function getPrice() {
    const agent = new HttpAgent();
    const canisterId = 'yr4hc-viaaa-aaaag-qcirq-cai'; // Replace with your ICPSwap canister ID
  
    const actor = Actor.createActor(canisterId, {
      agent,
      canisterId,
    });
  
    try {
      const operator = 'yr4hc-viaaa-aaaag-qcirq-cai';
      const amountIn = '2.00000000';
      const zeroForOne = true;
      const amountOutMinimum = '0';
  
      const request = { operator, amountIn, zeroForOne, amountOutMinimum };
      const quoteResponse = await actor.quote(request);
  
      if (quoteResponse.ok !== null) {
        console.log(`Price: ${quoteResponse.ok}`);
      } else {
        console.log('Error: Failed to get price');
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
  
  getPrice();
  window.addEventListener('load', getPrice);