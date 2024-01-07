import React, { useCallback, useEffect, useRef, useState } from 'react'
import useSocket from '../providers/Socket'
import usePeer from '../providers/Peer';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './Room.module.css'
import { OnlineUserList } from '../components/OnlineUserList';
import { Player } from '../components/Player';
import { User } from 'react-feather';

export const Room = ({user}) => {

    const navigate = useNavigate();
    const { socket } = useSocket();
    const { peer, createOffer , createAnswer, closeConnection} = usePeer();
    const [remoteStream, setRemoteStream] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [connectedUser, setConnectedUser] = useState({});
    const [calling, setCalling] = useState(false);
    if(!user) navigate('/');
    
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

    useEffect(() => {
      socket.emit("new-user-online", {});
      peer.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setRemoteStream(remoteStream)
      }; 
    },[])
  
    const handleCallUser = useCallback(async (user) => {
      const remoteSocketId = user.socketId;
      setCalling(user.socketId);
/*
      const sendChannel = peer.createDataChannel('channel');
      peer.channel = sendChannel;
      sendChannel.onopen = () => alert('Connected');
      sendChannel.onclose = () => alert('Disconnected');
*/
      await createOffer();
      /*
        A pause of 1 second is taken because the icecandidates are changing again and again, and to let it settle 1 second pause is taken
        peer.onicecandidate = (e) => setOffer(JSON.stringify(peer.localDescription));
        
        peer.onicecandidate = (event) => {
          if(peer.setRemoteDescription){
            if(event.candidate) {
              socket.emit('ice-candidate', { to : remoteSocketId , candidate: event.candidate})
            }
          }
        }
      */
      await new Promise(resolve => setTimeout(resolve, 1000));
        /*
        In the context of the await keyword, it does pause the execution of the function in which it is used. 
        However, it doesn't block the entire JavaScript runtime or prevent other parts of your application from running. 
        The rest of your application, outside the scope of the handleCallUser function, can continue executing while this function is waiting.
        */
      socket.emit('call_user', { to: remoteSocketId, offer: peer.localDescription });
    }, [socket]);

    const handleIncomingCall = useCallback(async ({ from, offer, userData }) => {
            console.log('incomming call');
      const userResponse = window.confirm("Accept Incomming Video Call");
      toast(`Incomming Call from ${userData.name}`, { autoClose: 4000 });
      if(userResponse){
        setConnectedUser({socketId: from , userData});
        setConnected(true);
        /*
        peer.ondatachannel = (e) => {
          const receiveChannel = e.channel;
          receiveChannel.onopen = () => alert('Connected');
          receiveChannel.onclose = () => alert('Disconnected');
          peer.channel = receiveChannel;
        };
        */
        const ans = await createAnswer(offer);
        socket.emit('call_accepted', { to: from, ans , user});
      }
      else {
        socket.emit('call_rejected', { to: from, user});
        console.log("rejected")
      }
    }, [socket]);
  
    const handleCallAccepted = async ({ from, ans }) => {
            await peer.setRemoteDescription(ans);
      console.log('Call got accepted');
      setConnected(true)
      setConnectedUser({socketId: from , user});
    }

    const handleOnlineUsers = ({ onlineUsers }) => {
      console.log(onlineUsers);  
      // onlineUsers is an array where each element is an object with socketId and user
      const updatedOnlineUsers = onlineUsers.filter(({ socketId }) => socketId !== user.id);
      setOnlineUsers(updatedOnlineUsers);
    }

    const handleEndCall = () => {
      socket.emit('end_call', {to: connectedUser.socketId});
      setConnected(false);
      setConnectedUser({});
      peer.getSenders()?.forEach(sender => peer.removeTrack(sender))
      closeConnection();
      navigate('/')
      navigate(0);
    }

    const handelDisconnection = () => {
      setConnected(false);
      setConnectedUser({});
      peer.getSenders()?.forEach(sender => peer.removeTrack(sender))
      closeConnection();
      navigate('/')
      navigate(0);
    }
    /*
    const handleIceCandidate = ({from , candidate}) => {
      console.log(candidate)
      if(peer.remoteDescription){
        if(candidate){
          peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    }
    */
    useEffect(() => {
        socket.on('online-users', handleOnlineUsers);
        socket.on('incomming_call', handleIncomingCall);
        socket.on('call_accepted', handleCallAccepted);
        socket.on('call_disconnected', handelDisconnection);
        //        socket.on('ice-candidate', handleIceCandidate);

        return () => {
          socket.off('online-users', handleOnlineUsers);
          socket.off('incomming_call', handleIncomingCall);
          socket.off('call_accepted', handleCallAccepted);        
          socket.off('call_disconnected', handelDisconnection);
          //          socket.off('ice-candidate', handleIceCandidate);
        }
      }, [socket, handleIncomingCall,  handleCallAccepted])
  
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
                <div className={styles.cta}>
                    <div className={styles.metaData}>
                      <h1>Seamless Connections, Anytime, Anywhere! 🚀 </h1>
                    </div>
                    <div className={styles.userListContainer}>
                      <OnlineUserList calling={calling} onlineUsers={onlineUsers} handleCallUser={handleCallUser}/>
                    </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.videoCall}>
                  <div className={styles.streamContainer}>
                      {remoteStream && <Player stream={remoteStream} email={connectedUser?.user?.name} muted={false}/>}
                      {myStream && <Player stream={myStream} email={"My Stream"} muted={true}/>}
                  </div>
                  <button onClick={handleEndCall} className={styles.endCallbutton}>Disconnect</button>
                </div>
              </>
            )
          }
          </section>
        <ToastContainer className="custom-toast-container"/>
      </div>
  )
}
