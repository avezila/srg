import { takeEvery,  takeLatest } from 'redux-saga'
import { call, put, take, select, fork } from 'redux-saga/effects'
import * as actions from 'actions'

import CianApi from "./CianApi"
import {TestCianApi} from "./TestCianApi"

function * filterOffers(action){
  let token = (yield select()).cian.token;
  if(!token)
    return yield put(actions.accessDenied());
  yield put(actions.loading({loading:true}))
  try {
    const request = {
      token,
      filter : action.payload.filter,
    }
    const response = yield call(CianApi.filterOffers, request);
    if(response.error.type){
      yield put(actions.addError({error:response.error}));
    }else {
      yield put(actions.filterOffersResponse(response));
    }
  } catch (e) {
    yield put(actions.addError({
      error : {
        type : "FETCH",
        e,
      }
    }));
  }
  yield put(actions.loading({loading:false}))
}

function * getOffers(action){
  let state = (yield select()).cian
  let needRequest = [];
  for (let id of action.payload.offerIDs)
    if(!state.offers[id])
      needRequest.push(id)
  if(!needRequest.length)
    return;
  let token = state.token;
  if(!token)
    return yield put(actions.accessDenied());
  yield put(actions.loading({loading:true}))
  try {
    const request = {
      token,
      offerIDs : needRequest,
    }
    const response = yield call(CianApi.getOffers,request);
    if(response.error.type){
      yield put(actions.addError({error:response.error}));
    }else {
      yield put(actions.getOffersResponse(response));
    }
  } catch (e) {
    yield put(actions.addError({
      error : {
        type : "FETCH",
        e,
      }
    }));
  }
  yield put(actions.loading({loading:false}))
}

function * onFilterChange (){
  yield* takeLatest('FILTER_CHANGE', filterOffers);
}

function * onFilterOffersResponse (){
  yield* takeLatest('FILTER_OFFERS_RESPONSE', getOffers);
}

function * onAddError(){
  while (true){
    let {e} = (yield take("ADD_ERROR")).payload.error
    if (e)
      console.error(e.stack || e.message)
  }
}

function * requestComparableBounds (){
  let {token,context} = (yield select()).cian;
  if(!token)
    return yield put(actions.accessDenied());
  if(!context.comparable)
    context = (yield takeLatest('GET_CONTEXT_RESPONSE')).payload.context;
  yield put(actions.loading({loading:true}))
  try {
    const request  = { 
      token,
      query : {
        geocode : context.comparable.rawAddress,
        results : 1,
      } 
    }
    let l1 = context.comparable.location[1]
    let l2 = context.comparable.location[0]
    if(l1 > 16 && l2 > 40 && l1 < 65 && l2<75){
      request.query.ll = [l1,l2].join(',');
      request.query.spn = [0.5,0.5].join(',');
      request.query.rspn = 1;
    }
    let query = [];
    for(let key in request.query)
      query.push(`${key}=${encodeURIComponent(request.query[key])}`);
    request.query = query.join("&");
    const response = yield call(CianApi.ymaps, request);
    if(response.error.type){
      yield put(actions.addError({error:response.error}));
    }else {
      yield put(actions.responseComparableBounds(response));
    }
  } catch (e) {
    yield put(actions.addError({
      error : {
        type : "FETCH",
        e,
      }
    }));
  }
  yield put(actions.loading({loading:false}))
}
function * onRequestComparableBounds (){
  yield* takeLatest('REQUEST_COMPARABLE_BOUNDS', requestComparableBounds);
}


function * getContext (){
  let token = (yield select()).cian.token;
  if(!token)
    return yield put(actions.accessDenied());
  yield put(actions.loading({loading:true}))
  try {
    const request = { token }
    const response = yield call(CianApi.getContext, request);
    if(response.error.type){
      yield put(actions.addError({error:response.error}));
    }else {
      response.context.enviroment = response.context.enviroment || "{}";
      try {
        response.context.enviroment = JSON.parse(response.context.enviroment)
      }catch (e){
        response.context.enviroment = {};
      }

      yield put(actions.getContextResponse(response));
    }
  } catch (e) {
    yield put(actions.addError({
      error : {
        type : "FETCH",
        e,
      }
    }));
  }
  yield put(actions.loading({loading:false}))
}

function * updateContext (){
  let {context,token} = (yield select()).cian;
  if(!token)
    return yield put(actions.accessDenied());
  yield put(actions.loading({loading:true}))
  try {
    
    const request = {
      token,
      context : {
        ...context,
        enviroment : JSON.stringify(context.enviroment),
      },
    }
    const response = yield call(CianApi.updateContext, request);
    
    if(response.error.type){
      yield put(actions.addError({error:response.error}));
    }
  } catch (e) {
    yield put(actions.addError({
      error : {
        type : "FETCH",
        e,
      }
    }));
  }
  yield put(actions.loading({loading:false}))
}
function * changeFavorite (action){
  yield put(actions.changeFavoriteOK(action.payload));
  yield fork(updateContext);
}

function * onChangeFavorite (){
  yield* takeLatest('CHANGE_FAVORITE', changeFavorite);
}

function * addOfferToReport (action){
  let {token} = (yield select()).cian;
  if(!token)
    return yield put(actions.accessDenied());
  yield put(actions.loading({loading:true}))
  try {
    const request = {
      token,
      offerID:action.payload.id,
    }
    const response = yield call(CianApi.addOfferToReport, request);
    if(response.error.type){
      yield put(actions.addError({error:response.error}));
    }else {
      yield put(actions.addOfferToReportOK(action.payload));
      yield fork(updateContext);
    }
  } catch (e) {
    yield put(actions.addError({
      error : {
        type : "FETCH",
        e,
      }
    }));
  }
  yield put(actions.loading({loading:false}))
}

function * onAddOfferToReport (){
  yield* takeLatest('ADD_OFFER_TO_REPORT', addOfferToReport);
}

function * firstInit (){
  yield * getContext();
  let filter = (yield select()).cian.filter;
  yield * filterOffers({payload:{filter}});
}

function * mySaga() {
  yield fork(onRequestComparableBounds)
  yield fork(onFilterChange)
  yield fork(onFilterOffersResponse)
  yield fork(onAddError)
  yield fork(firstInit)
  yield fork(onChangeFavorite)
  yield fork(onAddOfferToReport)
  yield fork(TestCianApi)
}

export default mySaga;