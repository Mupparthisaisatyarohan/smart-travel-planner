import React, { useEffect, useRef, useState } from 'react'
import "./ImageSelector.css"
import {FaRegFileImage} from "react-icons/fa";
import {MdDeleteOutline} from "react-icons/md";

const ImageSelector = ({ image, setImg }) => {
  const inputRef = useRef(null)
  const [previewImg, setPreviewImg] = useState(image || "")

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImg(reader.result)
        setImg(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const onChooseFile = () => {
    inputRef.current.click()
  }

  useEffect(() => {
    let objectUrl
    if (typeof image === "string") {
      // Handle both data URLs and regular image URLs
      if (image.startsWith("data:image") || image.startsWith("http://") || image.startsWith("https://")) {
        setPreviewImg(image)
      } else {
        setPreviewImg("")
      }
    } else if (image instanceof File) {
      objectUrl = URL.createObjectURL(image)
      setPreviewImg(objectUrl)
    } else {
      setPreviewImg("")
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [image])

  return (
    <div className="image-selector">
      <input
        type="file"
        accept="image/*"
        className='image-input-box'
        ref={inputRef}
        onChange={handleImageChange}
      />
      {!image ? (<button className='image-file-button' onClick={()=>onChooseFile()}>
        <div >
          <FaRegFileImage size={50} className='image-file-icon' />
        </div>
        <p className='image-file-para'>Browse image files to upload</p>
      </button>):(
        <div className='image-preview-container'>
          <img src={previewImg} alt="Selected" className='image-preview' />
          <button className='delete-image-button' onClick={()=>{
            setPreviewImg("")
            setImg(null)
          }}>
            <MdDeleteOutline size={30} />
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageSelector