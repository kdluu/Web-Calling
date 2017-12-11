$('#div-chat').hide();
const socket = io('https://kdluu.herokuapp.com/');
// Listen to server emit on ONLINE_USER, dislay into ul html
socket.on('ONLINE_USER', arrUserInfo =>{
    $('#div-chat').show();
    $('#div-sign-up').hide();
    arrUserInfo.forEach(user => {
        const { name, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
    });
    // Listen to server emit on NEW_ONLINE_USER
    //  Then dislay to html 
    socket.on('NEW_USER_ONLINE', user =>{
        //console.log(user);
        const { name, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
    });
    //Socket on disconnect remove that user.
    socket.on('SOMEONE_DISCONNECTED', peerId => {
        $(`#${peerId}`).remove();
    });
});
socket.on('SIGN_UP_FAILED', () => alert('Please choose different username!'));
//openStream by web RTC
function openStream(){
    const config = {audio: true, video: true};
    return navigator.mediaDevices.getUserMedia(config);
}
function playStream(idVideotag, stream){
    const video = document.getElementById(idVideotag);
    video.srcObject = stream;
    video.play();
}
// openStream()
// .then (stream => playStream('localStream',stream));
//Create new peer with API from peer.js
const peer = new Peer({key: 'ekg1fbwhbx8t1emi'});
//Listen to peer and append the id to #my-peer tag in index.html 
peer.on('open', id => {
$('#my-peer').append(id);
//console.log(id)
//Sign up new user, send data to server
$('#btnSignUp').click(() =>{
    const username = $('#txtUsername').val();
    socket.emit('NEW_USER_SIGN_UP', {name: username, peerId: id}); //NGUOI_DUNG_DANG_KY
});
});
//Caller send request to calle by submitting calle's peer id
$('#btnCall').click(() =>{
    //Get id of calle
    const id = $('#remoteID').val();
    //After we get calle's, initial the stream;
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});
//Calle respone to call
peer.on('call', call => {
    openStream()
    .then (stream => { 
        //Answer 
        call.answer(stream);
        //Calle will play their stream in localStream
        //Then listen to the event when get other user stream, then play that stream in remoteStream
        playStream('localStream',stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    })
})
//Now we set up server socket.io to send/get ID in server/index.js

//When user click on the username, direct it to call
$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});