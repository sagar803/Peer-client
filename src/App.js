import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { Home } from "./scenes/Home";
import { SocketProvider } from "./providers/Socket";
import { Room } from "./scenes/Room";
import { PeerProvider } from "./providers/Peer";
import { useState } from "react";

function App() {
  const [user, setUser] = useState();
  return (
    <div className="App">
      <SocketProvider>
        <BrowserRouter>      
          <PeerProvider>
            <Routes>
              <Route path='/' element={<Home setUser={setUser}  />} />
              <Route path='/room' element={<Room user={user} />} />
            </Routes>
          </PeerProvider>
        </BrowserRouter>
      </SocketProvider>
    </div>
  );
}

export default App;
