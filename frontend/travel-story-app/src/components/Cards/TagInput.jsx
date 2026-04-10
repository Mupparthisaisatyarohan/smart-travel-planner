import React, { useState } from 'react'
import { MdAdd, MdClose } from "react-icons/md";
import "./TagInput.css"
import { GrMapLocation } from "react-icons/gr";

const TagInput = (props) => {
  const [inputValue, setInputValue] = useState("");
  const { tags, setTags } = props;

  const addLocation = (location) => {
    const trimmedLocation = location.trim();
    if (!trimmedLocation) return;
    if (props.onAddLocation) {
      props.onAddLocation(trimmedLocation);
    } else if (!tags.includes(trimmedLocation)) {
      setTags([...tags, trimmedLocation]);
    }
    setInputValue("");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addLocation(inputValue);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tag-input-wrapper">
      {tags.length > 0 && (
        <div className='tag-container'>
          {tags.map((tag, index) => (
            <span key={index} className='tag'>
              <GrMapLocation className='tag-icon' /> {tag}
              <button type='button' onClick={() => handleRemoveTag(tag)} className='tag-button'>
                <MdClose />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className='tag-input-container'>
        <input
          type='text'
          value={inputValue}
          className='location-input'
          placeholder='Enter location name'
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button className='add-new-tag' type='button' onClick={() => addLocation(inputValue)}>
          <MdAdd size={25} color="#fff" />
        </button>
      </div>
    </div>
  )
}

export default TagInput
