import React, { Component, PropTypes } from 'react'
import FormGroup from 'react-bootstrap/es/FormGroup'
import InputGroup from 'react-bootstrap/es/InputGroup'
const Addon = InputGroup.Addon

import {Mask} from 'components/fields'
import DateTimeField from 'react-bootstrap-datetimepicker'
import 'react-bootstrap-datetimepicker/css/bootstrap-datetimepicker.css'
import Timeout from 'lib/Timeout'

import s from './FromTo.sass'


let to2 = s => ('' + s).length === 1 ? '0' + s : s

export default
class FromTo extends Component {
  static propTypes = {
    value: PropTypes.shape({
      data: PropTypes.shape({
        from : PropTypes.string.isRequired,
        to   : PropTypes.string.isRequired,
      }),
      type    : PropTypes.string.isRequired,
      pattern : PropTypes.string.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
  }
  constructor (props) {
    super(props)
    this.state = {
      value: props.value.data,
    }
  }
  componentWillReceiveProps (props) {
    this.setState({
      value: props.value.data,
    })
  }
  onChangefrom = () => this.onChange('from')
  onChangeto = () => this.onChange('to')
  onChange (field, text) {
    if (this.props.value.type === 'date') {
      if (!text.match(/\d\d\d\d-\d\d-\d\d/)) {
        text = undefined
      }
    }
    this.setState({
      value: {
        ...this.state.value,
        [field]: text,
      }
    })
    Timeout(this.timeout)
  }
  timeout = () => {
    this.props.onChange(this.state.value)
  }
  renderInput (field, pref) {
    let onChange = this[`onChange${field}`]
    switch (this.props.value.type) {
      case 'input':
        return (
          <InputGroup className={s.input_group}>
            <Addon>{pref}</Addon>
            <Mask
              type={this.props.value.pattern}
              value={this.state.value[field]}
              onChange={onChange} />
          </InputGroup>
        )
      case 'date':
        let d = new Date()
        return (
          <InputGroup className={s.input_group_date}>
            <Addon>{pref}</Addon>
            <DateTimeField
              mode='date'
              dateTime={`${d.getFullYear()}-${to2(d.getMonth())}-${to2(d.getDate())}`}
              format='YYYY-MM-DD'
              ref={'date' + field}
              viewMode='date'
              defaultText={this.state.value[field] || ''}
              inputFormat='YYYY-MM-DD'
              onChange={onChange}
              inputProps={{
                onBlur  : ((field, e) => this.onChange(field, e.target.value)).bind(this, field),
                onFocus : () => this.refs['date' + field].onClick(),
              }}
            />
          </InputGroup>
        )
    }
  }

  render () {
    return (
      <FormGroup className={s.form_group}>
        {this.renderInput('from', 'от')}
        {this.renderInput('to', 'до')}
      </FormGroup>
    )
  }
}
