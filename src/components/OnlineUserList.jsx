import React from 'react';
import styles from './OnlineUserList.module.css'
import { PhoneCall } from 'react-feather';

export const OnlineUserList = ({ onlineUsers, handleCallUser }) => {
  return (
    <div className={styles.list}>
      <h3>Online Users</h3>
      <div className={styles.listContainer}>
        {onlineUsers && onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <button key={user.socketId} className={styles.callButton} onClick={() => handleCallUser(user)}>
              <PhoneCall /> {user.user.name}
            </button>
          ))
        ) : (
          <p>No one is online</p>
        )}
      </div>
    </div>
  );
};
