import React from "react";
import { MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md";
import {format} from 'date-fns'
import { GrMapLocation } from "react-icons/gr";
import './ViewTravelStory.css';

const ViewTravelStory = ({ storyInfo,onClose,onEditClick,onDeleteClick }) => {
  if (!storyInfo) {
    return null;
  }

  const totalExpense = storyInfo.planDetails
    ? Object.values(storyInfo.planDetails).reduce((sum, rows) => {
        if (!Array.isArray(rows)) return sum;
        return sum + rows.reduce((rowSum, row) => rowSum + Number(row.price || 0), 0);
      }, 0)
    : 0;

  const remainingBudget = (Number(storyInfo.planBudget || 0) - totalExpense).toFixed(2);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="view-travel-story-modal" onClick={handleBackdropClick}>
      <div className="view-travel-story-container" onClick={(e) => e.stopPropagation()}>
        <div className="view-travel-story-header">
          <button className="view-action-button view-action-update" onClick={onEditClick}>
            <MdUpdate /> UPDATE STORY
          </button>

          <button className="view-action-button view-action-delete" onClick={onDeleteClick}>
            <MdDeleteOutline /> Delete
          </button>

          <button className="view-action-button view-action-close" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="view-travel-story-content">
          <div>
            <h1 className="view-travel-story-title">
              {storyInfo.title || 'Untitled Story'}
            </h1>
            {storyInfo.entryType === 'plan' && (
              <div className="view-plan-budget-summary">
                <span>Budget: ₹{storyInfo.planBudget || 0}</span>
                <span>Spent: ₹{totalExpense}</span>
                <span>Remaining: ₹{remainingBudget}</span>
              </div>
            )}
            <div className="view-travel-story-info">
              <span className="view-travel-story-date">
                {storyInfo.visitedDate ? format(new Date(storyInfo.visitedDate), 'yyyy/MM/dd') : 'No date'}
              </span>
              {storyInfo.visitedLocation && storyInfo.visitedLocation.length > 0 && (
                <div className="view-travel-story-location">
                  <GrMapLocation />
                  {storyInfo.visitedLocation.map((item, index) => 
                    storyInfo.visitedLocation.length === index + 1 ? `${item}` : `${item}, `
                  )}
                </div>
              )}
            </div>
            {storyInfo.imageUrl && (
              <img src={storyInfo.imageUrl} alt="selected" className="view-travel-story-image"/>
            )}
            {storyInfo.videoUrl && (
              <video src={storyInfo.videoUrl} controls className="view-travel-story-video"/>
            )}
            <div>
              <p className="view-travel-story-text">{storyInfo.story || 'No story content'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTravelStory;
    