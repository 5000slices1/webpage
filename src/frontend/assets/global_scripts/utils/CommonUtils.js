


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
  
export function HelloWorld()
{
  alert("Hello World");
}