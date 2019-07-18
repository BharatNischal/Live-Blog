import React from 'react';
import {withRouter,Link} from 'react-router-dom';

const BlogList = (props)=>{
  let projects = <img src="https://cdn.dribbble.com/users/308895/screenshots/2598725/no-results.gif" style={{margin:'0 auto',height:'90vh'}}/>;
  console.log(props);
  if(props.blogs && props.blogs.length>0){
    projects = props.blogs.filter(e=>{
      if(e){
        return true;
      }
      return false;
    }).map((b)=>(
      <React.Fragment key={b._id} >
      {/* <div className="container col-sm-12 col-md-5 mt-4 mb-4 " style={{boxShadow:'0px 0px 10px 4px #aaa'}}>
        <div className="row">
          <img src={b.imageURL}  style={{width:'100%', height:'30vh'}} alt="blog image"/>
          <div style={{position:'relative',bottom:'40px',padding:'10px'}}>
            <img src={b.author.authorURL} style={{borderRadius:'50%',width:'80px',float:'left'}} />
            <span className="float-right mt-5">By :<span className="text-primary">{b.author.username}</span></span>
            <span className="float-right">{b.created_date}</span>

          </div>
        </div>
        <div className="row">
        <h2 className=" text-left float-left p-3"><Link to={`/blog/${b._id}`} >{b.title}</Link></h2>
        <p className="text-left float-left p-3" style={{height:'30vh',overflow:'hidden'}}>{b.content}</p>
        </div>
        <div className="row ">

          <button type="button" className="  btn btn-outline-success" onClick={()=>props.history.push(`/blog/${b._id}`)}>Read this post</button>
        </div>

      </div> */}
      <div className="card blog col-sm-10 col-md-5 mt-4 mb-4 ml-4 p-0" style={{boxShadow:'0px 0px 15px 7px #444'}}>

          <img src={b.imageURL}  className="card-img-top" style={{width:'100%'}} alt="blog image"/>
          <div style={{position:'relative',bottom:'40px',padding:'10px'}}>

              <img src={b.author.authorURL} style={{borderRadius:'50%',width:'80px',float:'left'}} />

              <span className="float-right mt-5 authCardTxt" >By :<span className="text-primary">{b.author.name}</span></span>
              <span className="float-right authCardTxt" >{b.created_date}</span>

          </div>


        <h2 className="card-title text-left float-left  pl-3 pr-3"><Link to={`/blog/${b._id}`} >{b.title}</Link></h2>
        <div className="card-body">
          <p className=" card-title text-left float-left " style={{overflow:'hidden'}}>{b.content.slice(0,100)+"..."}</p>
          <button type="button" className="  btn  btn-outline-success" onClick={()=>props.history.push(`/blog/${b._id}`)}>Read this post</button>
        </div>
        <div className="card-footer" >
          {b.isLive?<span className="btn btn-outline-success float-right" style={{animation:'cursorAnimation 0.5s infinite'}}>Live</span>:null}


        </div>

      </div>

      </React.Fragment>
    ));
  }
  return projects;
}

export default withRouter(BlogList);
