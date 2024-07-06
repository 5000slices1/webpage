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
        // Find the ticker with ticker_name as 'GLDS_ICP'
        const GLDS_ICP = data.find(ticker => ticker.ticker_name === 'GLDS_ICP');
        if (GLDS_ICP) {

          const lastPrice = parseFloat(GLDS_ICP.last_price);

          // Calculate the price of GLDS_ICP in USD
          const priceUSD =  icpPriceUSD / lastPrice;
          const marketCap = priceUSD * 3000;

          // Update the GLDS_ICP price on the webpage
          const GLDS_ICPPriceElement = document.getElementById('GldsIcpPrice');
          const GLDSMarketCapElement = document.getElementById('GldsMarketCap');

          GLDSMarketCapElement.textContent ='$' + marketCap.toFixed(2) ;

          GLDS_ICPPriceElement.textContent = '$' +priceUSD.toFixed(2) ;

        } else {
          // Handle the case when GLDS_ICP ticker is not found
          console.log('GLDS_ICP ticker not found');
        }
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        console.log('Error:', error);
      });
  })
  .catch(error => {
    // Handle any errors that occurred during the request to Binance API
    console.log('Error:', error);
  });