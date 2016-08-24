import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'

import {connect} from 'react-redux'

import {loadApi} from './Api'
import {requestComparableBounds,changeContext} from 'actions'
import s from './YMap.sass'

import {BoundsScale,InBounds} from 'lib/Map'

import vars from 'styles/global.var.scss'

import Popover from "./Popover"

const TimerDT = 300;


function getXY (b,p,width,height){
  let y = (p[0]-b[0][0])*height/(b[1][0]-b[0][0])
  let x = (p[1]-b[0][1])*width/(b[1][1]-b[0][1])
  return [x,y];
}

function MoveCenter(center,b,dx,dy,width,height){
  dy = -dy*(b[1][0]-b[0][0])/height;
  dx = -dx*(b[1][1]-b[0][1])/width;
  return [center[0]+dy,center[1]+dx];
}

@connect(({cian}) =>({
  offers      : cian.offers,
  offerIDs    : cian.offerIDs,
  comparable  : cian.context.comparable,
  enviroment  : cian.context.enviroment,
  layout      : cian.layout,
}),{requestComparableBounds,changeContext})
class YMap extends Component {
  constructor (props){
    super(props);
    this.now = {};
    this.buildBalloon = ::this.buildBalloon;
  }
  async componentDidMount (){
    await this.tryInit(this._props || this.props);
    await this.draw(this._props || this.props)
  }
  moveToPopover (coords){
    let width = $(this.refs.map).width();
    let height = $(this.refs.map).height();
    let bounds = this.map.getBounds();
    let [x,y] = getXY(bounds,coords,width,height)
    let dx = 0;
    let dy = 0;

    let lt  = this.props.layout;
    let top,left,right,bottom;
    let g = vars.gutter*2;
    let l = x-vars.mapPopoverWidth/2-g;
    let r = x+vars.mapPopoverWidth/2+g;
    let t = height- y-vars.mapPopoverHeight-15-g;
    let b = height -y + g;
    
    let p = [];
    
    if(l+dx < lt.left[0]){
      if(t+dy<lt.left[1] && lt.left[0]-l<lt.left[1]-t)
          dx = lt.left[0]-l;
      else if (t+dy<lt.left[1])
        p.push(lt.left[1]);
    }
    if(r+dx > width-lt.right[0]){
      if(t+dy<lt.right[1] && (-width+lt.right[0]+r)<(lt.right[1]-t))
        dx = width-lt.right[0]-r
      else if (t+dy<lt.right[1])
        p.push(lt.right[1]);
    }
    if(p.length){
      p = Math.max(...p,lt.center[1])
    
      if(t<p) dy = p - t;
      if(b+dy>height){
        dy = height-b;
        if(l+dx < lt.left[0])  dx = lt.left[0]-l;
        if(r+dx > width-lt.right[0]) dx = width-lt.right[0]-r;
      }
    }
    

    if(t+dy<lt.center[1]) dy = lt.center[1]-t;
    if(b+dy>height)  dy = height-b;
    if(r+dx>width)   dx = width-r;
    if(l+dx<0)       dx = -l;
    
    dy = -dy;

    if(dx || dy){
      let center = MoveCenter(this.map.getCenter(),bounds,dx,dy,width,height);
      setTimeout(function(){
        this.map.panTo(center,{
          delay : false,
          duration : 200,
        });
      }.bind(this),10);
    }
  }
  async tryInit (props){
    if(this.inited) return;
    if(!props.enviroment)
      return;
    if(!props.enviroment.bounds){
      if(this.requestingBounds)
        return;
      this.requestingBounds = true;
      return props.requestComparableBounds();
    }
    this.inited = 1;
    await loadApi();
    let centerZoom = ymaps.util.bounds.getCenterAndZoom(
      props.enviroment.bounds,
      [$(this.refs.map).width(),$(this.refs.map).height()],
      null, {
        inscribe : false,
      }
    );
    let that = this;
    this.layout = ymaps.templateLayoutFactory.createClass( `<div></div>`, {
        build: function(){ that.buildBalloon(this,...arguments) },
    });


    this.map = new ymaps.Map(this.refs.map, {
        ...centerZoom,
        behaviors : ["default","scrollZoom"],
    },{
      adjustZoomOnTypeChange : true,
    });
    this.clusterer = new ymaps.Clusterer({
      clusterDisableClickZoom: true,
      gridSize : 64,
      clusterBalloonLayout: this.layout,
      clusterBalloonShadow : false,
      clusterBalloonAutoPan : false,
    });
    this.map.geoObjects.add(this.clusterer)
    this.inited = 2;
    this.props.changeContext({
      enviroment : {
        bounds : this.map.getBounds(),
      }
    })
    this.map.events.add('boundschange',::this.boundschange)
  }
  buildBalloon (o){
    global.o = o;
    this.layout.superclass.build.call(o);
    let marks = [];
    let pm = o.getData();
    pm = pm.geoObject || pm.cluster;

    if(o.getData().properties.getAll().id){
      marks = [o.getData()];
    }else {
      marks = o.getData().properties.getAll().geoObjects
    }
    
    let ids = marks.map(m=>m.properties.get("id"))
    
    let offers = ids.map(id=>this.props.offers[id]);
    
    this.moveToPopover(marks[0].geometry.getCoordinates())

    ReactDOM.unstable_renderSubtreeIntoContainer(this,(
      <Popover 
        offers={offers} 
        onClose={()=> pm.balloon.close()}
      />
    ), o.getElement());
  }
  boundschange (){
    this.time = new Date().getTime();
    if(!this.timer)
      this.timer = setTimeout(::this.onTimer,TimerDT);
  }
  onTimer (){
    let time = new Date().getTime();
    let dt = time - this.time;
    if(dt<TimerDT)
      return this.timer = setTimeout(::this.onTimer,TimerDT-dt)
    this.timer = undefined;
  
    this.props.changeContext({
      enviroment : {
        bounds : this.map.getBounds(),
      }
    })
  }
  componentWillUnmount (){
    if(!this.inited) return; // w8 for first map draw
    this.now = {};
    this.inited = 0;
    this.map.destroy();
  }
  async componentWillReceiveProps (props){
    this._props = props;
    await this.tryInit(this._props);
    await this.draw(this._props);
  }
  shouldComponentUpdate (){
    return false;
  }

  async draw (props){
    if(this.inited!=2) return; // w8 for first map draw
    let add = props.offerIDs.filter( id => {
      return !this.now[id] && 
              props.offers[id] && 
              InBounds(BoundsScale(props.enviroment.bounds,1.5),props.offers[id].location)
    })
    // del
    let del = [];
    let ids = {};
    props.offerIDs.map( id => ids[id] = true );
    for(let id in this.now)
      if( !props.offers[id] || 
          !ids[id] || 
          !InBounds(BoundsScale(props.enviroment.bounds,1.5),props.offers[id].location))
        del.push(id);
    //*******
    
    if(del.length)
      this.clusterer.remove(del.map(id=>{
        let mark = this.now[id].placemark
        delete this.now[id];
        return mark;
      }))
    if(add.length)
      this.clusterer.add(add.map(id=>{
        let offer = props.offers[id];

        let placemark  = new ymaps.Placemark(offer.location, {
            openBalloonOnClick : true, 
            id : id,
        }, {
          balloonLayout: this.layout,
          balloonShadow : false,
          clusterBalloonAutoPan : false,
        });
        this.now[id] = {placemark};
        return placemark;
      }))
  }
  render (){ 
    return (
      <div ref="map" className={s.root}/>
    ) 
  }
}

export default YMap
