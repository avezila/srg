
let _api = false

export async function loadApi () {
  if(_api){
    if(_api === true) return; // already loaded
    return new Promise((r)=> _api.push(r)) // loading now, wait...
  }
  // start loading
  _api = [];
  await $.getScript("https://api-maps.yandex.ru/2.0-stable/?load=package.full&lang=ru-RU")
  Promise.promisifyAll(ymaps)
  await ymaps.readyAsync()
  _api.forEach((r)=>r())
  _api = true;
}