

export class Ticker{

  base_currency  
  base_id  
  base_volume  
  base_volume_24H  
  fee_usd  
  last_price  
  liquidity_in_usd  
  target_currency     
  target_id   
  target_volume;     
  target_volume_24H;   
  ticker_id;     
  ticker_name;     
  total_volume_usd;     
  volume_usd_24H;
  
}

export class PriceFetcher {
       
    #priceTickers;

    async fetchTickers() {
        const response = await fetch('https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers');
        
        let jsonObject = await response.json();
        let count = jsonObject.length;

        let resultArray = []; //new Array(count);

        for (let item of jsonObject)
        {
          let newItem = new Ticker();
          newItem.base_currency = item?.base_currency;
          newItem.base_id = item?.base_id;
          newItem.base_volume = item?.base_volume;
          newItem.base_volume_24H = item?.base_volume_24H;
          newItem.fee_usd = item?.fee_usd;
          newItem.last_price = item?.last_price;
          newItem.liquidity_in_usd = item?.liquidity_in_usd;
          newItem.target_currency = item?.target_currency;
          newItem.target_id = item?.target_id;
          newItem.target_volume = item?.target_volume;
          newItem.target_volume_24H = item?.target_volume_24H;
          newItem.ticker_id = item?.ticker_id;
          newItem.ticker_name = item?.ticker_name;
          newItem.total_volume_usd = item?.total_volume_usd;
          newItem.volume_usd_24H = item?.volume_usd_24H;    
          resultArray.push(newItem);            
        }
                     
        return resultArray;    
    }

    async Init(){
        
        this.#priceTickers = await this.fetchTickers();
    }

    async getTicker(baseCurrency, targetCurrency) 
    {      
      if (this.#priceTickers == null)
      {
        return;
      }

      let ticker = this.#priceTickers.find(ticker => ticker?.base_currency != null         
        && ticker.base_currency == baseCurrency && ticker?.target_currency != null && ticker.target_currency == targetCurrency);
      return ticker;
    }

  }