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
    var socketurlArr=window.location.href.split("/");
    socketurlArr.splice(3);
    console.log(socketurlArr.join("/"));
    this.socket = openSocket(socketurlArr.join("/"));
    
    
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

      this.socket.on('updateContent',function (data) {
        const updating = document.getElementById('updating');
        updating.innerText = "Updating...";
        setTimeout(()=>{
          updating.innerText = "";
        },1000)
        if(data.blogId ===displayBlog.state.blogId){
            displayBlog.setState({content:data.content,cursor:data.cursor});
        }
      });
  }
  componentDidUpdate(prevProps){
    //log state
    console.log("Display Blog State, Cursor: ",this.state.cursor," , content: ",this.state.content);
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
    var preContent = this.state.cursor==-1?content:content.substring(0,this.state.cursor)
    var postContent = this.state.cursor==-1?"":content.substring(this.state.cursor); //%$ is just a symbol
    return title ===""?<img src="https://loading.io/spinners/typing/lg.-text-entering-comment-loader.gif"/>:(
      <div className="container mt-5">
      <p id="updating" style={{position:'fixed',top:'60px',zIndex:'10',fontWeight:'bold',color:'blue',fontSize:'1.2em',width:'80vw'}} className="align-center"></p>
        <div className="row mb-5">
          <div className="col-md-6 sm-12 mb-4">
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
              <div>
              <p className="text-left">
               <span className="text-left updateParagraph" style={{fontSize:'1.3em',whiteSpace:'pre-wrap'}}> {preContent}</span>
               {this.state.cursor==-1?null:<span style={liveCursorStyle}>|</span>}
               {this.state.cursor==-1?null:<span style={authorStyle} >Updating</span>}
               <span className="text-left updateParagraph" style={{fontSize:'1.3em',whiteSpace:'pre-wrap'}}>{postContent}</span>
              </p>
              </div>
          </div>
          <div className="col-md-1 col-sm-0"></div>
        </div>
        <div style={{fontSize:'1.5em'}}>
        <span className="text-primary">{this.state.likesCount} </span>Like{this.state.likesCount>1?"s":null}{this.state.liked?<i className="fa fa-heart text-danger" aria-hidden="true" onClick={this.handleLike}></i>:<i className="fa fa-heart-o text-danger" aria-hidden="true" onClick={this.handleLike}></i>}
        <span className="ml-5 mr-5">{this.state.bookmark?<i class="fa fa-bookmark" aria-hidden="true" onClick={this.handleBookmark}> Bookmarked</i>:<i class="fa fa-bookmark-o" aria-hidden="true" onClick={this.handleBookmark}> Bookmark</i>}</span>
        </div>
        <Comments authorURL={authorURL} comments={this.state.comments}/>
      </div>
    );
  }

}

export default DisplayBlog;
