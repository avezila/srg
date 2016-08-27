import React, {Component, PropTypes} from 'react'
import Alert    from 'react-bootstrap/es/Alert'
import Collapse from 'react-bootstrap/es/Collapse'

import s from './ErrorItem.sass'


export default
class ErrorItem extends Component {
  static propTypes = {
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    type     : PropTypes.string,
    msg      : PropTypes.string,
    e        : PropTypes.object,
    show     : PropTypes.bool.isRequired,
    onClick  : PropTypes.func.isRequired,
    onRemove : PropTypes.func.isRequired,
  }
  static defaultProps = {
    type : '',
    msg  : '',
    e    : {},
  }
  onClick = () => {
    this.props.onClick(this.props.id)
  }
  onDismiss = () => {
    this.props.onRemove(this.props.id)
  }
  render () {
    let {type, msg, show, e} = this.props
    return (
      <Alert
        className={s.item}
        bsStyle='danger'
        onDismiss={this.onDismiss}>
        <div className={s.item_title} onClick={this.onClick}>
          <strong>{`${type} ERROR`}</strong>
          {msg}
        </div>
        { e ? (
          <Collapse in={show}>
            <pre className={s.item_inner}>
              {e.message}
              {e.stack}
            </pre>
          </Collapse>) : null}
      </Alert>
    )
  }
}
