import React from 'react'
import "./AddEditTravelStory.css"
import DateSelector from '../../components/Cards/DateSelector';
import { MdAdd,MdClose, MdDeleteOutline, MdUpdate } from 'react-icons/md';
import { Component } from 'react';
import ImageSelector from '../../components/Cards/ImageSelector';
import VideoSelector from '../../components/Cards/VideoSelector';
import TagInput from '../../components/Cards/TagInput';
import { format } from 'date-fns'
import axiosInstance from '../../utils/axiosInstance';
import uploadVideo from '../../utils/uploadVideo';
import { toast } from 'react-toastify';


class AddEditTravelStory extends Component {
    state={
        visitedDate:null,
        title:"",
        visitedLocation:[],
        storyImg:"",
        storyVideo:"",
        story:"",
        planDetailsByLocation:{},
        planBudget:0
    }

    componentDidMount() {
        this.populateFormData();
    }

    componentDidUpdate(prevProps) {
        // Update form when storyInfo changes (e.g., when switching between add/edit)
        if (prevProps.storyInfo !== this.props.storyInfo) {
            this.populateFormData();
        }
    }

    populateFormData = () => {
        const { storyInfo, type } = this.props;
        if (type === "edit" && storyInfo) {
            // Convert visitedDate string to Date object
            const date = storyInfo.visitedDate ? new Date(storyInfo.visitedDate) : null;
            
            this.setState({
                title: storyInfo.title || "",
                story: storyInfo.story || "",
                visitedLocation: storyInfo.visitedLocation || [],
                visitedDate: date,
                storyImg: storyInfo.imageUrl || "", // Set existing image URL for display
                storyVideo: storyInfo.videoUrl || "", // Set existing video URL for display
                planDetailsByLocation: storyInfo.planDetails || {},
                planBudget: storyInfo.planBudget || 0
            });
        } else {
            // Reset form for add mode
            this.setState({
                visitedDate: null,
                title: "",
                visitedLocation: [],
                storyImg: "",
                storyVideo: "",
                story: "",
                planDetailsByLocation: {},
                planBudget: 0
            });
        }
    }

    setVisitedDate=(date)=>this.setState({visitedDate:date})

    onChangeTitle=(e)=>this.setState({title:e.target.value})

    setStoryImg=(img)=>this.setState({storyImg:img})

    setStoryVideo=(video)=>this.setState({storyVideo:video})

    initializePlanDetailsForLocation = () => ([
        { reason: '', price: 0 }
    ])

    handleLocationAdd = (location) => {
        const trimmedLocation = location.trim();
        if (!trimmedLocation) return;

        if (this.state.visitedLocation.includes(trimmedLocation)) {
            return;
        }

        if (this.props.entryType === 'plan') {
            this.setState((prevState) => ({
                visitedLocation: [...prevState.visitedLocation, trimmedLocation],
                planDetailsByLocation: {
                    ...prevState.planDetailsByLocation,
                    [trimmedLocation]: prevState.planDetailsByLocation[trimmedLocation] || this.initializePlanDetailsForLocation()
                }
            }));
        } else {
            this.setState((prevState) => ({
                visitedLocation: [...prevState.visitedLocation, trimmedLocation]
            }));
        }
    }

    handleLocationRemove = (newLocations) => {
        this.setState((prevState) => {
            const updatedPlanDetails = { ...prevState.planDetailsByLocation };
            prevState.visitedLocation.forEach((location) => {
                if (!newLocations.includes(location)) {
                    delete updatedPlanDetails[location];
                }
            });
            return {
                visitedLocation: newLocations,
                planDetailsByLocation: updatedPlanDetails
            };
        });
    }

    updatePlanDetail = (location, index, field, value) => {
        this.setState((prevState) => {
            const entries = prevState.planDetailsByLocation[location] || [];
            const updatedEntry = {
                ...entries[index],
                [field]: field === 'price' ? Number(value) : value
            };
            return {
                planDetailsByLocation: {
                    ...prevState.planDetailsByLocation,
                    [location]: entries.map((item, idx) => (idx === index ? updatedEntry : item))
                }
            };
        });
    }

    setPlanBudget = (e) => {
        const value = Number(e.target.value || 0);
        this.setState({ planBudget: value });
    }

    getTotalExpense = () => {
        const { planDetailsByLocation } = this.state;
        return Object.values(planDetailsByLocation).reduce((total, rows) => {
            if (!Array.isArray(rows)) return total;
            return total + rows.reduce((rowSum, row) => rowSum + Number(row.price || 0), 0);
        }, 0);
    }

    addPlanDetailRow = (location) => {
        this.setState((prevState) => ({
            planDetailsByLocation: {
                ...prevState.planDetailsByLocation,
                [location]: [
                    ...(prevState.planDetailsByLocation[location] || []),
                    { reason: '', price: 0 }
                ]
            }
        }));
    }

    removePlanDetailRow = (location, index) => {
        this.setState((prevState) => {
            const entries = prevState.planDetailsByLocation[location] || [];
            const updatedEntries = entries.filter((_, idx) => idx !== index);
            return {
                planDetailsByLocation: {
                    ...prevState.planDetailsByLocation,
                    [location]: updatedEntries.length > 0 ? updatedEntries : [{ reason: '', price: 0 }]
                }
            };
        });
    }

    addTravelStory=async ()=>{
        try{
            const entryType = this.props.entryType || 'story';
            let imageUrl="";
            let videoUrl="";
            const {visitedDate,title,storyImg,storyVideo,story,visitedLocation}=this.state;
            // upload image if a File is selected (ImageSelector sets a File object)
            if (storyImg instanceof File) {
                const formData = new FormData();
                formData.append('image', storyImg);
                const imgUpload = await axiosInstance.post('/image-upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrl = (imgUpload && imgUpload.data && imgUpload.data.imageUrl) || "";
            }

            // upload video if a File is selected (VideoSelector sets a File object)
            if (storyVideo instanceof File) {
                const videoData = await uploadVideo(storyVideo);
                videoUrl = (videoData && videoData.videoUrl) || "";
            }

            const response= await axiosInstance.post("/add-travel-story",{
                title,
                story,
                imageUrl:imageUrl||"",
                videoUrl: videoUrl||null,
                visitedLocation,
                visitedDate: (visitedDate ? format(visitedDate, 'yyyy/MM/dd') :""),
                entryType,
                planDetails: entryType === 'plan' ? this.state.planDetailsByLocation : undefined,
                planBudget: entryType === 'plan' ? this.state.planBudget : undefined
            })
            if (response && response.data && !response.data.error) {
                toast.success(entryType === 'plan' ? "Plan Added Successfully" : "Story Added Successfully");
                if (this.props.getAllTravelStories) this.props.getAllTravelStories();
                if (this.props.getSharedStories) this.props.getSharedStories();
                if (this.props.onClose) this.props.onClose();
            } else {
                toast.error(response?.data?.message || 'Failed to add story');
            }
        }
        catch(error){
            console.error('Add error:', error);
            toast.error(error?.response?.data?.message || error.message || 'Something went wrong');
        }
    }

    updateTravelStory=async()=>{
        const {storyInfo, entryType} = this.props;

        if (!storyInfo || !storyInfo._id) {
            toast.error("Story information is missing");
            return;
        }

        const storyId=storyInfo._id;
        const normalizedType = entryType || storyInfo?.entryType || 'story';

        try{
            let imageUrl="";
            let videoUrl="";
            const {visitedDate,title,storyImg,storyVideo,story,visitedLocation}=this.state;
            
            // Check if storyImg is a File object (new image) or a string (existing URL)
            const isNewImage = storyImg instanceof File;
            
            // upload image if a File is selected (ImageSelector sets a File object)
            if(isNewImage){
                const formData = new FormData();
                formData.append('image', storyImg);
                const imgUpload = await axiosInstance.post('/image-upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                imageUrl = (imgUpload && imgUpload.data && imgUpload.data.imageUrl) || "";
            } else {
                // Use existing image URL or the string value
                imageUrl = storyImg || storyInfo.imageUrl || "";
            }

            // Check if storyVideo is a File object (new video) or a string (existing URL)
            const isNewVideo = storyVideo instanceof File;
            
            // upload video if a File is selected (VideoSelector sets a File object)
            if(isNewVideo){
                const videoData = await uploadVideo(storyVideo);
                videoUrl = (videoData && videoData.videoUrl) || "";
            } else {
                // Use existing video URL or the string value
                videoUrl = storyVideo || storyInfo.videoUrl || null;
            }

            // Format visitedDate - use state date if available, otherwise use storyInfo date
            let formattedDate = "";
            if (visitedDate) {
                formattedDate = format(visitedDate, 'yyyy/MM/dd');
            } else if (storyInfo.visitedDate) {
                try {
                    formattedDate = format(new Date(storyInfo.visitedDate), 'yyyy/MM/dd');
                } catch (e) {
                    console.error('Error formatting date:', e);
                    formattedDate = "";
                }
            }

            let postData={
                title,
                story,
                imageUrl: imageUrl,
                videoUrl: videoUrl,
                visitedLocation: visitedLocation || [],
                isFavorite: storyInfo.isFavorite || false,
                visitedDate: formattedDate,
                entryType: normalizedType,
                planDetails: normalizedType === 'plan' ? this.state.planDetailsByLocation : undefined,
                planBudget: normalizedType === 'plan' ? this.state.planBudget : undefined
            }

            const response= await axiosInstance.post("/edit-story/"+storyId,postData)
            if (response && response.data && !response.data.error) {
                toast.success(normalizedType === 'plan' ? "Plan Updated Successfully" : "Story Updated Successfully");
                if (this.props.getAllTravelStories) this.props.getAllTravelStories();
                if (this.props.getSharedStories) this.props.getSharedStories();
                if (this.props.onClose) this.props.onClose();
            } else {
                toast.error(response?.data?.message || 'Failed to update story');
            }
        }
        catch(error){
            console.error('Update error:', error);
            toast.error(error?.response?.data?.message || error.message || 'Something went wrong');
        }
    }

    handleDeleteStoryImg=async()=>{
        const {storyInfo}=this.props;
        if (!storyInfo || !storyInfo._id) {
            toast.error("Story information is missing");
            return;
        }

        const {title,story,visitedLocation,visitedDate}=this.state;
        try {
            // Deleting the Image
            const deleteImgRes = await axiosInstance.delete("/delete-image", {
                data: {
                    imageUrl: storyInfo.imageUrl,
                },
            });

            if (deleteImgRes.data && !deleteImgRes.data.error){
                const storyId = storyInfo._id;
                const formattedDate = visitedDate ? format(visitedDate, 'yyyy/MM/dd') : (storyInfo.visitedDate ? format(new Date(storyInfo.visitedDate), 'yyyy/MM/dd') : "");
                
                const postData = {
                    title,
                    story,
                    visitedLocation: visitedLocation || [],
                    visitedDate: formattedDate,
                    imageUrl: "",
                    isFavorite: storyInfo.isFavorite || false,
                };
                //updating story
                await axiosInstance.post(
                    "/edit-story/"+storyId,postData
                );

                this.setState({storyImg:""});
                toast.success("Image deleted successfully");
                if (this.props.getAllTravelStories) this.props.getAllTravelStories();
            } else {
                toast.error(deleteImgRes.data?.message || "Failed to delete image");
            }
        } catch(error) {
            console.error('Delete image error:', error);
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete image');
        }
    }
    render(){
        const {type,onClose,entryType} = this.props;
        const {visitedDate,title,storyImg,story}=this.state;
        const entryLabel = entryType === 'plan' ? 'Travel Plan' : 'Travel Story';
        const storyFieldLabel = entryType === 'plan' ? 'Plan Details' : 'Your Story';
        const storyPlaceholder = entryType === 'plan' ? 'Describe your plan or itinerary...' : 'Share your travel experiences...';
        const handleAddOrUpdateClick = () => {
            if(!title){
                alert("Enter title");
                return;
            }
            if(!story){
                alert(entryType === 'plan' ? "Enter plan details" : "Enter Story");
                return;
            }
            // For adding a new story, ensure visited date and image are provided
            if(type === "add"){
                if(!visitedDate){
                    alert("Select visited date");
                    return;
                }
                if(!storyImg){
                    alert("Please choose an image to upload");
                    return;
                }
            }
            
            if(type==="edit"){
                this.updateTravelStory();
            }else{
                this.addTravelStory();
            }
        }
        return (
            <div className='modal-whole-container'>
                <div className='modal-container'>
                <div className='modal-heading'>
                    <h5>{type === "add" ? `Add New ${entryLabel}` : `Edit ${entryLabel}`}</h5>
                </div>
                <div className=''>
                    <div className='buttons-container'>
                        {type === "add" ? (
                            <button className='add-story-button' onClick={handleAddOrUpdateClick}>
                                <MdAdd size={20} color="#fff"/>{entryType === 'plan' ? 'ADD PLAN' : 'ADD STORY'}
                            </button>
                        ) : (
                            <button className='add-story-button' onClick={handleAddOrUpdateClick}>
                                <MdUpdate size={20} color="#fff"/>{entryType === 'plan' ? 'UPDATE PLAN' : 'UPDATE STORY'}
                            </button>
                        )}

                        <button className='cancel-button' onClick={onClose}>
                            <MdClose size={20} color="#000"/>
                        </button>
                    </div>
                </div>
                </div>
                <div className='details-container'>
                    <div className='input-container'>
                        <label className='input-label'>Title</label>
                        <input type="text" className='input-box' placeholder='Planning For a Great Adventure'
                        value={title} onChange={this.onChangeTitle}/>
                    </div>
                    <div className='date-input'>
                        <DateSelector date={visitedDate} setDate={this.setVisitedDate}/>
                    </div>
                    <ImageSelector image={storyImg} setImg={this.setStoryImg} handleDeleteStoryImg={this.handleDeleteStoryImg}/>
                    <VideoSelector video={this.state.storyVideo} setVideo={this.setStoryVideo}/>
                    <div className='story-container'>
                        <label className='input-label'>{storyFieldLabel}</label>
                        <textarea className='story-input-box' placeholder={storyPlaceholder} rows={10}
                        value={this.state.story} onChange={(e)=>this.setState({story:e.target.value})}/>
                    </div>
                    {entryType === 'plan' && (
                        <div className='plan-budget-container'>
                            <label className='input-label'>Plan Budget</label>
                            <input
                                type='number'
                                min='0'
                                className='input-box'
                                value={this.state.planBudget}
                                onChange={this.setPlanBudget}
                                placeholder='Enter total budget'
                            />
                            <div className='plan-budget-summary'>
                                <span>Total spent: ₹{this.getTotalExpense()}</span>
                                <span>Remaining: ₹{this.state.planBudget - this.getTotalExpense()}</span>
                            </div>
                        </div>
                    )}
                    <div className=''>
                        <label className='input-label'>Planned Locations</label>
                        <TagInput
                          tags={this.state.visitedLocation}
                          setTags={this.handleLocationRemove}
                          onAddLocation={this.handleLocationAdd}
                        />
                        {entryType === 'plan' && this.state.visitedLocation.length > 0 && (
                            <div className='plan-details-panel'>
                                <h4>Mini-plans & expenses</h4>
                                {this.state.visitedLocation.map((location) => {
                                    const rows = this.state.planDetailsByLocation[location] || this.initializePlanDetailsForLocation();
                                    return (
                                        <div key={location} className='plan-location-block'>
                                            <div className='plan-location-title'>{location}</div>
                                            <table className='plan-details-table'>
                                                <thead>
                                                    <tr>
                                                        <th>Reason</th>
                                                        <th>Price</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rows.map((entry, index) => (
                                                        <tr key={`${location}-${index}`}>
                                                            <td>
                                                                <input
                                                                    type='text'
                                                                    value={entry.reason}
                                                                    onChange={(e) => this.updatePlanDetail(location, index, 'reason', e.target.value)}
                                                                    className='plan-input'
                                                                    placeholder='Enter reason'
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type='number'
                                                                    min='0'
                                                                    value={entry.price}
                                                                    onChange={(e) => this.updatePlanDetail(location, index, 'price', e.target.value)}
                                                                    className='plan-input'
                                                                    placeholder='0'
                                                                />
                                                            </td>
                                                            <td>
                                                                <button
                                                                    type='button'
                                                                    className='plan-row-button remove'
                                                                    onClick={() => this.removePlanDetailRow(location, index)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button
                                                type='button'
                                                className='plan-row-button add'
                                                onClick={() => this.addPlanDetailRow(location)}
                                            >
                                                Add reason
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                
            </div>
  )
 }
}

export default AddEditTravelStory