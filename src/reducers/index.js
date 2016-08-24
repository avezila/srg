import {handleActions} from "redux-actions"

import * as actions from 'actions'
import {Filter,Error,ParseOffer} from 'const/Cian'
import {BoundsScale} from 'lib/Map'
import lmerge from "lodash/merge"
import luniq from "lodash/uniq"

let errorID = 0;

export const cian = handleActions({
  [actions.filterChange]: (state, action) =>({
    ...state,
    filter : Filter(action.payload.filter),
  }),
  [actions.filterOffersResponse]: (state, action) => ({
    ...state,
    //offerIDs : action.payload.offerIDs || [],
    offerIDs : (function(){
      let ret = []
      for(let i = 0; i < 1000; i++)
        ret.push(""+(i + ((Math.random()>0.8)? 1000 : 0)) );
      return ret;
    })(),
  }),
  [actions.getContextResponse]: (state, action) => ({
    ...state,
    context : {
      ...state.context,
      ...action.payload.context,
    },
  }),
  [actions.addError] : (state,action) => ({
    ...state,
    errors : [{
      ...action.payload.error,
      id    : errorID++,
      time  : 10*1000+new Date().getTime(),
    },...state.errors],
  }),
  [actions.removeError] : (state,action) => ({
    ...state,
    errors : state.errors.filter(el=> action.payload.id != el.id),
  }),
  [actions.getOffersResponse]: (state, action) => {
    let newState = {...state, offers : {...state.offers}}
    // TEST HACK
    let offers = [];
    for(let i of state.offerIDs){
      offers.push({
        ...action.payload.offers[Math.floor(Math.random()*action.payload.offers.length)],
        id : i,
        location : [
          55.745+Math.random()*0.025,
          37.585+Math.random()*0.05,
        ],
      })
    }
    action.payload.offers = offers;
    //****************
    action.payload.offers.map(offer=>{
      offer = ParseOffer(offer)
      if(offer.id)
        newState.offers[offer.id] = offer;
    })
    return newState;
  },
  [actions.responseComparableBounds]: (state,action)=>{
    let bounds;
    try {
      let env = action.payload.response.GeoObjectCollection.featureMember[0].GeoObject.boundedBy.Envelope;
      bounds = [env.lowerCorner.split(" ").map(v=>+v).reverse(),env.upperCorner.split(" ").map(v=>+v).reverse()]
      bounds = BoundsScale(bounds,2)
    }catch(e){
      let l = state.context.comparable.location;
      let d = 0.15;
      bounds = [[l[0]-d,l[1]-d],[l[0]+d,l[1]+d]];
    }
    return {
      ...state,
      context : {
        ...state.context,
        enviroment : {
          ...state.context.enviroment,
          bounds : bounds,
        }
      }
    }
  },
  [actions.changeContext]: (state,action)=>({
    ...state,
    context : lmerge({},state.context,action.payload),
  }),
  [actions.changeFavoriteOK]: (state,action)=>({
    ...state,
    context : {
      ...state.context,
      favoriteIDs : luniq([
        ...Object.keys(action.payload.favoriteIDs),
        ...state.context.favoriteIDs,
      ].filter(id=>action.payload.favoriteIDs[id]!==false)),
    },
  }),
  [actions.addOfferToReportOK]: (state,action)=>({
    ...state,
    context : {
      ...state.context,
      enviroment : {
        ...state.context.enviroment,
        addedOfferIDs : luniq([
          action.payload.id,
          ...(state.context.enviroment.addedOfferIDs||[]),
        ]),
      },
    },
  }),
  [actions.changeLayout]: (state,action)=>({
    ...state,
    layout:{
      ...state.layout,
      ...action.payload,
    },
  }),
  [actions.loading]: (state,action)=>({
    ...state,
    loading : action.payload.loading,
  }),
  [actions.tableScroll]: (state,action)=>({
    ...state,
    tableScroll : action.payload.scroll,
  }),
}, {
  filter    : Filter(),
  context   : {
  },
  token     :  "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFkc2FkcyIsImV4cCI6OTAwMDAwMTQ3MDgzMjc5N30.nARQ90Cf0nJqZFFp3a-LN9HY9sqb6m2c6cA1KQarUXE",
  offers    : {},
  offerIDs  : [],
  errors    : [],
  layout    : {
    left  : [300,1000],
    right : [400,1000],
    center: [0, 0],
  },
  loading : false,
  tableScroll : 0,
});
