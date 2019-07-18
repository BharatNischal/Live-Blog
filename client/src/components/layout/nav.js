import React,{Component} from 'react';
import {NavLink} from 'react-router-dom';
import SigninLinks from './signinLinks';
import SignoutLinks from './signoutLinks';
import {withRouter} from 'react-router-dom';
import axios from 'axios';


class Nav extends Component{
  constructor(props){
    super(props);
    this.state = {
      titleSearch:''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGenre = this.handleGenre.bind(this);
  }

  handleChange(e){
    this.setState({[e.target.name]:e.target.value});
  };

  handleGenre(e){
    e.preventDefault();
    var genre = e.target.innerText.toLowerCase();
    axios.post('/blog-api/search/genre',{genre})
      .then(res=>{
        console.log(res.data);
        this.props.history.push('/temp', {result:res.data})
      })
        .catch(err=>{

        })
  }

  handleSubmit(e){
    e.preventDefault();
    axios.post('/blog-api/search',{titleSearch:this.state.titleSearch})
      .then(res=>{
        console.log(res.data);
        this.props.history.push('/temp', {result:res.data})
      })
        .catch(err=>{

        });
  }

  render(){
    var login = this.props.user;
    const links = login?<SigninLinks user={this.props.user} logout={this.props.logout}/>:<SignoutLinks />;
    return(
      <nav className="navbar navbar-expand-md navbar-light sticky-top" style={{backgroundColor:'#39424E'}}>
        <NavLink className="navbar-brand text-white" to="/" >Live Blog</NavLink>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">

          <li className="nav-item dropdown mx-2">
            <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Categories
            </a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <a className="dropdown-item" href="#" onClick={this.handleGenre}>Tech</a>
              <a className="dropdown-item" href="#" onClick={this.handleGenre}>Culture</a>
              <a className="dropdown-item" href="#" onClick={this.handleGenre}>Sports</a>
              <a className="dropdown-item" href="#" onClick={this.handleGenre}>Other</a>
            </div>
          </li>

          <form className="form-inline my-2 my-lg-0 mx-2" onSubmit={this.handleSubmit} id="search">
            <input onChange={this.handleChange} name='titleSearch' type="search" placeholder="Search" aria-label="Search" style={{background:'inherit',border:'none',borderBottom:'2px solid white',color:'#e3e8e8'}}/>
            <button type="submit" style={{backgroundColor:'transparent',border:'none',margin:'none'}}><i className="fa fa-search" aria-hidden="true" style={{cursor:'pointer',color:'white'}}></i></button>
          </form>

          {links}

          </ul>
        </div>
      </nav>
    );
  }
}

export default withRouter(Nav);
