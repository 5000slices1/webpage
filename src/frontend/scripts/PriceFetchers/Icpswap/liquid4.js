// Make a GET request to fetch the tickers data
    // Make a GET request to fetch the tickers data
    fetch('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers')
      .then(response => response.json())
      .then(data => {
        // Find the ticker with ticker_name as 'GLDS_ICP'
        const GLDS_ICP = data.find(ticker => ticker.ticker_name === 'GLDS_ICP');
        if (GLDS_ICP) {
          const liquidusd = parseFloat(GLDS_ICP.liquidity_in_usd);

                   // Update the SLI_ICP liqudity  on the webpage
          const GLDS_ICPLiquidElement = document.getElementById('usdliquidity4');
        
          GLDS_ICPLiquidElement.textContent = '$' + liquidusd.toFixed(2);

        } else {
          // Handle the case when SLI_ICP or ICP_SLI ticker is not found
          console.log('SLI_ICP or ICP_SLI ticker not found');
        }
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.log('Error:', error);
      });