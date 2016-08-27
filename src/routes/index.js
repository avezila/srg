import React, {PropTypes} from 'react'
import { Route, IndexRoute, IndexRedirect, Redirect } from 'react-router'

import {YMap, Filter, ErrorCode, Content, Favorite} from 'components'
import CoreLayout from 'containers/CoreLayout'


const LayoutFilter = ({children}) => (
  <CoreLayout>
    <Filter />
    <Favorite />
    <YMap />
    {children}
  </CoreLayout>
)
LayoutFilter.propTypes = {
  children: PropTypes.node,
}

const LayoutError403 = () => (
  <CoreLayout>
    <ErrorCode
      title='Access Denied'
      content='Sorry, but you do not have permissions to view this page.' />
  </CoreLayout>
)

const LayoutError404 = () => (
  <CoreLayout>
    <ErrorCode
      title='Page Not Found'
      content='Sorry, but the page you were trying to view does not exist.' />
  </CoreLayout>
)


const MainRoute = () => (
  <Route path='/'>
    <IndexRedirect to='/map' />
    <Route path='/map' component={LayoutFilter} />
    <Route path='/table' component={LayoutFilter}>
      <IndexRoute components={Content} />
    </Route>
    <Route path='/offer-*' component={LayoutFilter}>
      <IndexRoute components={Content} />
    </Route>
    <Route path='/403*' components={LayoutError403} />
    <Route path='/404*' title='Page Not Found' components={LayoutError404} />
    <Redirect from='*' to='/404/*' />
  </Route>
)

export default MainRoute
