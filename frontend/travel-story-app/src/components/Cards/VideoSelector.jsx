import React, { useEffect, useRef, useState } from 'react'
import "./VideoSelector.css"
import { MdOutlineVideoLibrary, MdDeleteOutline } from "react-icons/md";

const VideoSelector = ({ video, setVideo }) => {
  const inputRef = useRef(null)
  const [previewVideo, setPreviewVideo] = useState(video || "")

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (500MB max)
      if (file.size > 500 * 1024 * 1024) {
        alert('Video file must be less than 500MB');
        return;
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewVideo(reader.result)
        setVideo(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const onChooseFile = () => {
    inputRef.current.click()
  }

  useEffect(() => {
    let objectUrl
    if (typeof video === "string") {
      // Handle both data URLs and regular video URLs
      if (video.startsWith("data:video") || video.startsWith("http://") || video.startsWith("https://")) {
        setPreviewVideo(video)
      } else {
        setPreviewVideo("")
      }
    } else if (video instanceof File) {
      objectUrl = URL.createObjectURL(video)
      setPreviewVideo(objectUrl)
    } else {
      setPreviewVideo("")
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [video])

  return (
    <div className="video-selector">
      <input
        type="file"
        accept="video/*"
        className='video-input-box'
        ref={inputRef}
        onChange={handleVideoChange}
      />
      {!video ? (<button className='video-file-button' onClick={()=>onChooseFile()}>
        <div >
          <MdOutlineVideoLibrary size={50} className='video-file-icon' />
        </div>
        <p className='video-file-para'>Browse video files to upload (Optional)</p>
      </button>):(
        <div className='video-preview-container'>
          <video src={previewVideo} controls className='video-preview' />
          <button className='delete-video-button' onClick={()=>{
            setPreviewVideo("")
            setVideo(null)
          }}>
            <MdDeleteOutline size={30} />
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoSelector
