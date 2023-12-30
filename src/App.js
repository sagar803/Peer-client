import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { Home } from "./scenes/Home";
import { SocketProvider } from "./providers/Socket";
import { Room } from "./scenes/Room";
import { PeerProvider } from "./providers/Peer";
import { WebRTCComponent } from "./scenes/WebRTCComponent";
import { ReepProvider } from "./providers/reep";
import { useState } from "react";

function App() {
  const [user, setUser] = useState();
  return (
    <div className="App">
      <SocketProvider>
        <BrowserRouter>      
        <PeerProvider>

            <ReepProvider>
            <Routes>
              <Route path='/' element={<Home setUser={setUser}  />} />
              <Route path='/room' element={<Room user={user} />} />
              <Route path='/second' element={<WebRTCComponent />} />
            </Routes>
            </ReepProvider>
        </PeerProvider>

        </BrowserRouter>
      </SocketProvider>
    </div>
  );
}

export default App;
