import React from 'react'
import { format } from 'date-fns'
import "./TravelStoryCard.css"
import { FaRegHeart, FaHeart, FaEdit, FaShare } from "react-icons/fa";
import {GrMapLocation} from "react-icons/gr";


const TravelStoryCard = (props) => {
  const {storyData,onClick,onFavouriteClick,onShareClick}=props;
  const {title,visitedLocation,imageUrl,visitedDate,isFavorite,isShared}=storyData;
  const formattedDate=format(visitedDate, 'yyyy/MM/dd');
  return (
    <div className="travel-story-card" onClick={onClick}>
      <img src={imageUrl} alt={title} className='travel-story-image'/>

      <button className='favourite-click-button' onClick={(e)=>{e.stopPropagation(); onFavouriteClick && onFavouriteClick();}}>
        <FaHeart className={isFavorite?'favourite-icon favourite-icon-active':'favourite-icon'}/>
      </button>

      <button className='share-click-button' onClick={(e)=>{e.stopPropagation(); onShareClick && onShareClick();}}>
        <FaShare className={isShared?'share-icon share-icon-active':'share-icon'}/>
      </button>

      <div className='travel-story-info'>
        <h3>{title}</h3>
        <span className='travel-story-date'>{visitedDate?formattedDate:"-"}</span><br/>
        <div className='travel-story-card-locations'>
          <GrMapLocation className='location-icon'/><br/>
          {visitedLocation && visitedLocation.map((loc,index)=>(
            <span key={index} className='location-text'>{loc}{index!==visitedLocation.length-1?",":""} </span>
          ))}
        </div>
        </div>
    </div>
  )
}

export default TravelStoryCard