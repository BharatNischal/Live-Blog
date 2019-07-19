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
    // this.handleKeyPress = this.handleKeyPress.bind(this);
    // this.handleKeyUp = this.handleKeyUp.bind(this);
    var socketurlArr=window.location.href.split("/");
    socketurlArr.splice(3);
    console.log(socketurlArr.join("/"));
    this.socket = openSocket(socketurlArr.join("/"));
    // this.handleKeyPress = this.handleKeyPress.bind(this);
    // this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidUpdate(){
    var cursor = document.querySelector('.updateContent')==null?-1:document.querySelector('.updateContent').selectionStart;
    console.log("socket data",{cursor:cursor,blogId:this.state.blogId,content:this.state.content});
    this.socket.emit('update_blog',{
      cursor:cursor,
      blogId:this.state.blogId,
      content:this.state.content
    });
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
  }

  componentDidMount()
  {
    axios.get(`/blog-api/${this.props.match.params.blogId}`)
    .then(res=>{
      const {title,imageURL,content} = res.data
      const {authorURL,username} = res.data.author;
      const authorName=res.data.author.name;
      const blogId = res.data._id;
      if(res.data.curUser){
        if(username!==res.data.curUser.username ){
          
          this.props.history.goBack();
        }
      }else{
        this.props.history.goBack();
      }
      this.setState({title,authorURL,imageURL,content,username,blogId,authorName});

    })
    .catch(err=>{
      console.log(this.props.match.params.blogId);
      console.log(err);
    });
  }

  componentWillUnmount(){
    console.log("Update User unmounting...");
    this.socket.disconnect();
  }
  handleChange(e){
    this.setState({[e.target.name]:e.target.value});
  };

//   handleKeyPress(e){
//     var x = e.charCode || e.keyCode || e.which;
//       if(x!=32){
//           if(x===13){
//             x=10;
//           }
//           const par = this.state.content===''?String.fromCharCode(x): this.state.content.substring(0,startPosition)+String.fromCharCode(x) + this.state.content.substring(startPosition);
//           console.log("keypress",par,startPosition);
//
//       }
//   }
//
//   handleKeyUp(e){
//
//     const updateBlog = this;
//     var startPosition = document.querySelector('.updateContent').selectionStart;
//     var endPosition = document.querySelector('.updateContent').selectionEnd;
//     console.log('positions are',startPosition,endPosition);
//     var x = e.charCode || e.keyCode || e.which;  // Get the Unicode value
//     // Check if you've selected text
//       if((x==8) && startPosition==0&&endPosition!=0){
//       }
//       else if(x==8){  //backspace
//         // axios.put(`http://localhost:5000/blog-api/${this.state.blogId}`,{title:this.state.title,content:this.state.content,imageURL:this.state.imageURL})
//         //   .then(res=>{
//         //
//         //     const updating = document.getElementById('updating');
//         //     updating.innerText = "Saving...";
//         //     setTimeout(()=>{
//         //       updating.innerText = "";
//         //     },1000)
//         //   })
//         //   .catch(err=>{
//         //     alert(err.message);
//         //   });
//         const par = this.state.content.substring(0,startPosition) + this.state.content.substring(endPosition);
//         console.log("data",par,startPosition-1);
//             socket.emit('update_blog',{
//               cursor:startPosition-1,
//               blogId:updateBlog.state.blogId,
//               content:par
//             });
//
//       }else if(x==32){  //space
//         console.log("keyup");
//
//         // axios.put(`http://localhost:5000/blog-api/${this.state.blogId}`,{title:this.state.title,content:this.state.content,imageURL:this.state.imageURL})
//         //   .then(res=>{
//         //     const updating = document.getElementById('updating');
//         //     updating.innerText = "Saving...";
//         //     setTimeout(()=>{
//         //       updating.innerText = "";
//         //     },1000)
//         //   })
//         //   .catch(err=>{
//         //     alert(err.message);
//         //   });
//         const par = this.state.content.substring(0,startPosition-1) +" " + this.state.content.substring(startPosition-1);
//         console.log("data is",par,startPosition-1);
//             socket.emit('update_blog',{
//               cursor:startPosition-1,
//               blogId:updateBlog.state.blogId,
//               content:par
//             });
//       }
// }

  render(){

    const {title,imageURL,content,authorURL,authorName} = this.state;
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
          <div className="col-md-6 mb-4 sm-12">
            <h1 className="allign-middle mb-5 text-left">{title}</h1>
            <div>
              <img src={authorURL} style={{borderRadius:'50%',width:'80px'}} className="float-left"/>
              <span className="float-left text-primary ml-4" style={{fontSize:'1.3em',position:'relative',top:'20px'}}>{authorName}</span>
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
