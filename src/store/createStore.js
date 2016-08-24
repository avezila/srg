import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { reduxReactRouter } from 'redux-router';
import { createHistory,createHashHistory } from 'history';
import { supportsHistory } from 'history/lib/DOMUtils.js';
import createSagaMiddleware from 'redux-saga'

import makeRootReducer from './reducers'
import mySaga from '../saga'


export default (initialState = {}) => {
  const sagaMiddleware = createSagaMiddleware()
  const middleware = [sagaMiddleware]

  let historyPush = supportsHistory();
  let create_history = historyPush? createHistory : createHashHistory;
  let historyOptions = {
    queryKey  : "_",
    keyLength : 1,
  }
  if (!historyPush) {
    if(window.location.hash == "")
      window.location.hash = window.location.pathname;
  }else {
    let hash = (window.location.hash+"").replace(/^\#/,"");
    if(hash && hash != 'undefined'){
      history.pushState({},"",hash)
    }
  }


  const enhancers = [
    reduxReactRouter({
      createHistory: ()=> create_history(historyOptions)
    }),
  ]
  if (__DEBUG__) {
    const devToolsExtension = window.devToolsExtension
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension())
    }
  }


  const store = createStore(
    makeRootReducer(),
    initialState,
    compose(
      applyMiddleware(...middleware),
      ...enhancers,
    )
  )
  store.asyncReducers = {}

  sagaMiddleware.run(mySaga)

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default
      store.replaceReducer(reducers(store.asyncReducers))
    })
  }

  return store
}
