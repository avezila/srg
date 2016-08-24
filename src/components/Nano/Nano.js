import React, { Component, PropTypes } from 'react'
import 'nanoscroller/bin/javascripts/jquery.nanoscroller.js'
import 'nanoscroller/bin/css/nanoscroller.css'

import Timeout from 'lib/Timeout'

import s from './Nano.sass'


export default
class Nano extends Component {
  static propTypes = {
    byContent : PropTypes.bool, 
    children  : PropTypes.node.isRequired,
    onChange  : PropTypes.func,
    onScroll  : PropTypes.func,
    className : PropTypes.string,
    style     : PropTypes.object,
  }
  static defaultProps = {
    byContent : false,
    onChange  : ()=>{},
    className : "",
  }
  async nano (flush){
    await Promise.delay(0)
    if(this.props.byContent){
      $(this.refs.root).css('padding',"");
      let max = $(this.refs.root).outerHeight()-$(this.refs.nano).outerHeight()+$(this.refs.body).outerHeight()+0; // 2px fix for ie
      $(this.refs.root).css({
        'max-height':max,
      });
    }
    await Promise.delay(0)
    $(this.refs.nano).nanoScroller();
    this.onChange()

    if(!flush){
      await Promise.delay(100)
      await this.nano(true)
    }

  }
  componentDidMount (){
    if(this.props.byContent)
      $(this.refs.root).css({
        'max-height': 0,
        'padding' : 0,
      });

    this.nano()
    $(window).resize(::this.nano)
  }
  componentDidUpdate (){
    this.nano()
  }
  componentWillUnmount (){
    $(this.refs.nano).nanoScroller({destroy:true});
  }
  update (){
    this.nano()
  }
  height (){
    return $(this.refs.root).outerHeight();
  }
  scrollTop(){
    return $(this.refs.content).scrollTop();
  }
  onChange (){
    Timeout(this.timeout,null,200,false)
  }
  timeout = ()=> {
    let h = this.height()
    if(h == this._height) return;
    this._height = h;
    this.props.onChange();
  }
  render () {
    return (
      <div 
        ref="root" 
        onScroll={this.props.onScroll} 
        style={this.props.style} 
        className={`${this.props.className} ${s.root}`}>
        <div  ref="nano" className="nano">
          <div ref="content" className={s.content+" nano-content"}>
            <div ref="body" className={s.body}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}