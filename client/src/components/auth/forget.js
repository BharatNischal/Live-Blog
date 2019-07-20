import react,{Component} from "react";
import axios from 'axios';


class Forget extends Component{
  constructor(props){
    super(props);
    this.state ={email:"",msg:""};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e){
    this.setState({[e.target.name]:e.target.value});
  };
  handleSubmit(e){
    e.preventDefault();
    axios.post('http://localhost:5000/api/forget',{username:this.state.email})
      .then(res=>{
        if(res.data.msg!=""){
          this.setState({msg:res.data.msg});
        }else{
          this.setState({msg:`An e-mail has been sent to ${this.state.email} with further instructions.`});
          setTimeout(this.props.history.push("/"),2000);
        }
      })
      .catch(err=>{
        this.setState({msg:err.message});
      })
  }
  render(){
    return(
      <div class="row container">
      	<div class="col-md-12">
      		<form onSubmit={this.handleSubmit}>
      			<legend>Forgot Password</legend>
      			<div class="form-group">
      				<label for="email">Email</label>
      				<input type="email" name="email" id="email" autofocus class="form-control" onChange={this.handleChange}>
      			</div>
      			<div class="form-group">
      				<input type="submit" class="btn btn-primary" value="Reset Password" required>
      			</div>
            <p className="text-danger">{this.state.err}</p>
      		</form>
      	</div>
      </div>
    );
  }
}

export default Forget;
