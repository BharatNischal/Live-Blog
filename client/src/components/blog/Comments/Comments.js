import React,{Component} from 'react';
import Comment from './Comment/Comment';
import {withRouter} from 'react-router-dom';
import axios from 'axios';
class Comments extends Component {
    state = {
        comment:"",
        allComments:[]
    }
    componentDidMount(){
        console.log(this.props.comments);
        this.setState({allComments:this.props.comments});
    }
    commentChangeHandler=(e)=>{

        this.setState({[e.target.name]:e.target.value});

    }
    submitHandler=(e)=>{
        e.preventDefault();
        const data={content:this.state.comment};
        console.log(data);
        axios.post(`/blog-api/${this.props.match.params.blogId}/comments`,{data})
        .then(res=>{

                const allC=[...this.state.allComments];
                allC.push(res.data);
                this.setState({allComments:allC,comment:""});

        }).catch(err=>{
            console.log(err);
        });

    }

    render() {
        console.log("Comments",this.props);
        const comStyle={
            width:'100%',
            fontSize:'14px',
            borderRadius:'8px',
            outline:'none',
            borderTop:'0px',
            borderRight:'0px',
            borderLeft:'0px',
            borderBottom:'2px solid green ',
            boxShadow:'0px 0px 10px 2px #a0a0a0'
        }
        return (
            <div className="row mt-4 mb-4 ml-1 mr-1 p-3 rounded-lg" style={{backgroundColor:'#e1e1e1',boxShadow:'0px 0px 20px 3px #a0a0a0'}}>
                <div className="col-12">
                    <h1 className="display-4 mb-4 text-left">Comments</h1>
                </div>
                <div className="col-0 col-md-1"></div>
                <div className="col-12 col-md-10">
                    {this.props.curUser?(
                        <form className="row mb-4" onSubmit={this.submitHandler}>
                            <div className="col-8 col-md-8">
                                <input type="text" name="comment" placeholder="Enter your Comment here!!" className="p-2" style={comStyle} onChange={this.commentChangeHandler} value={this.state.comment} />
                            </div>
                            <div className="col-4 col-md-2">

                                <button className="btn btn-outline-success" style={{width:'100%'}}>Submit</button>
                            </div>
                        </form>
                    ):null
                    }
                </div>
                <div className="col-0 col-md-1"></div>
                <div className="col-0 col-md-1"></div>
                <div className="col-12 col-md-10">
                    {this.state.allComments.map(c=>(
                        <Comment authorURL={c.author.authorURL} key={c._id} content={c.content} author={c.author.name} />
                    ))}


                </div>
                <div className="col-0 col-md-1"></div>
            </div>
        )
    }
}

export default withRouter(Comments);
