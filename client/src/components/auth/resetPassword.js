
import React,{Component} from "react";
import axios from 'axios';


class ResetPassword extends Component{
  constructor(props){
    super(props);
    this.state ={password:"",msg:""};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e){
    this.setState({[e.target.name]:e.target.value});
  };

  handleSubmit(e){
    e.preventDefault();
    axios.post(`/api/reset/${this.props.match.params.token}`,{password:this.state.password})
      .then(res=>{
          this.setState({msg:res.data.msg});
      })
      .catch(err=>{
        this.setState({msg:err.message});
      })
  }

  render(){
    var successMsg;
    console.log(this.state.msg);
    if(this.state.msg.split(" ")[0]==="Success!"){
      successMsg=true;
    }else{
      successMsg=false;
    }
    return(
      <div className="row container">
      	<div className="col-md-12">
          {successMsg?
            (<div><h1>Password Changed!!</h1><p class="legend">{this.state.msg}</p></div>):
            (
              
              <form onSubmit={this.handleSubmit}>
                <legend>Reset Password</legend>
                <div className="form-group">
                  <label for="password">New Password</label>
                  <input type="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder="New password" autofocus="autofocus" className="form-control" required />
                </div>
                <p class="text-danger">{this.state.msg}</p>
                <div class="form-group">
                  <button type="submit" class="btn btn-primary">Update Password</button>
                </div>
              </form>
            )
          }
      	</div>
      </div>
    );
  }
}

export default ResetPassword;