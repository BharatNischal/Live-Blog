import React from 'react'
import {NavLink} from 'react-router-dom';
import Axios from 'axios';
import {withRouter} from 'react-router-dom';

const SignedInLinks = (props)=>{
    console.log('props of SignedInLinks',props);

    const handleMystories = ()=>{
      Axios.get("/blog-api/mystories")
        .then(res=>{
          props.history.push('/temp', {result:res.data});
        })
        .catch(err=>{
          console.log(err.message);
        })
    };
    const handleFollowing = ()=>{
      Axios.get("/blog-api/following")
        .then(res=>{
          props.history.push('/temp', {result:res.data});
        })
        .catch(err=>{
          console.log(err.message);
        })
    }

    const handleBookmarks = ()=>{
      console.log("bookmark clicked");
      Axios.get("/blog-api/bookmarks")
        .then(res=>{
          console.log("results",res.data);
          props.history.push('/temp', {result:res.data});
        })
        .catch(err=>{
          console.log(err.message);
        })
    };

    const handleSignOut = (e)=>{
        //e.preventDefault();
        Axios.get("/api/logout")
        .then(res=>{
            if(res.data.msg){
                props.logout(undefined);
                props.history.push('/');
            }

        }).catch(err=>{
            alert(err);
        });

    };
    return (
            [<li className="nav-item mx-2"><NavLink className="nav-link text-white" to="/createBlog">Add Story</NavLink></li>,
            <li className="nav-item dropdown mx-2">
              <a className="nav-link dropdown-toggle text-white" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {props.user.name}
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown" style={{padding:"5px"}}>
                <img src={props.user.authorURL} className="img-fluid mx-auto" style={{borderRadius:"50%",height:'60px',width:'60px'}}/>
                <a className="dropdown-item" href="#" onClick={handleMystories}>My Stories</a>
                <a className="dropdown-item" href="#" onClick={handleFollowing}>Following</a>
                <a className="dropdown-item" href="#" onClick={handleBookmarks}>Bookmarks</a>
              </div>
            </li>,
            <li className="nav-item mx-2"><NavLink className="nav-link text-white" onClick={handleSignOut} to="/">LogOut</NavLink></li>
          ]
        );
};

export default withRouter(SignedInLinks);
