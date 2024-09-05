import React, { useEffect } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from './AuthContext';
interface AuthGuardProps extends RouteProps {
    component: React.ComponentType<any>;
  }

const AuthGuard:React.FC<AuthGuardProps>= ({ component: Component, ...rest }) => {
    const { isLoggedIn } = useAuth();
  

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  )
}

export default AuthGuard;
