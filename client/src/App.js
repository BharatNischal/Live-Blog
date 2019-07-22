import React ,{Component} from 'react';
import {BrowserRouter,Route,Switch} from 'react-router-dom';
import './App.css';
import Signin from './components/auth/signinForm';
import Signup from './components/auth/signupForm';
import Nav from './components/layout/nav';
import CreateBlog from './components/blog/createBlog';
import Forget from './components/auth/forget';
import ResetPassword from './components/auth/resetPassword';
import Dashboard from './components/dashboard/dashboard';
import Temp from './components/dashboard/temp';
import DashboardSearch from './components/dashboard/dashboardSearch';
import DisplayBlog from './components/blog/displayBlog';
import UpdateBlog from './components/blog/updateBlog';
import Axios from 'axios';

class App extends  Component{

  state={
    user:undefined
  }
  componentDidMount(){
    Axios.get("/api/curUser")
    .then(res=>{
      console.log(res);
      if(!(res.data==="")){
        this.setState({user:res.data});
      }

      
    })
    .catch(err=>{
      console.log(err);
    });
  }

  loginHandler=(user)=>{
    this.setState({user});
  }
  render(){

    Axios.defaults.withCredentials = true;
    return (
      <BrowserRouter>
        <div className="App">
          <Nav user={this.state.user} logout={this.loginHandler} />
          <Switch>
            <Route exact path='/' component={Dashboard} />
            <Route exact path='/temp' component={Temp} />
            <Route exact path='/search' component={DashboardSearch} />
            <Route exact path='/forget' component={Forget}/>
            <Route exact path='/createBlog' component={CreateBlog}/>
            <Route exact path="/signin"
              render={(props) => <Signin {...props} isLogin={this.state.user} login={this.loginHandler} />}
            />
            <Route exact path="/signup"
              render={(props) => <Signup {...props} isLogin={this.state.user} login={this.loginHandler} />}
            />
            <Route exact path="/blog/:blogId" 
              render={(props) => <DisplayBlog {...props} curUser={this.state.user}  />}
            />
            <Route exact path="/reset/:token" component={ResetPassword}/>
            <Route exact path="/blog/:blogId/edit"  
              render={(props) => <UpdateBlog {...props} isLogin={this.state.user} />}
            />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
