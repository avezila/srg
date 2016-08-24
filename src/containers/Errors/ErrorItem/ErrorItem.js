import React, {Component} from 'react'
import Alert from "react-bootstrap/es/Alert"
import Collapse from "react-bootstrap/es/Collapse"

import s from "./ErrorItem.sass"


class ErrorItem extends Component {
  render (){
    return (
      <Alert 
        className={s.item} 
        bsStyle="danger" 
        onDismiss={()=>this.props.onRemove(this.props.id)}>
        <div className={s.item_title} onClick={()=>this.props.onClick(this.props.id)}>
        <strong>{(this.props.type||"") + " ERROR"}</strong> {this.props.msg ||""}
        </div>
        {(this.props.e)?(
          <Collapse in={this.props.show}>
            <pre className={s.item_inner}>
            {this.props.e.message}
            {this.props.e.stack}
            </pre>
          </Collapse>
        ): undefined }
      </Alert>
    );
  }
}

export default ErrorItem;