import React, { useEffect, useRef, useState } from 'react'
import "./ProfileInfo.css";
import { getInitials } from '../../utils/helper';

const ProfileInfo = ({userInfo,onLogout}) => {
  const [isOpen, setIsOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle null/undefined userInfo
  if (!userInfo) {
    return (
      <div className='ProfileInfo'>
        <div className='profile-pic-container'>
          <span>...</span>
        </div>
        <span className='profile-name'>Loading...</span>
      </div>
    );
  }
  
  const username = userInfo.username || 'User';
  const email = userInfo.email || 'No email available';
  const initials = getInitials(username);
  
  return (
    <div className='profile-info-wrapper' ref={profileRef}>
      <button
        type='button'
        className='ProfileInfo'
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <div className='profile-pic-container'>
          {initials || 'U'}
        </div>
        <span className='profile-name'>{username}</span>
        <span className='profile-caret'>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className='profile-dropdown'>
          <div className='profile-details'>
            <h2>{username}</h2>
            <p>{email}</p>
            <button className='logout-button' onClick={onLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileInfo