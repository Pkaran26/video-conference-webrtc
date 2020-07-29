const socket = io('/')
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3001
})
const { useState, useEffect, useRef, Fragment } = React

const VideoGrid = ({ videos })=>(
  <div className="row">
    { videos && videos.length>0?
      videos.map((e, i)=>(
        <Video
          key={ i }
          stream={ e.stream }
          username={ e.username }
          mute={ e.mute? e.mute : false }
        />
      ))
    :null }
  </div>
)

const Video = ({ stream, username, mute })=>{
  const video = useRef()

  useEffect(()=>{
    if(stream && video && video.current){
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

const Room = ()=>{
  const [username, setUsername] = useState('')
  const [streams, setStreams] = useState([])
  const [peers, setPeers] = useState({})

  useEffect(()=>{
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream=>{
      setStreams([
        ...streams,
        {
          stream: stream,
          username: "Prateek",
          mute: true
        }
      ])

      myPeer.on('call', call=>{
        call.answer(stream)
        call.on('stream', userVideoStream=>{
          setStreams([
            ...streams,
            {
              stream: userVideoStream,
              username: "Prateek"
            }
          ])
        })
      })

      socket.on('user-connected', userId=>{
        connectToNewUser(userId, stream)
      })
    })

    socket.on('user-disconnected', userId=>{
      console.log(userId)
      if (peers[userId]){
        peers[userId].close()
      }
    })

    myPeer.on('open', id=>{
      socket.emit('join-room', ROOM_ID, id)
    })
  }, [])

  const connectToNewUser = (userId, stream)=>{
    const call = myPeer.call(userId, stream)

    call.on('stream', userVideoStream=>{
      console.log('new user');
      setStreams([
        ...streams,
        {
          stream: userVideoStream,
          username: "Prateek"
        }
      ])
    })

    call.on('close', ()=>{
      video.remove()
    })

    setPeers({
      ...peers,
      [userId]: call
    })
  }

  return(
    <Fragment>
      <window.Header />
      <div className="container">
        <VideoGrid
          videos={ streams }
        />
      </div>
    </Fragment>
  )
}

ReactDOM.render(<Room />, document.getElementById('root'))
