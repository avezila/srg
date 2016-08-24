import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router';

import * as reducers from 'reducers'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    router,
    ...reducers,
    ...asyncReducers,
  })
}

export const injectReducer = (store, { key, reducer }) => {
  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
