import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import $ from 'jquery';

class Album extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userid:"",
      username: "",
      password:"",
      friends: [],
      album: [],
      displayPhoto:{'id':'','url':'','userid':'','likedby':''}
    };

  this.handleID = this.handleID.bind(this);
  this.handlePW = this.handlePW.bind(this);
  this.loggedin = this.loggedin.bind(this);
  this.loggedout = this.loggedout.bind(this);
  this.login = this.login.bind(this);
  this.logout = this.logout.bind(this);
  this.getMyAlbum = this.getMyAlbum.bind(this);
  this.getAlbum = this.getAlbum.bind(this);
  this.checkCookie = this.checkCookie.bind(this);
  this.upload = this.upload.bind(this);
  this.delete = this.delete.bind(this);
  this.like = this.like.bind(this);
  this.enlarge = this.enlarge.bind(this);
  this.close = this.close.bind(this);
  }

componentDidMount() {
  this.checkCookie();
}

checkCookie() {
  $.ajax({
        url:'http://localhost:3002/init',
        type:'get',
        dataType:'json',
        xhrFields:{
            withCredentials:true
        },
        success:function(data) {
          if (data['msg'] === '')
            this.loggedout();
          else{
            this.setState({
              username: data['username'],
              userid: data['userid'],
              friends: data['friends']
            });
            this.loggedin();
          }
        }.bind(this),
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }.bind(this)
    });
  }

loggedin(e){
    document.getElementById("loginbut").style.display = "none";
    document.getElementById("logoutbut").style.display = "inline-block";
    document.getElementById("greeting").innerHTML = "Hello " + this.state.username + "!";
    document.getElementById("friendList").style.display = "inline";
    document.getElementById("choose").style.display = "none";
    document.getElementById("photoInfo").style.display = "none";
}
loggedout(e){
    document.getElementById("loginbut").style.display = "inline-block";
    document.getElementById("logoutbut").style.display = "none";
    document.getElementById("friendList").style.display = "none";
    document.getElementById("photoList").style.display = "none";
    document.getElementById("photoInfo").style.display = "none";
}

handleID(e){
    this.setState({
      username: e.target.value
    })
  }
handlePW(e){
    this.setState({
      password: e.target.value
    })
  }

login(e){
    e.preventDefault();
   if (this.state.username === '' || this.state.password === '') {
        alert('You must enter username and password');
   }
  else{
    $.ajax({
         url:'http://localhost:3002/login',
         type:'post',
         dataType:'json',
         data:{
           "username" : this.state.username,
           "password" : this.state.password
         },
         xhrFields:{
             withCredentials:true
         },
         success:function(data) {
           if (data['msg'] === 'Login failure')
             alert(data.msg);
           else{
             this.setState({
               username: data['username'],
               userid: data['userid'],
               friends: data['friends']
             });
             this.loggedin();
           }
         }.bind(this),
         error: function (xhr, ajaxOptions, thrownError) {
             alert(xhr.status);
             alert(thrownError);
         }.bind(this)
       });
     }
}

logout(e){
  e.preventDefault();
  $.ajax({
       url:'http://localhost:3002/logout',
       type:'get',
       dataType:'json',
       xhrFields:{
           withCredentials:true
       },success:function(data) {
           this.loggedout();
           var x = document.querySelectorAll("[class='selected']");
             for (let v of x) { v.setAttribute('class','unselected'); }
       }.bind(this),
       error: function (xhr, ajaxOptions, thrownError) {
           alert(xhr.status);
           alert(thrownError);
       }.bind(this)
     });
}

getMyAlbum(e){
  var x = document.querySelectorAll("[class='selected']");
    for (let v of x) { v.setAttribute('class','unselected'); }
  var y = document.getElementById("myalbum").setAttribute("class","selected");
    $.ajax({
      url: "http://localhost:3002/getalbum/"+ "0",
      dataType: 'json',
      type: 'GET',
      xhrFields:{
          withCredentials:true
      },
      success: function(data) {
        this.setState({album: data})
        document.getElementById("photoList").style.display = "inline";
        document.getElementById("choose").style.display = "inline-block";
        var x = document.querySelectorAll("[id='deleteBut']");
          for (let v of x) { v.style.display='inline'; }
        var y = document.querySelectorAll("[id='likeBut']");
          for (let v of y) { v.style.display='none'; }

      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
      }.bind(this)
    });
  }

getAlbum(id){
  var x = document.querySelectorAll("[class='selected']");
    for (let v of x) { v.setAttribute('class','unselected'); }
  var y = document.getElementById(id).setAttribute('class','selected');
    $.ajax({
      url: "http://localhost:3002/getalbum/"+ id,
      dataType: 'json',
      type: 'GET',
      xhrFields:{
          withCredentials:true
      },
      success: function(data) {
        this.setState({album: data})
        document.getElementById("photoList").style.display = "inline";
        document.getElementById("choose").style.display = "none";
        var x = document.querySelectorAll("[id='deleteBut']");
          for (let v of x) { v.style.display='none'; }
        var y = document.querySelectorAll("[id='likeBut']");
          for (let v of y) { v.style.display='inline'; }
      }.bind(this),
      error: function (xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
      }.bind(this)
    });
  }

upload(e){
  e.preventDefault();
  var file=$('#choosepic')[0].files[0];
  var fd = new FormData ();
  fd.append( 'file', file );
  if(!file) {
    alert('No photo is selected.');
  } else{
          var xhr=new XMLHttpRequest();
          xhr.open('POST','http://localhost:3002/uploadphoto');
          xhr.withCredentials=true;
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.setRequestHeader('X-File-Name', file.name);
          xhr.setRequestHeader('Content-Type', file.type||'application/octet-stream');
          xhr.onreadystatechange = function(){
            if(xhr.readyState==4 && xhr.status==200){
              this.getMyAlbum();
            }
          }.bind(this);
        xhr.send(file);
      }
}

delete(id){
  var confirmation = window.confirm('Are you sure you want to delete this photo?');
  if(confirmation === true){
    $.ajax({
      type: 'DELETE',
      url: "http://localhost:3002/deletephoto/"+id,
      dataType: 'json',
      xhrFields:{
          withCredentials:true
      },
      success: function(data) {
        this.getMyAlbum();
      //modification in different situation
      }.bind(this),
    error: function (xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
    }.bind(this)
    });
  }
}

like(id){
  $.ajax({
    type: 'PUT',
    url: "http://localhost:3002/updatelike/"+id,
    dataType: 'json',
    xhrFields:{
        withCredentials:true
    },
    success: function(data) {
      this.likedby(id, data);
    }.bind(this),
    error: function (xhr, ajaxOptions, thrownError) {
        alert(xhr.status);
        alert(thrownError);
    }.bind(this)
  });
}

likedby(id, data){
  var sentence = "";
  if (data.length < 1){
    sentence = "";
  }
  else{
    sentence += data[0];
    for (var i = 1; i < data.length; i++){
      sentence += ", " + data[i];
    }
    sentence += " liked this photo!";
  }
  var x = document.querySelectorAll("[id='"+id+"']");
    for (let v of x) { v.innerHTML = sentence; }
}

enlarge(photo){
  this.setState({
    displayPhoto:{'id':photo._id, 'url':photo.url,'userid':photo.userid,'likedby':photo.likedby}
  });
  document.getElementById("photoList").style.display = "none";
  document.getElementById("photoInfo").style.display = "inline";
}

close(id){
  this.setState({
    displayPhoto:{'id':"", 'url':"",'userid':"",'likedby':""}
  });
  if (this.state.userid === id){
    this.getMyAlbum();
  }else{
    this.getAlbum(id);
  }
  document.getElementById("photoList").style.display = "inline";
  document.getElementById("photoInfo").style.display = "none";
}

  render() {
    return (
     <div id="wrapper">
     <h1> iAlbum</h1>
        <div id="login">
        <fieldset id="loginbut">
          Name:
          <input className="input_text"
          type="text"
          value={this.props.username}
          onChange={this.handleID}
          />
          Password:
         <input className="input_text"
         type="text"
         value={this.props.password}
         onChange={this.handlePW}
         />
         <button className="myButton" onClick={this.login}>Log In</button>
      </fieldset>

      <fieldset id="logoutbut">
        <a id = "greeting"> </a>
        <button className="myButton" onClick={this.logout}>Log Out</button>
      </fieldset>
		  </div>

    <FriendList
      friends={this.state.friends}
      getMyAlbum={this.getMyAlbum}
      getAlbum={this.getAlbum}
      />

      <PhotoList
        album={this.state.album}
        upload={this.upload}
        delete={this.delete}
        like={this.like}
        enlarge={this.enlarge}
        />

        <PhotoInfo
          displayPhoto={this.state.displayPhoto}
          delete={this.delete}
          like={this.like}
          close={this.close}
          />

    </div>
    );
  }
}
class FriendRow extends React.Component{
  constructor(props) {
    super(props);

    this.getAlbum = this.getAlbum.bind(this);

  }
  getAlbum(e){
    e.preventDefault();
    this.props.getAlbum(this.props.friend._id);
  }
  render() {
     const friend = this.props.friend;

     return (
       <tr>
         <td><a id = {friend._id} onClick={this.getAlbum} rel={friend._id}>{friend.username}'s Album</a></td>
       </tr>
     );
   }
}

class FriendList extends React.Component {
  constructor(props) {
    super(props);
    this.getAlbum = this.getAlbum.bind(this);
    this.getMyAlbum = this.getMyAlbum.bind(this);
  }
  getAlbum(id){
    this.props.getAlbum(id);
  }
  getMyAlbum(e){
    this.props.getMyAlbum();
  }

  render() {
    let list = [];
    this.props.friends.map((friend) => {
        list.push(
          <FriendRow
            friend={friend}
            getAlbum={this.getAlbum}
          />
        );
    });

    return (
      <div id="friendList">
      <table>
      <thead>
        <tr>
          <th><a id = "myalbum" onClick={this.getMyAlbum}>My Album</a></th>
        </tr>
      </thead>
        <tbody>{list}</tbody>
      </table>
      </div>
    );
  }
}

class PhotoList extends React.Component {
  constructor(props) {
    super(props);

    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
    this.like = this.like.bind(this);
    this.enlarge = this.enlarge.bind(this);
  }

  upload(e){
    this.props.upload(e);
  }
  delete(id){
    this.props.delete(id);
  }
  like(id){
    this.props.like(id);
  }
  enlarge(photo){
    this.props.enlarge(photo);
  }

  render() {
   let rows = [];
    this.props.album.map((photo) => {
        rows.push(
          <AlbumRow
            photo={photo}
            delete={this.delete}
            like={this.like}
            enlarge={this.enlarge}
          />
        );
    });

    return (
      <div id="photoList">
      <table>
      <thead>
      </thead>
        <tbody><tr>{rows}</tr></tbody>
      </table>

      <div id="choose">
        <input id="choosepic"name="choosepic" type="file"/>
        <input type="button" id= "upload" onClick={this.upload} value="Upload Photo"/>
       </div>
       </div>
    );
  }
}

class AlbumRow extends React.Component{
  constructor(props) {
    super(props);

    this.delete = this.delete.bind(this);
    this.like = this.like.bind(this);
    this.enlarge = this.enlarge.bind(this);
  }

  delete(e){
    e.preventDefault();
    this.props.delete(this.props.photo._id);
  }
  like(e){
    e.preventDefault();
    this.props.like(this.props.photo._id);
  }
  enlarge(e){
    e.preventDefault();
    this.props.enlarge(this.props.photo);
  }

  render() {
     const photo = this.props.photo;
     var sentence = "";
     if (photo.likedby.length < 1){
       sentence = "";
     }
     else{
       sentence += photo.likedby[0];
       for (var i = 1; i < photo.likedby.length; i++){
         sentence += ", " + photo.likedby[i];
       }
       sentence += " liked this photo!";
     }

     return (
         <td>
         <div id="pic">
          <img id="img" src={photo.url} onClick={this.enlarge}></img>
          <a class = "photo" id = {photo._id}>{sentence}</a>
          <input type="button" id="deleteBut" onClick={this.delete} value="Delete"/>
          <input type="button" id="likeBut" onClick={this.like} style={{display:'none'}} value="Like"/>
          </div>
         </td>

     );
   }
}
//<button aria-label="Close Account Info Modal Box">&times;</button>
class PhotoInfo extends React.Component{
  constructor(props) {
    super(props);

    this.delete = this.delete.bind(this);
    this.like = this.like.bind(this);
    this.close = this.close.bind(this);
  }

  delete(e){
    e.preventDefault();
    this.props.delete(this.props.displayPhoto.id);
  }
  like(e){
    e.preventDefault();
    this.props.like(this.props.displayPhoto.id);
  }
  close(e){
    e.preventDefault();
    this.props.close(this.props.displayPhoto.userid);
  }

  render() {
    const photo = this.props.displayPhoto;
    var sentence = "";
    if (photo.likedby.length < 1){
      sentence = "";
    }
    else{
      sentence += photo.likedby[0];
      for (var i = 1; i < photo.likedby.length; i++){
        sentence += ", " + photo.likedby[i];
      }
      sentence += " liked this photo!";
    }
    return (
      <div id="photoInfo">
        <div>
          <button id = "closeBut" onClick={this.close}>&times;</button>
        </div>
        <div>
          <img id="img" src={photo.url}></img>
        </div>
        <a class = "photo" id = {photo.id}>{sentence}</a>
        <input type="button" id="deleteBut" onClick={this.delete} value="Delete"/>
        <input type="button" id="likeBut" onClick={this.like} style={{display:'none'}} value="Like"/>
      </div>
    );
  }
}

export default Album;
