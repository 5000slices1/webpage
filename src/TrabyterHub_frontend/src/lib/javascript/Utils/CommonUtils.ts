export const ResultTypes = createEnum(['ok', 'err', 'unknown']);

//Helper function, so that fake-enum's can be created
export function createEnum(values: string[]) {
    const enumObject: Record<string, string> = {};
    for (const val of values) {
        enumObject[val] = val;
    }
    return Object.freeze(enumObject);
}

//Returns true if the object has all the fileds included
export function hasFieldsSet(item: object, ...fieldNames: string[]) {
    for (let fieldName of fieldNames) {
        if (Object.hasOwn(item, fieldName) == false) {
            return false;
        }
    }
    return true;
}

//Only the first property is used
export function GetCustomResultFromVariant(item: any) {
    for (var key in item) {
        if (Object.hasOwn(item, key)) {
            let resultValue = item[key];
            return new CustomResultInfo(key, resultValue);
        }
    }
}

export function GetValueFromDictionary(
    items: Record<string, any[]>,
    searchKey: any,
): any {
    for (const [key, value] of Object.entries(items)) {
        let r1 = value[0];
        if (r1 == searchKey) {
            let temp = Object.entries(value[1]);
            let keyValueTemp = Object.entries(temp[0]);
            let realValue = keyValueTemp[1][1];
            return realValue;
        }
    }

    return null;
}

export function GetCustomDictionaryFromVariant(item: Record<string, any>) {
    var map = Object.create(null);
    for (var itemKey in item) {
        if (Object.hasOwn(item, itemKey)) {
            map[itemKey] = item[itemKey];
        }
    }
    return map;
}

export function GetResultFromVariant(item: any) {
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

    return new ResultInfo(ResultTypes.unknown, '');
}

export class ResultInfo {
    Result: string;
    ResultValue: any;

    constructor(result: string = ResultTypes.unknown, resultValue: any) {
        this.Result = result;
        this.ResultValue = resultValue;
    }
}

export class CustomResultInfo {
    Result: string;
    ResultValue: any;

    constructor(result: string, resultValue: any) {
        this.Result = result;
        this.ResultValue = resultValue;
    }
}

export function HelloWorld() {
    alert('Hello World');
}
