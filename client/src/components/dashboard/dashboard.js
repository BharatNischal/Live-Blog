import React, {Component} from 'react';
import BlogList from '../blog/blogList';
import axios from 'axios';

class Dashboard extends Component{
  constructor(props){
    super(props);
    this.state = {
      blogs:[]
    }
  }

  componentDidMount(){

    axios.get("/blog-api/")
      .then(res=>{
        this.setState({
          blogs:res.data
        });
      })
      .catch(err=>{

      })
  }

  render(){
    return (
      <div className="container">
        <div className="row" >
          <BlogList blogs={this.state.blogs}/>
        </div>
      </div>
    );
  }
}

export default Dashboard;
