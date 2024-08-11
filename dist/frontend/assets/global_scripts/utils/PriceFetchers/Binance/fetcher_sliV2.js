// Make a GET request to fetch the tickers data
// Make a GET request to fetch the ICP price from the Binance API
fetch('https://api.binance.com/api/v3/ticker/price?symbol=ICPUSDT')
  .then(response => response.json())
  .then(data => {
    // Get the current ICP price in USD from the Binance API response
    const icpPriceUSD = parseFloat(data.price);

    // Make a GET request to fetch the tickers data
    fetch('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers')
      .then(response => response.json())
      .then(data => {
        // Find the ticker with ticker_name as 'SLI_ICP'
           const SLI_ICP = data.find(ticker => ticker.ticker_name === 'SLI_ICP');
        if (SLI_ICP) {
          const lastPrice = parseFloat(SLI_ICP.last_price);

          // Calculate the price of SLI_ICP&ICP_SLI in USD
          const priceUSD = icpPriceUSD / lastPrice;
          const marketCap = priceUSD * 5000;


                  // Update the SLI_ICP price and market cap on the webpage
          const SLI_ICPPriceElement = document.getElementById('SliIcpPrice');
          const SLI_MarketCapElement = document.getElementById('marketCapSli');

          SLI_ICPPriceElement.textContent = '$' + priceUSD.toFixed(2); 
          SLI_MarketCapElement.textContent = '$' + marketCap.toFixed(2) ;

          
        } else {
          // Handle the case when SLI_ICP or ICP_SLI ticker is not found
          console.log('SLI_ICP or ICP_SLI ticker not found');
        }
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.log('Error:', error);
      });
  })