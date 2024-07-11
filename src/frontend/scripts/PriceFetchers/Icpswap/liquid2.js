// Make a GET request to fetch the tickers data
// Make a GET request to fetch the ICP price from the Binance API
    // Make a GET request to fetch the tickers data
    fetch('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers')
      .then(response => response.json())
      .then(data => {
        // Find the ticker with ticker_name as 'SLI_ICP'
        const SLI_ICP = data.find(ticker => ticker.ticker_name === 'SLI_ICP');
        if (SLI_ICP) {
          const liquidusd = parseFloat(SLI_ICP.liquidity_in_usd);

                   // Update the SLI_ICP liqudity  on the webpage
          const SLI_ICPLiquidElement = document.getElementById('usdliquidity2');
        
          SLI_ICPLiquidElement.textContent = '$' + liquidusd.toFixed(2);

        } else {
          // Handle the case when SLI_ICP or ICP_SLI ticker is not found
          console.log('SLI_ICP or ICP_SLI ticker not found');
        }
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.log('Error:', error);
      });
