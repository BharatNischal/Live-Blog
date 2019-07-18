import React,{Component} from 'react';
import axios from 'axios';
import openSocket from 'socket.io-client';
import Comments from './Comments/Comments';

class DisplayBlog extends Component{
  constructor(props){
    super(props);
    this.state = {
      title:'',
      authorURL:'',
      authorId:'',
      username:'',
      imageURL:'',
      content:'',
      blogId:'',
      isLive:false,
      cursor:-1,
      isAuthorised:true,
      liked:false,
      likesCount:0,
      bookmark:false,
      following:false,
      comments:[]
    };
    
    this.socket = openSocket(window.location.hostname);
    
    
    this.handleEdit = this.handleEdit.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleFollow = this.handleFollow.bind(this);
    this.handleBookmark = this.handleBookmark.bind(this);
    this.delHandler = this.delHandler.bind(this);
  }

  handleBookmark = function(){
    axios.post(`/blog-api/${this.props.match.params.blogId}/bookmark`,{add:!this.state.bookmark});
    var bookmark = this.state.bookmark;
    bookmark = !bookmark;
    this.setState({bookmark})
  }

  handleEdit = function(){
    this.props.history.push(`/blog/${this.props.match.params.blogId}/edit`)
  }

  handleLike = function(){
    axios.post(`/blog-api/${this.props.match.params.blogId}/likes`,{add:!this.state.liked});
    var {liked,likesCount} = this.state;
    liked = !liked;
    this.state.liked?likesCount--:likesCount++;
    this.setState({liked,likesCount});
  }

  handleFollow = function(){
    axios.post(`/blog-api/${this.state.authorId}/follow`,{add:!this.state.following});
    var following = this.state.following;
    following = !following;
    this.setState({following});
  }

  delHandler=()=>{
    axios.delete(`/blog-api/${this.props.match.params.blogId}`)
    .then(res=>{
      if(res.data.msg==="deleted Successfully"){
        this.props.history.push("/");
      }
    })
    .catch(err=>{
      console.log(err);
    });
  }
  componentDidMount(){
    const displayBlog = this;
    axios.get(`/blog-api/${this.props.match.params.blogId}`)
      .then(res=>{
        console.log(res.data);
        const {title,imageURL,content} = res.data
        const {authorURL} = res.data.author;
        const username = res.data.author.name;
        const authorId = res.data.author.id;
        const blogId = res.data._id;
        const liked = res.data.curUser?res.data.likes.includes(res.data.curUser._id):false;
        const following = res.data.curUser?res.data.curUser.following.includes(res.data.author.id):false;
        const likesCount = res.data.likes.length;
        const bookmark = res.data.curUser?res.data.bookmarks.includes(res.data.curUser._id):false;
        const isLive=res.data.isLive;
        const isAuthorised = res.data.curUser?res.data.author.id===res.data.curUser._id:false;

        const comments=res.data.comments;
        this.setState({title,authorURL,imageURL,content,username,blogId,isLive,isAuthorised,liked,likesCount,bookmark,comments,authorId,following});
      })
      .catch(err=>{
        console.log(this.props.match.params.blogId);
        console.log(err);
      });

      this.socket.on('updateContent-keypress',function (data) {
        const updating = document.getElementById('updating');
        updating.innerText = "Updating...";
        setTimeout(()=>{
          updating.innerText = "";
        },1000)
        if(data.blogId ===displayBlog.state.blogId){
            if(data.x===13){
              data.x=10;
            }
            const par = displayBlog.state.content===''?'': displayBlog.state.content.substring(0,data.a)+String.fromCharCode(data.x) + displayBlog.state.content.substring(data.b);
            displayBlog.setState({content:par,cursor:data.a+1});
        }
      });

      this.socket.on('updateContent-keyup',function (data) {
        const updating = document.getElementById('updating');
        updating.innerText = "Updating...";
        setTimeout(()=>{
          updating.innerText = "";
        },1000)
        if(data.blogId ===displayBlog.state.blogId){
         if(data.a===data.b){
            if(data.x==8){
              const par = displayBlog.state.content.substring(0,data.a) + displayBlog.state.content.substring(data.b+1);
              displayBlog.setState({content:par,cursor:data.a});
            }else if(data.x==32){
              const par = displayBlog.state.content.substring(0,data.a-1) +" " + displayBlog.state.content.substring(data.a-1);
              displayBlog.setState({content:par,cursor:data.a+1});
            }
          }else{  //Selected more than 1 character
            if(data.x==8){
              if(displayBlog.state.content[data.a-2]==='\\'){
                const par = displayBlog.state.content.substring(0,data.a-1) + displayBlog.state.content.substring(data.b);
                displayBlog.setState({content:par});
              }else{
                const par = displayBlog.state.content.substring(0,data.a) + displayBlog.state.content.substring(data.b);
                displayBlog.setState({content:par});
              }
            }
         }
        }
      });
  }

  componentWillUnmount(){
    this.socket.disconnect();
  }

  render(){
    const liveCursorStyle={
      color:'green',
      fontSize:'24px',
      fontWeight:'20px',
      animation:'cursorAnimation 0.5s infinite'
      // position:'relative',
      // left:'3px'
    };
    const authorStyle={
      backgroundColor:'green',
      fontSize:'10px',
      color:'white',
      zIndex: '3',
      position:'Relative',
      top:'-18px'
    }
    const {title,imageURL,authorURL,username} = this.state;
    var {content} = this.state;
    content = this.state.cursor==-1?content:content.substring(0,this.state.cursor)+'%$'+content.substring(this.state.cursor); //%$ is just a symbol
    var modifiedContentarr=content.split('\n');
    var modifiedContent2 = modifiedContentarr.map((e,i)=>{
      return(
        <p className="text-left updateParagraph" style={{fontSize:'1.3em'}}>{e}</p>
      )
    });
  const modifiedContent =  modifiedContent2.map(function(p){
      const list = p.props.children.split('%$');
      if(list.length == 1){
        return p;
      }else{
        return <p className="text-left updateParagraph" style={{fontSize:'1.3em'}}><span>{list[0]}</span><span style={liveCursorStyle}>|</span><span style={authorStyle} >Updating</span><span>{list[1]}</span></p>
      }
    });
    return title ===""?<div className="container mt-5"><img src="https://loading.io/spinners/typing/lg.-text-entering-comment-loader.gif" className="img-responsive"/></div>:(
      <div className="container mt-5">
      <p id="updating" style={{position:'fixed',top:'60px',zIndex:'10',fontWeight:'bold',color:'blue',fontSize:'1.2em',width:'80vw'}} className="align-center"></p>
        <div className="row mb-5">
          <div className="col-md-6 sm-12">
            <h1 className="allign-middle mb-5 text-left">{title}</h1>
            <div>
              <img src={authorURL} style={{borderRadius:'50%',width:'80px'}} className="float-left"/>
              <span className="float-left text-primary ml-4" style={{fontSize:'1.3em',position:'relative',top:'20px'}}>{username}</span>
              {!(this.state.isAuthorised)?<button onClick={this.handleFollow} className={this.state.following?"btn-sm btn btn-secondary float-left ml-2":"btn-sm btn btn-outline-secondary float-left ml-2"} style={{position:'relative',top:'20px'}}>{this.state.following?"Following":"Follow"}</button>:null}
              {this.state.isAuthorised?<button className="btn-sm btn btn-outline-danger float-left ml-2" onClick={this.delHandler} style={{position:'relative',top:'20px'}}>Delete</button>:null}
              {this.state.isAuthorised?<button className="btn-sm btn btn-outline-primary float-left ml-2" onClick={this.handleEdit} style={{position:'relative',top:'20px'}}>Edit</button>:null}
            </div>
          </div>
          <div className="col-md-6 sm-12">
            <img src={imageURL} className="img-fluid" style={{maxHeight:'50vh'}}/>
          </div>
        </div>
        <div className="row mt-5 pt-5">
          <div className="col-md-1 col-sm-0"></div>
          <div className="col-md-10 col-sm-12">
          {modifiedContent}
          </div>
          <div className="col-md-1 col-sm-0"></div>
        </div>
        <div style={{fontSize:'1.5em'}}>
        <span className="text-primary">{this.state.likesCount} </span>Like{this.state.likesCount>1?"s":null}{this.state.liked?<i className="fa fa-heart text-danger" aria-hidden="true" onClick={this.handleLike}></i>:<i className="fa fa-heart-o text-danger" aria-hidden="true" onClick={this.handleLike}></i>}
        <span className="ml-5 mr-5">{this.state.bookmark?<i class="fa fa-bookmark" aria-hidden="true" onClick={this.handleBookmark}> Bookmarked</i>:<i class="fa fa-bookmark-o" aria-hidden="true" onClick={this.handleBookmark}> Bookmark</i>}</span>
        </div>
        <Comments curUser={this.props.curUser} comments={this.state.comments}/>
      </div>
    );
  }

}

export default DisplayBlog;
