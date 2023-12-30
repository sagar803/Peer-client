import React, { useState, useEffect } from 'react';
import useReep from '../providers/reep';
import ReactPlayer from 'react-player';

export const WebRTCComponent = () => {
  const {peer , createOffer, createAnswer}  = useReep();
  const [offer, setOffer] = useState('');
  const [incomingSDP, setIncomingSDP] = useState('');
  const [acceptedSDP, setAcceptedSDP] = useState('');

  const [myStream, setMyStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)

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

  peer.onicecandidate = (e) => setOffer(JSON.stringify(peer.localDescription));
  console.log(offer);

  const handleCall = async () => {
    try {
      const sendChannel = peer.createDataChannel('channel');
      peer.channel = sendChannel;

      sendChannel.onopen = () => alert('Connected');
      sendChannel.onclose = () => alert('Disconnected');
      await createOffer();
    } catch (error) {
      console.error('Error creating or setting local description:', error);
    }
  };

  const handleIncomingCall = async () => {
    const parsedOffer = JSON.parse(incomingSDP);

    peer.ondatachannel = (e) => {
      const receiveChannel = e.channel;
      receiveChannel.onopen = () => alert('Connected');
      receiveChannel.onclose = () => alert('Disconnected');
      peer.channel = receiveChannel;
    };

    await createAnswer(parsedOffer);
    setOffer(JSON.stringify(peer.localDescription));
  };

  const handleCallAccepted = () => {
    const parsedAnswer = JSON.parse(acceptedSDP);
    peer.setRemoteDescription(parsedAnswer);
  };


  const copyText = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  return (
    <div>
      <h1>Hello WebRTC users</h1>

      <div>
        <p>{offer}</p>
        <button onClick={() => copyText(offer)}>Copy SDP</button>
        <div id="call-button" className="btn" onClick={handleCall}>
          Call User
        </div>
      </div>

      <div>
        <input
          title="Paste the offer SDP which you had received from someone calling you, if you are going to initiate a call then leave it as it is"
          placeholder="Offer SDP, Hover to know more"
          value={incomingSDP}
          onChange={(e) => setIncomingSDP(e.target.value)}
        />
        <div id="incoming-button" className="btn" onClick={handleIncomingCall}>
          Incoming call
        </div>
        <p>{offer}</p>
      </div>

      <div>
        <input
          title="Paste the answer SDP which you had received from someone you called, if you are the one receiving the call, then leave it as it is!"
          placeholder="Answer SDP, Hover to know more"
          value={acceptedSDP}
          onChange={(e) => setAcceptedSDP(e.target.value)}
        />
        <div id="accepted-button" className="btn" onClick={handleCallAccepted}>
          Accepted call
        </div>
      </div>

      <div className='streams_container'>
                {remoteStream &&  (
                  <div className='stream'>
                    <ReactPlayer
                      className="video-player"
                      width="100%"
                      height="100%"
                      playing
                      muted
                      url={remoteStream}
                      />
                  </div>
                )}
                {myStream && (
                  <div className='stream'>
                    <ReactPlayer
                      className="video-player"
                      width="100%"
                      height="100%"
                      playing
                      muted
                      url={myStream}
                    />
                  </div>
                  )}
              </div>


    </div>
  );
};
