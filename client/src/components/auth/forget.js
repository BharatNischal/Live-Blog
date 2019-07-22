import React,{Component} from "react";
import axios from 'axios';


class Forget extends Component{
  constructor(props){
    super(props);
    this.state ={email:"",msg:"",type:""};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e){
    this.setState({[e.target.name]:e.target.value});
  };
  handleSubmit(e){
    e.preventDefault();
    axios.post('/api/forget',{username:this.state.email})
      .then(res=>{
        if(res.data.msg!=""){
          this.setState({msg:res.data.msg,type:"err"});
        }else{
          this.setState({msg:`An e-mail has been sent to ${this.state.email} with further instructions.`,type:"ok"});
          setTimeout(()=>{this.props.history.push("/");},2000);
        }
      })
      .catch(err=>{
        this.setState({msg:err.message});
      })
  }
  render(){
    return(
      <div className="row container">
      	<div className="col-md-12">
          {this.state.type!=="ok"?
            (<form onSubmit={this.handleSubmit}>
              <legend>Forgot Password</legend>
              <div className="form-group">
                <label for="email">Email</label>
                <input type="email" name="email" id="email" autofocus class="form-control" onChange={this.handleChange} />
              </div>
              <div className="form-group">
                <input type="submit" className="btn btn-primary" value="Reset Password" required ></input>
              </div>
              <p className="text-danger">{this.state.msg}</p>
            </form>):
            (<div><h2>First Step to Change Password Completed!!</h2><legend class="legend">{this.state.msg}</legend></div>)
          
          }
      	</div>
      </div>
    );
  }
}

export default Forget;