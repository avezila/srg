import { combineReducers } from 'redux'
import { routerStateReducer as router } from 'redux-router'

import * as reducers from 'reducers'


const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    router,
    ...reducers,
    ...asyncReducers,
  })
}

export default makeRootReducer
