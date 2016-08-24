import React from 'react'

import s from './ErrorCode.sass'


export default function ErrorCode (props){
  return (
    <div className={s.root}>
      <div className={s.content}>
        <h1 className={s.h1}>{props.title}</h1>
        <p className={s.p}>{props.content}</p>
        {props.message}
      </div>
    </div>
  )
}