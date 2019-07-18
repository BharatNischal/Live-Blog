import React, {Component} from 'react';
import axios from 'axios';
import openSocket from 'socket.io-client';





class UpdateBlog extends Component{
    constructor(props){
      super(props);
    this.state = {
      title:"",
      content:"",
      imageURL:'',
      blogId:''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.socket= openSocket(window.location.hostname);
  }

  componentDidMount()
  {
    axios.get(`/blog-api/${this.props.match.params.blogId}`)
    .then(res=>{
      const {title,imageURL,content} = res.data
      const {authorURL,username} = res.data.author;
      const blogId = res.data._id;
      this.setState({title,authorURL,imageURL,content,username,blogId});
      if(res.data.curUser){
        if(username!==res.data.curUser.username ){

          this.props.history.goBack();
        }
      }else{
        this.props.history.goBack();
      }

    })
    .catch(err=>{
      console.log(this.props.match.params.blogId);
      console.log(err);
    });


  }

  componentWillUnmount(){
    this.socket.disconnect();
  }
  handleChange(e){
    this.setState({[e.target.name]:e.target.value});
  };

  handleKeyPress(e){
    const updateBlog = this;
    var startPosition = document.querySelector('.updateContent').selectionStart;
    var endPosition = document.querySelector('.updateContent').selectionEnd;
    var x = e.charCode || e.keyCode || e.which;
      if(x!=32){

        console.log("keypress");

        axios.put(`/blog-api/${this.state.blogId}`,{title:this.state.title,content:this.state.content,imageURL:this.state.imageURL})
          .then(res=>{
            const updating = document.getElementById('updating');
            updating.innerText = "Saving...";
            setTimeout(()=>{
              updating.innerText = "";
            },1000)
          })
          .catch(err=>{
            alert(err.message);
          });
        setTimeout(()=>{
          this.socket.emit('updateContent-keypress',{
            a:startPosition,
            b:endPosition,
            x:x,
            blogId:updateBlog.state.blogId
          });
        },2000)
      }
  }

  handleKeyUp(e){

    const updateBlog = this;
    var startPosition = document.querySelector('.updateContent').selectionStart;
    var endPosition = document.querySelector('.updateContent').selectionEnd;
    console.log('positions are',startPosition,endPosition);
    var x = e.charCode || e.keyCode || e.which;  // Get the Unicode value
    // Check if you've selected text
      if((x==8) && startPosition==0&&endPosition!=0){
      }
      else if(x==8){  //backspace
        console.log("keyup");

        axios.put(`/blog-api/${this.state.blogId}`,{title:this.state.title,content:this.state.content,imageURL:this.state.imageURL})
          .then(res=>{

            const updating = document.getElementById('updating');
            updating.innerText = "Saving...";
            setTimeout(()=>{
              updating.innerText = "";
            },1000)
          })
          .catch(err=>{
            alert(err.message);
          });

          setTimeout(()=>{
            this.socket.emit('updateContent-keyup',{
              a:startPosition,
              b:endPosition,
              x:x,
              blogId:updateBlog.state.blogId
            });
          },2000)

      }else if(x==32){  //space
        console.log("keyup");

        axios.put(`/blog-api/${this.state.blogId}`,{title:this.state.title,content:this.state.content,imageURL:this.state.imageURL})
          .then(res=>{
            const updating = document.getElementById('updating');
            updating.innerText = "Saving...";
            setTimeout(()=>{
              updating.innerText = "";
            },1000)
          })
          .catch(err=>{
            alert(err.message);
          });

          setTimeout(()=>{
            this.socket.emit('updateContent-keyup',{
              a:startPosition,
              b:endPosition,
              x:x,
              blogId:updateBlog.state.blogId
            });
          },2000)
      }
}

  render(){

    const {title,imageURL,content,authorURL,username} = this.state;
    const contentStyle = {
      width:'80vw',
      height:'60vh',
      border:'none',
      fontSize:'1.2em'
    }

    return title ===""?<img src="https://loading.io/spinners/typing/lg.-text-entering-comment-loader.gif"/>:(
      <div className="container mt-5">
        <p id="updating" style={{position:'fixed',top:'60px',zIndex:'10',fontWeight:'bold',color:'while',fontSize:'1.2em',width:'80vw'}} className="align-center"></p>
        <div className="row mb-5">
          <div className="col-md-6 sm-12">
            <h1 className="allign-middle mb-5 text-left">{title}</h1>
            <div>
              <img src={authorURL} style={{borderRadius:'50%',width:'80px'}} className="float-left"/>
              <span className="float-left text-primary ml-4" style={{fontSize:'1.3em',position:'relative',top:'20px'}}>{username}</span>
            </div>
          </div>
          <div className="col-md-6 sm-12">
            <img src={imageURL} className="img-fluid" style={{maxHeight:'50vh'}}/>
          </div>
        </div>
        <div className="row mt-5 pt-5">
          <div className="col-md-1 col-sm-0"></div>
          <div className="col-md-10 col-sm-12">
          <textarea onKeyPress={this.handleKeyPress} onKeyUp={this.handleKeyUp} name="content" id="content" style={contentStyle} value={this.state.content} onChange={this.handleChange} className="mt-3 updateContent" placeholder="Start your story..."></textarea>
          </div>
          <div className="col-md-1 col-sm-0"></div>
        </div>
        <button className="btn-sm btn btn-outline-primary ml-2" style={{margin:'10px 0'}}onClick={()=>this.props.history.push("/")}>Finish</button>
      </div>
    );
}

}
export default UpdateBlog;
