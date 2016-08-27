import { takeEvery,  takeLatest, delay } from 'redux-saga'
import { call, put, take, select, fork } from 'redux-saga/effects'

import * as actions from 'actions'
import CianApi from './CianApi'
import {TestCianApi} from './TestCianApi'


function *apiCall (...args) {
  yield put(actions.loading({loading: true}))
  try {
    return yield call(...args)
  } finally {
    yield put(actions.loading({loading: false}))
  }
}

function *filterOffers (action) {
  let token = (yield select()).cian.token
  if (!token) {
    return yield put(actions.accessDenied())
  }

  try {
    const request = {
      token,
      filter: action.payload.filter,
    }
    const response = yield call(apiCall, CianApi.filterOffers, request)
    if (response.error.type) {
      yield put(actions.addError({error: response.error}))
    } else {
      yield put(actions.filterOffersResponse(response))
    }
  } catch (e) {
    yield put(actions.addError({
      error: {
        type: 'FETCH',
        e,
      }
    }))
  }
}

function *getOffers (action) {
  let state = (yield select()).cian
  let needRequest = []
  for (let id of action.payload.offerIDs) {
    if (!state.offers[id]) {
      needRequest.push(id)
    }
  }
  if (!needRequest.length) {
    return
  }
  let token = state.token
  if (!token) {
    return yield put(actions.accessDenied())
  }
  try {
    const request = {
      token,
      offerIDs: needRequest,
    }
    const response = yield call(apiCall, CianApi.getOffers, request)
    if (response.error.type) {
      yield put(actions.addError({error: response.error}))
    } else {
      yield put(actions.getOffersResponse(response))
    }
  } catch (e) {
    yield put(actions.addError({
      error: {
        type: 'FETCH',
        e,
      }
    }))
  }
}


function *requestComparableBounds () {
  let {token, context} = (yield select()).cian
  if (!token) {
    return yield put(actions.accessDenied())
  }
  if (!context.comparable || !context.comparable.id) {
    context = (yield take('GET_CONTEXT_RESPONSE')).payload.context
  }
  try {
    const request = {
      token,
      query: {
        geocode : context.comparable.rawAddress,
        results : 1,
      }
    }
    let l1 = context.comparable.location[1]
    let l2 = context.comparable.location[0]
    if (l1 > 16 && l2 > 40 && l1 < 65 && l2 < 75) {
      request.query.ll = [l1, l2].join(',')
      request.query.spn = [0.5, 0.5].join(',')
      request.query.rspn = 1
    }
    let query = []
    for (let key in request.query) {
      query.push(`${key}=${encodeURIComponent(request.query[key])}`)
    }
    request.query = query.join('&')
    const response = yield call(apiCall, CianApi.ymaps, request)
    if (response.error.type) {
      yield put(actions.addError({error: response.error}))
    } else {
      yield put(actions.responseComparableBounds(response))
    }
  } catch (e) {
    yield put(actions.addError({
      error: {
        type: 'FETCH',
        e,
      }
    }))
  }
}


function *getContext () {
  let token = (yield select()).cian.token
  if (!token) {
    return yield put(actions.accessDenied())
  }
  try {
    const request = { token }
    const response = yield call(apiCall, CianApi.getContext, request)
    if (response.error.type) {
      yield put(actions.addError({error: response.error}))
    } else {
      response.context.enviroment = response.context.enviroment || '{}'
      try {
        response.context.enviroment = JSON.parse(response.context.enviroment)
      } catch (e) {
        response.context.enviroment = {}
      }

      yield put(actions.getContextResponse(response))
    }
  } catch (e) {
    yield put(actions.addError({
      error: {
        type: 'FETCH',
        e,
      }
    }))
  }
}

function *updateContext () {
  yield call(delay, 2000)
  let {context, token} = (yield select()).cian
  if (!token) {
    return yield put(actions.accessDenied())
  }

  try {
    const request = {
      token,
      context: {
        ...context,
        enviroment: JSON.stringify(context.enviroment),
      },
    }
    const response = yield call(apiCall, CianApi.updateContext, request)

    if (response.error.type) {
      yield put(actions.addError({error: response.error}))
    }
  } catch (e) {
    yield put(actions.addError({
      error: {
        type: 'FETCH',
        e,
      }
    }))
  }
}

function *changeFavorite (action) {
  yield put(actions.changeFavoriteOK(action.payload))
  yield put(actions.updateContext())
}

function *addOfferToReport (action) {
  let {token} = (yield select()).cian
  if (!token) {
    return yield put(actions.accessDenied())
  }
  try {
    const request = {
      token,
      offerID: action.payload.id,
    }
    const response = yield call(apiCall, CianApi.addOfferToReport, request)
    if (response.error.type) {
      yield put(actions.addError({error: response.error}))
    } else {
      yield put(actions.addOfferToReportOK(action.payload))
      yield put(actions.updateContext())
    }
  } catch (e) {
    yield put(actions.addError({
      error: {
        type: 'FETCH',
        e,
      }
    }))
  }
}

function *printError ({payload}) {
  let {e} = payload.error
  if (e) {
    console.error(e.stack || e.message)
  }
}

function *firstInit () {
  yield * getContext()
  let filter = (yield select()).cian.filter
  yield * filterOffers({payload: {filter}})
}

export default function *CianSaga () {
  yield fork(takeEvery, 'ADD_ERROR', printError)
  yield fork(takeEvery, 'CHANGE_FAVORITE', changeFavorite)
  yield fork(takeEvery, 'ADD_OFFER_TO_REPORT', addOfferToReport)

  yield fork(takeLatest, 'REQUEST_COMPARABLE_BOUNDS', requestComparableBounds)
  yield fork(takeLatest, 'UPDATE_CONTEXT', updateContext)
  yield fork(takeLatest, 'FILTER_CHANGE', filterOffers)
  yield fork(takeLatest, 'FILTER_OFFERS_RESPONSE', getOffers)

  yield fork(firstInit)
  yield fork(TestCianApi)
}
