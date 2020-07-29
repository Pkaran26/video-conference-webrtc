const socket = io('/')
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
})
const { useState, useEffect, useRef, Fragment, Component } = React

const Video = ({ stream, username, mute, userId, returnfunc })=>{
  const video = useRef()

  useEffect(()=>{
    if(stream && video && video.current){
      returnfunc(userId, video)
      const { current } = video
      if(mute){
        current.mute = true
      }
      current.srcObject = stream
      current.addEventListener('loadedmetadata', ()=>{
        current.play()
      })
    }
  }, [stream, video])

  return(
    <div className="col-lg-3">
      <div className="card bg-light">
        <div className="card-body" style={{ padding: '4px' }}>
          <video ref={ video } style={{ width: '100%' }}></video>
        </div>
        <div className="card-footer">{ username }</div>
      </div>
    </div>
  )
}

class Room extends Component {
  constructor(){
    super()
    this.state = {
      username: '',
      streams: [],
      peers: {},
      refs: {}
    }
  }

  setStreams = (stream)=>{
    const { streams } = this.state
    this.setState({
      streams: [...streams, stream]
    })
  }

  setPeers = (userId, call)=>{
    let { peers } = this.state
    peers = {
      ...peers,
      [userId]: call
    }

    this.setState({
      peers: peers
    })
  }

  setRefs = (userId, ref)=>{
    let { refs } = this.state
    refs = {
      ...refs,
      [userId]: ref
    }

    this.setState({
      refs: refs
    })
  }

  componentDidMount(){
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream=>{
      this.setStreams({
        stream: stream,
        username: "Prateek",
        mute: true
      })

      myPeer.on('call', call=>{
        call.answer(stream)
        call.on('stream', userVideoStream=>{
          this.setStreams({
            stream: userVideoStream,
            username: "Prateek"
          })
        })
      })

      socket.on('user-connected', userId=>{
        this.connectToNewUser(userId, stream)
      })
    })

    socket.on('user-disconnected', userId=>{
      console.log(userId)
      const { peers } = this.state
      if (peers[userId]){
        peers[userId].close()
      }
    })

    myPeer.on('open', id=>{
      socket.emit('join-room', ROOM_ID, id)
    })
  }

  connectToNewUser = (userId, stream)=>{
    const call = myPeer.call(userId, stream)

    call.on('stream', userVideoStream=>{
      console.log('new user');
      this.setStreams({
        stream: userVideoStream,
        username: "Prateek",
        userId,
      })
    })

    call.on('close', ()=>{
      // video.remove()

      const { refs } = this.state
      if (refs[userId]){
        refs[userId].remove()
      }
    })

    this.setPeers(userId, call)
  }

  render(){
    const { streams } = this.state
    return(
    <Fragment>
      <window.Header />
      <div className="container">
        <div className="row">
        { streams && streams.length>0?
          streams.map((e, i)=>(
            <Video
              key={ i }
              stream={ e.stream }
              username={ e.username }
              mute={ e.mute? e.mute : false }
              returnfunc={ this.setRefs }
            />
          ))
        :null }
        </div>
      </div>
    </Fragment>
  )
  }
}

ReactDOM.render(<Room />, document.getElementById('root'))
