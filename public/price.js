async function fetchPairPrice(pairName) {
  const response = await fetch('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers');
  const data = await response.json();

  const pair = data.find(pair => pair.ticker_name === pairName);

  if (pair) {
    const lastPrice = pair.last_price;
    return parseFloat(lastPrice);
  } else {
    throw new Error('Pair not found');
  }
}

const pairName = 'ckBTC_ICP';
const priceContainer = document.getElementById('priceContainer');

fetchPairPrice(pairName)
  .then(price => {
    priceContainer.textContent = `The price of ${pairName} is: ${price}`;
  })
  .catch(error => {
    console.error(error);
    priceContainer.textContent = 'Error fetching price';
  });