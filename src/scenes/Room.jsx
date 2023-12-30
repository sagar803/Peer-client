import React, { useCallback, useEffect, useRef, useState } from 'react'
import useSocket from '../providers/Socket'
import usePeer from '../providers/Peer';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Room.module.css'
import { OnlineUserList } from '../components/OnlineUserList';
import { Player } from '../components/Player';
import logo from '../asset/logo.jpg'
import { User } from 'react-feather';

export const Room = ({user}) => {

    const navigate = useNavigate();
    const { socket } = useSocket();
    const { peer, createOffer , createAnswer, closeConnection} = usePeer();
    const [remoteEmail, setRemoteEmail] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [myStream, setMyStream] = useState(null);    
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState({});
    if(!user){
      navigate('/');
    }

    const handleNewUserJoin = useCallback(({ email, id }) => {
      toast(`${email} is Online.`, { autoClose: 2000 });
    }, []);

    useEffect(() => {
      const setupMediaStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          setMyStream(stream)
          stream.getTracks().forEach(track => peer.addTrack(track, stream));
        } catch (error) {
          console.error('Error accessing media devices:', error);
        }
      };
  
      setupMediaStream();
    }, []);
  
    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setRemoteStream(remoteStream)
    };
  
    const handleCallUser = useCallback(async (user) => {
      const remoteSocketId = user[0];
      const remoteEmail = user[1].email;
      const sendChannel = peer.createDataChannel('channel');
      peer.channel = sendChannel;

      sendChannel.onopen = () => alert('Connected');
      sendChannel.onclose = () => alert('Disconnected');

      console.log('calling')
      await createOffer();
      //  A pause of 1 second is taken because the icecandidates are changing again and again, and to let it settle 1 second pause is taken
      //  peer.onicecandidate = (e) => setOffer(JSON.stringify(peer.localDescription));
      await new Promise(resolve => setTimeout(resolve, 1000));
      socket.emit('call_user', { to: remoteSocketId, offer: peer.localDescription });

    }, [socket]);

    const handleIncomingCall = useCallback(async ({ from, offer, name }) => {
      console.log('incomming')
      const userResponse = window.confirm("Accept Incomming Video Call");
      toast(`Incomming Call from ${name}`, { autoClose: 4000 });
      if(userResponse){
        setRemoteEmail(name);
        setConnected(true)
        peer.ondatachannel = (e) => {
          const receiveChannel = e.channel;
          receiveChannel.onopen = () => alert('Connected');
          receiveChannel.onclose = () => alert('Disconnected');
          peer.channel = receiveChannel;
        };
        const ans = await createAnswer(offer);
        socket.emit('call_accepted', { to: from, ans });
      }
      else {
        console.log("rejected")
      }
    }, [socket]);
  
    const handleCallAccepted = async ({ from, ans }) => {
      await peer.setRemoteDescription(ans);
      console.log('Call got accepted');
      setConnected(true)
    }

    const handleOnlineUsers = ({onlineUsers}) => {
      //online user is an array and each element is itself an array where onlineUser[0] is socket id and onlineUser[1] is an object with name and email
      setOnlineUsers(onlineUsers);
    }
    useEffect(() => {
      socket.emit("new-user-online", {})
    },[])
    useEffect(() => {
        socket.on('online-users', handleOnlineUsers);
        socket.on('user_joined', handleNewUserJoin);
        socket.on('incomming_call', handleIncomingCall);
        socket.on('call_accepted', handleCallAccepted);

        return () => {
          socket.off('online-users', handleOnlineUsers);
          socket.off('user_joined', handleNewUserJoin);
          socket.off('incomming_call', handleIncomingCall);
          socket.off('call_accepted', handleCallAccepted);        
        }
      }, [socket,handleNewUserJoin, handleIncomingCall,  handleCallAccepted])
      
    const handleEndCall = () => {
      setConnected(false);
      closeConnection();
      navigate('/');
      navigate(0);
//      socket.emit('end-call', {to: remoteSocketId});
    }
  
  return (
      <div className={styles.room} >
          <nav className={styles.navbar}>
              <span className={styles.logo}>Peer</span>
              <span className={styles.profile}><User />{user.name}</span>
          </nav>
          <section className={styles.main}>
          {
            !connected ? (
              <>
                <OnlineUserList onlineUsers={onlineUsers} handleCallUser={handleCallUser}/>
              </>
            ) : (
              <>
                <div className='streams_container'>
                    {remoteStream && <Player stream={remoteStream} email={remoteEmail} muted={false}/>}
                    {myStream && <Player stream={myStream} email={"My Stream"} muted={true}/>}
                </div>
                <button onClick={handleEndCall} className='button end-call-button'>Disconnect</button>
              </>
            )
          }
          </section>
        <ToastContainer className="custom-toast-container"/>
      </div>
  )
}
