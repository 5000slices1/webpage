// Make a GET request to fetch the tickers data
    // Make a GET request to fetch the tickers data
    fetch('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers')
      .then(response => response.json())
      .then(data => {
        // Find the ticker with ticker_name as 'ICP_GLDS'
        const ICP_GLDS = data.find(ticker => ticker.ticker_name === 'ICP_GLDS');
        if (ICP_GLDS) {
          const liquidusd = parseFloat(ICP_GLDS.liquidity_in_usd);

                   // Update the SLI_ICP liqudity  on the webpage
          const ICP_GLDSLiquidElement = document.getElementById('usdliquidity3');
        
          ICP_GLDSLiquidElement.textContent = '$' + liquidusd.toFixed(2);

        } else {
          // Handle the case when SLI_ICP or ICP_SLI ticker is not found
          console.log('SLI_ICP or ICP_SLI ticker not found');
        }
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.log('Error:', error);
      });
