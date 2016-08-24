import { call, put, fork } from 'redux-saga/effects'
import {delay} from "redux-saga"

import {addError} from 'actions'
import {Context} from 'const/Cian'
import CianApi from './CianApi'


let requests = {
  getOffers : {
    offerIDs : ["2","32","334"],
  },
  updateContext : {
    context : Context({
      favoriteIDs : ["2","32","334"],
      enviroment : JSON.stringify({
        page : "/map",
      })
    })
  },
  ymaps : {
    query : "geocode=Тверская+6",
  },
  addOfferToReport : {
    offerID : "32",
  }
}
const testToken = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFkc2FkcyIsImV4cCI6OTAwMDAwMTQ3MDgzMjc5N30.nARQ90Cf0nJqZFFp3a-LN9HY9sqb6m2c6cA1KQarUXE";

function * CallApi (name){
  let request = {
    token: testToken,
    ...(requests[name]||{}),
  };
  let response = yield call(CianApi[name],request);
  console.log(`${name}() `,response);
  if(response.error.type)
    yield put(addError({error : response.error}));
}

export function * TestCianApi(){
  yield call(delay, 5000)
  for(let name in CianApi){
    yield fork(CallApi,name)
  }
} 
