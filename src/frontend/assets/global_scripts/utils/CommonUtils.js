

export const ResultTypes = createEnum(['ok', 'err', 'unknown']);

//Helper function, so that fake-enum's can be created
export function createEnum(values) {
    const enumObject = {};
    for (const val of values) {
      enumObject[val] = val;
    }
    return Object.freeze(enumObject);
  }

  export async function fetchAndSetInnerHTML(innerDiv,htmlSource) {
    try {
        const response = await fetch(htmlSource);
        const data = await response.text();      
        innerDiv.innerHTML = data;      
    } catch (error) {
        console.error('Error fetching and setting inner HTML:', error);
    }
  }
  

  //Returns true if the object has all the fileds included
export function hasFieldsSet(item, ...fieldNames) {
  for (let fieldName of fieldNames) {
    if (Object.hasOwn(item, fieldName) == false) {
      return false;
    }
  }
  return true;
}


//Only the first property is used
export function GetCustomResultFromVariant(item) {
  for (var key in item) {
    if (Object.hasOwn(item, key)) {

      let resultValue = item[key];
      return new CustomResultInfo(key, resultValue);
    }
  }
}

export function GetValueFromDictionary(items, searchKey)
{
 
  for (const [key, value] of Object.entries(items)) {
    let r1 = value[0]; 
    if (r1 == searchKey)
    {
      let temp = Object.entries(value[1]);
      let keyValueTemp = Object.entries(temp[0]);
      let realValue =  keyValueTemp[1][1];
      return realValue;
    } 
  }

return null;

  // for(var item in items)
  // {      
  //   console.log("Item: ");
  //   console.log(item);

  //   let keyOfItem = item[0];
  //   console.log("Key: ", keyOfItem);
  //   let key2OfItem = item[1];
  //   console.log("Key2: ", key2OfItem);
  // }
}

export function GetCustomDictionaryFromVariant(item) {
  var map = Object.create(null);
  for (var itemKey in item) {
    if (Object.hasOwn(item, itemKey)) {
      map[itemKey] = item[itemKey];
    }
  }
  return map;
}

export function GetResultFromVariant(item) {

  if (Object.hasOwn(item, 'err')) {
    return new ResultInfo(ResultTypes.err, item['err']);
  }

  if (Object.hasOwn(item, 'Err')) {
    return new ResultInfo(ResultTypes.err, item['Err']);
  }

  if (Object.hasOwn(item, 'ok')) {
    return new ResultInfo(ResultTypes.ok, item['ok']);
  }

  if (Object.hasOwn(item, 'Ok')) {
    return new ResultInfo(ResultTypes.ok, item['Ok']);
  }

  return new ResultInfo(ResultTypes.unknown, "");
}

export class ResultInfo {
  Result;
  ResultValue;

  constructor(result = ResultTypes.unknown, resultValue) {
    this.Result = result;
    this.ResultValue = resultValue;
  }

}

export class CustomResultInfo {
  Result;
  ResultValue;

  constructor(result, resultValue) {
    this.Result = result;
    this.ResultValue = resultValue;
  }
}

export function HelloWorld()
{
  alert("Hello World");
}