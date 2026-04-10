import "./Navbar.css";
import React from "react";
import ProfileInfo from "../../components/Cards/ProfileInfo";
import { useNavigate } from 'react-router-dom';
import SearchBar from "../../components/Cards/SearchBar";

const Navbar = (props) => {
  const {userInfo,searchQuery,setSearchQuery,onSearchNote,handleClearSearch} = props;
  const navigate = useNavigate();
  const isToken=localStorage.getItem("accessToken")
  
  console.log('Navbar - userInfo received:', userInfo);
  
  const onLogout=()=>{
    localStorage.removeItem("accessToken");
    navigate("/login");
  }

  const handleSearch=()=>{
    if(searchQuery){
      onSearchNote(searchQuery);
    }
  }
  const onClearSearch=()=>{
    handleClearSearch();
    setSearchQuery("");
  }

  return (
    <div className="navbar">
        <img src="https://www.smarttourplanner.com/og-image.png" alt="Logo" className="app-logo" />
        {isToken &&(<>  
          <SearchBar value={searchQuery} onChange={({target})=>{setSearchQuery(target.value)}}
            handleSearch={handleSearch} onClearSearch={onClearSearch}/>
          <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>
        </>)}
    </div>
    )
}

export default Navbar