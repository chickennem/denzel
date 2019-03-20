import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
class App extends Component {
    constructor() {
        super()
        this.state = {
            title: '',
            link: '',
            metascore: '',
            poster:'',
            synopsis:'',
            review: ''
        }
        this.handleClick = this.handleClick.bind(this)
    }
    handleClick() {
        axios.get('http://localhost:9292/movies')
            .then(response => this.setState({ 
                title: response.data.title, 
                link: response.data.link, 
                metascore: response.data.metascore,
                 poster: response.data.poster,
                synopsis: response.data.synopsis,
                review: response.data.review,
            }),          
           
                
                
                
               )
    }
    render() {
        return (
            <div className='button__container'>
                <button className='button' onClick={this.handleClick}>
                    Click Me
      </button>
                <p>Titre : {this.state.title}</p>
                <p>Synopsis :{this.state.synopsis}</p>
                <p>Metascore : {this.state.metascore}</p>
                <p>Poster : <img src={this.state.poster} ></img></p>
                <p>Review : {this.state.review}</p>
                <p>lien : <a href={this.state.link} target="_blank">{this.state.link}</a> </p> 
            </div>
        )
    }

}
export default App