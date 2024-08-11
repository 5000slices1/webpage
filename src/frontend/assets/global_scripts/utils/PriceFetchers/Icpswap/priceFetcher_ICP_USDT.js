function fetchICPPrice() {
    // Make an API request to fetch ICP price from Binance
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=ICPUSDT')
        .then(response => response.json())
        .then(data => {
            // Extract the ICP price from the API response
            var icpPrice = parseFloat(data.price).toFixed(2);

            // Display the ICP price on the webpage
            document.getElementById('icp-price').textContent = '$' + icpPrice;
        })
        .catch(error => {
            console.log('Failed to fetch ICP price.', error);
        });
}

// Call the fetchICPPrice function when the page finishes loading
window.addEventListener('load', fetchICPPrice);
//fetchICPPrice();