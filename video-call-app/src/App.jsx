import './App.css';
import React, {useEffect, useRef, useState} from 'react';
import io from 'socket.io-client'
import Peer from 'simple-peer'
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {

  const socket = useRef()
  const peer = useRef(null)
  const [targetUserId, setTargetUserId] = useState('');

  useEffect(() => {
    socket.current = io('http://localhost:5000')

    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then((stream) => {
      peer.current = new Peer({
        initiator: window.location.hash === '#init',
        trickle: false,
        stream
      })
      console.log(peer.current)
      
  
      //events-here
      peer?.current.on('signal', (data) => {
        socket.current.emit('call:initiate', { signalData: data});
      })
      socket.current.on('call:receive', (data) => {
        const {callerId} = data;
        peer?.current.signal(data.signalData);
        socket.current.emit('call:answer', {callerId})
      })

      socket.current.on('call:establish', (data) => {
        const {answererId} = data;
        peer?.current.signal(data.iceCandidate)
      })

      socket.current.on('call:recive-stream', (data) => {
        const {senderId, stream } = data

        //enseñar el ui de recivir video y actualizar componentes
      })
    })
    .catch((err) => console.error('Error  access media device: ', err))

    return () => {
      socket.current.disconnect()
      peer.current.destroy()
    }
  }, [])

  const initiateCall = () => {
    if(!peer.current){
      console.error('Peer does not exist')
      return;
    }
    if (targetUserId.trim() === '') {
      alert('Please enter a valid target user ID');
      return;
  }

  }
  return (
    <div className="App">
      {
               <Container className="mt-5">
               <Row>
                   <Col>
                       <Form>
                           <Form.Group controlId="formTargetUserId">
                               <Form.Label>Target User ID:</Form.Label>
                               <Form.Control
                                   type="text"
                                   placeholder="Enter target user ID"
                                   value={targetUserId}
                                   onChange={(e) => setTargetUserId(e.target.value)}
                               />
                           </Form.Group>
                           <Button variant="primary" onClick={initiateCall}>
                               Initiate Call
                           </Button>
                       </Form>
                   </Col>
               </Row>
               {/* Add video elements and UI components here */}
           </Container>
      }
    </div>
  );
}

export default App;
