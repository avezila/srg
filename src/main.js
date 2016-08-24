import React from 'react'
import ReactDOM from 'react-dom'
import BlueBird from 'bluebird/js/browser/bluebird.min.js'
import App from './containers/App'
import createStore from './store/createStore'

// Setup bluebird as Promise
global.Promise = BlueBird;
require('babel-runtime/core-js/promise').default = BlueBird;

// Global jQuery
import $ from 'jquery'
global.$ = global.jQuery = $
import "jQuery-ajaxTransport-XDomainRequest"

import "lib/Pretty"

$.ajaxSetup({
  cache: true
});

//$.support.cors = true;
//window.__disableNativeFetch = true


const initialState = window.__INITIAL_STATE__ // for server side rendering
const store = createStore(initialState)


// ========================================================
// Developer Tools Setup
// ========================================================
if (__DEBUG__) {
  if (window.devToolsExtension) {
    window.devToolsExtension.open()
  }
}

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root')

let render = () => {
  const routes = require('./routes/index').default(store)
  ReactDOM.render(
    <App
      store={store}
      routes={routes}
      //history={history}
    />,
    MOUNT_NODE
  )
}

// This code is excluded from production bundle
if (__DEV__) {
  if (module.hot) {
    // Development render functions
    const renderApp = render
    const renderError = (error) => {
      const RedBox = require('redbox-react').default

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE)
      setTimeout(()=>{throw error},1);
    }

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp()
      } catch (error) {
        renderError(error)
      }
    }

    // Setup hot module replacement
    module.hot.accept('./routes/index', () => {
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
      })
    })
  }
}

// ========================================================
// Go!
// ========================================================
render()
