import $ from 'jquery'


let _api = false

export async function loadApi () {
  if (_api) {
    if (_api === true) return // already loaded
    return new Promise((resolve) => _api.push(resolve)) // loading now, wait...
  }
  // start loading
  _api = []
  await $.getScript('https://api-maps.yandex.ru/2.0-stable/?load=package.full&lang=ru-RU')
  Promise.promisifyAll(window.ymaps)
  await window.ymaps.readyAsync()
  _api.forEach((resolve) => resolve())
  _api = true
}
