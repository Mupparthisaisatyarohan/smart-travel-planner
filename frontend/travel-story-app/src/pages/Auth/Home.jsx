import React from 'react'
import "./Home.css"
import Navbar from './Navbar';
import {Component} from 'react'
import axiosInstance from '../../utils/axiosInstance';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import { toast } from 'react-toastify';
import {MdAdd} from 'react-icons/md';
import Modal from 'react-modal';
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from '../../components/Cards/ViewTravelStory';
import EmptyCard from '../../components/Cards/EmptyCard';
import { DayPicker } from 'react-day-picker';
import {format} from "date-fns"
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import { getEmptyCardMessage } from '../../utils/helper';

class Home extends Component {
  state = {
    user: null,
    allStories:[],
    sharedStories:[],
    openAddEditModal:{
      isShown:false,type:"add",data:null,
    },
    openViewMModal:{
      isShown:false,data:null
    },
    searchQuery:"",
    filterType:"",
    dateRange:{from:null,to:null},
    activeSection: "stories"
  }
  componentDidMount() {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login';
      return;
    }
    this.getAllTravelStories();
    this.getSharedStories();
    this.getUserInfo();
  }

  //get user info
  getUserInfo = async() => {
    try{
        const response = await axiosInstance.get('/get-user');
        console.log('User API Response:', response.data);
        if(response.data && response.data.user){
          console.log('Setting user state:', response.data.user);
          const userData = response.data.user;
          // Ensure username exists
          if(userData.username) {
            this.setState({user: userData});
          } else {
            console.error('Username not found in user data:', userData);
          }
        } else {
          console.warn('User data not found in response:', response.data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }
  }

  //get all stories
  getAllTravelStories = async() => {
    try{
        const response = await axiosInstance.get('/get-all-stories');
        if(response.data && response.data.travelStories){
          this.setState({allStories: response.data.travelStories});
        } 
      } catch (err) {
        console.error('Error fetching stories:', err);
      }
  }

  //get all shared stories
  getSharedStories = async() => {
    try{
        const response = await axiosInstance.get('/get-shared-stories');
        if(response.data && response.data.sharedStories){
          this.setState({sharedStories: response.data.sharedStories});
        } 
      } catch (err) {
        console.error('Error fetching shared stories:', err);
      }
  }

  //handle edit story click
  handleEdit = (data) => {
    this.setState(prevState => ({
      openAddEditModal: {
        isShown: !prevState.openAddEditModal.isShown,
        type: "edit",
        data: data
      }
    }));
  };

  //Handle travel story click
  handleViewStory = (data) => {
    this.setState({ openViewMModal: { isShown: true, data } });
  }


  //update isFavorite
  updateIsFavorite =async (story) => {
    const storyId=story._id;
    console.log("Updating favorite for story ID:", storyId);
    try{
      const response=await axiosInstance.put('/update-is-favorite/'+storyId,{
        isFavorite:!story.isFavorite
      });
      console.log(story.isFavorite);
      if(response.data && response.data.travelStory){
        toast.success('Favorite status updated successfully!');
        if(this.state.filterType==="search" && this.state.searchQuery){
          this.onSearchStory(this.state.searchQuery);
        }else if(this.state.filterType==="date"){
          this.filterStoriesByDate(this.state.dateRange);
        }else{
          this.getAllTravelStories();
        }
      }
    }
    catch(err){
      console.error('Error updating favorite status:', err);
    }
  }

  //update isShared
  updateIsShared = async (story) => {
    const storyId = story._id;
    console.log("Updating share for story ID:", storyId);
    try {
      const response = await axiosInstance.put('/update-is-shared/' + storyId, {
        isShared: !story.isShared
      });
      if (response.data && response.data.travelStory) {
        toast.success(response.data.message);
        if (this.state.filterType === "search" && this.state.searchQuery) {
          this.onSearchStory(this.state.searchQuery);
        } else if (this.state.filterType === "date") {
          this.filterStoriesByDate(this.state.dateRange);
        } else {
          this.getAllTravelStories();
        }
        this.getSharedStories();
      }
    }
    catch (err) {
      console.error('Error updating share status:', err);
      toast.error('Failed to update share status');
    }
  }
  
  setOpenAddEditModal=()=> {
    this.setState(prevState=>{
      return {
        openAddEditModal:{isShown:!prevState.openAddEditModal.isShown,type:"add",data:null}
    }});
  }

  deleteTravelStory=async(data)=>{
    if (!data || !data._id) {
      toast.error("Story information is missing");
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm("Are you sure you want to delete this story? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    const storyId = data._id;

    try {
      const response = await axiosInstance.delete("/delete-story/" + storyId);

      if (response.data && !response.data.error){
        toast.success("Story Deleted Successfully");
        // Close the view modal
        this.setState({ openViewMModal: { isShown: false, data: null } });
        // Refresh the stories list
        this.getAllTravelStories();
      } else {
        toast.error(response?.data?.message || "Failed to delete story");
      }
    }
    catch(error){
      console.error('Delete error:', error);
      toast.error(error?.response?.data?.message || error.message || "Failed to delete story");
    }
  }

  setFilterType=(type)=>{
    this.setState({filterType:type});
  }

  setDateRange=(dateRange)=>{
    this.setState({dateRange});
  }

  //handle filter travel story
  filterStoriesByDate=async(dateRange)=>{
    // Filter stories based on date range
    try{
      const startDate=dateRange.from ? format(dateRange.from, 'yyyy/MM/dd'):null;
      const endDate=dateRange.to ? format(dateRange.to, 'yyyy/MM/dd') :null;

      if(startDate && endDate){
        const response= await axiosInstance.get("/filter-by-date",{
          params:{startDate,endDate},
        });

        if(response.data && response.data.filteredStories){
            this.setFilterType("date");
            this.setAllStories(response.data.filteredStories);
        }
      }
    }catch(err){
      console.log(err);
    }
  }

  //Handle date range select
  handleDayClick=(selectedRange)=>{
    this.setDateRange(selectedRange);
    this.filterStoriesByDate(selectedRange);
  }
  //on search story

  resetFilter=()=>{
    this.setState({dateRange:{from:null,to:null},filterType:""});
    this.getAllTravelStories();
  }
  onSearchStory=async(query)=>{
    // Trim the query and check if it's not empty
    const trimmedQuery = query ? query.trim() : "";
    
    if (!trimmedQuery) {
      // If query is empty, show all stories
      this.setFilterType("");
      this.getAllTravelStories();
      return;
    }

    try {
      const response = await axiosInstance.get("/search",{
        params:{
          query: trimmedQuery,
        }
      });
      
      if(response.data && response.data.searchResults){
        this.setFilterType("search");
        this.setAllStories(response.data.searchResults);
      } else if (response.data && response.data.error) {
        console.error('Search error:', response.data.message);
        // Show empty results if search fails
        this.setFilterType("search");
        this.setAllStories([]);
      }
    }
    catch(error){
      console.error('Search error:', error);
      // Show empty results on error
      this.setFilterType("search");
      this.setAllStories([]);
    }
  }

  handleClearSearch=()=>{
    this.setFilterType("");
    this.setSearchQuery("");
    this.getAllTravelStories();
  }

  setAllStories=(stories)=>{
    this.setState({allStories: stories});
  }

  setSearchQuery=(query)=>{
    this.setState({searchQuery: query});
  }

  setActiveSection=(section)=> {
    this.setState({activeSection: section});
  }

  render() {
    const {user,allStories,openViewMModal,searchQuery,dateRange,activeSection}=this.state;
    return (
      <>
      <div>
        <Navbar userInfo={user} searchQuery={searchQuery}
         setSearchQuery={this.setSearchQuery} onSearchNote={this.onSearchStory}
         handleClearSearch={this.handleClearSearch} />

        <div className="home-container">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Dashboard</h2>
            </div>
            <div className="sidebar-menu">
              <button 
                className={`sidebar-button ${activeSection === 'plans' ? 'active' : ''}`}
                onClick={() => this.setActiveSection('plans')}
              >
                📋 Plans
              </button>
              <button 
                className={`sidebar-button ${activeSection === 'stories' ? 'active' : ''}`}
                onClick={() => this.setActiveSection('stories')}
              >
                📖 Stories
              </button>
              <button 
                className={`sidebar-button ${activeSection === 'shared' ? 'active' : ''}`}
                onClick={() => this.setActiveSection('shared')}
              >
                🔗 Shared
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {activeSection === 'stories' && (
              <>
                <FilterInfoTitle filterType={this.state.filterType} filterDates={dateRange}
                  onClear={()=>{this.resetFilter();}}/>
                <div className="main-content-wrapper">
                  <div className="stories-section">
                    <div className="stories-container">
                      {allStories.filter(item => item.entryType !== 'plan').length>0 ? (
                        allStories.filter(item => item.entryType !== 'plan').map((item) => (
                           (<TravelStoryCard key={item._id} storyData={item}
                            onClick={() => this.handleViewStory(item)}
                            onEdit={()=>this.handleEdit(item)} 
                            onFavouriteClick={()=>this.updateIsFavorite(item)}
                            onShareClick={()=>this.updateIsShared(item)}/>)
                        ))
                      ) : (
                        <EmptyCard message={getEmptyCardMessage(this.state.filterType)}/>
                      )} 
                    </div>
                  </div>
                  <div className="date-picker-section">
                    <DayPicker captionLayout='dropdown-buttons' mode="range"
                    selected={dateRange} onSelect={this.handleDayClick} pagedNavigation/>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'plans' && (
              <>
                <FilterInfoTitle filterType={this.state.filterType} filterDates={dateRange}
                  onClear={()=>{this.resetFilter();}}/>
                <div className="main-content-wrapper">
                  <div className="stories-section">
                    <div className="stories-container">
                      {allStories.filter(item => item.entryType === 'plan').length > 0 ? (
                        allStories.filter(item => item.entryType === 'plan').map((item) => (
                          <TravelStoryCard key={item._id} storyData={item}
                            onClick={() => this.handleViewStory(item)}
                            onEdit={()=>this.handleEdit(item)}
                            onFavouriteClick={()=>this.updateIsFavorite(item)}
                            onShareClick={()=>this.updateIsShared(item)}/>
                        ))
                      ) : (
                        <EmptyCard message="No plans found. Create a travel plan to get started."/>
                      )}
                    </div>
                  </div>
                  <div className="date-picker-section">
                    <DayPicker captionLayout='dropdown-buttons' mode="range"
                      selected={dateRange} onSelect={this.handleDayClick} pagedNavigation/>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'shared' && (
              <>
                <div className="main-content-wrapper">
                  <div className="stories-section">
                    {/* Shared Stories Section */}
                    <div className="shared-group">
                      <h3 className="shared-heading">📖 Shared Stories</h3>
                      <div className="stories-container">
                        {this.state.sharedStories.filter(item => item.entryType !== 'plan').length > 0 ? (
                          this.state.sharedStories.filter(item => item.entryType !== 'plan').map((item) => (
                            <TravelStoryCard key={item._id} storyData={item}
                              onClick={() => this.handleViewStory(item)}
                              onEdit={()=>this.handleEdit(item)}
                              onFavouriteClick={()=>this.updateIsFavorite(item)}
                              onShareClick={()=>this.updateIsShared(item)}/>
                          ))
                        ) : (
                          <EmptyCard message="No shared stories yet."/>
                        )}
                      </div>
                    </div>

                    {/* Shared Plans Section */}
                    <div className="shared-group shared-group-spaced">
                      <h3 className="shared-heading">📋 Shared Plans</h3>
                      <div className="stories-container">
                        {this.state.sharedStories.filter(item => item.entryType === 'plan').length > 0 ? (
                          this.state.sharedStories.filter(item => item.entryType === 'plan').map((item) => (
                            <TravelStoryCard key={item._id} storyData={item}
                              onClick={() => this.handleViewStory(item)}
                              onEdit={()=>this.handleEdit(item)}
                              onFavouriteClick={()=>this.updateIsFavorite(item)}
                              onShareClick={()=>this.updateIsShared(item)}/>
                          ))
                        ) : (
                          <EmptyCard message="No shared plans yet."/>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div> 
      <Modal isOpen={this.state.openAddEditModal.isShown}
        onRequestClose={this.setOpenAddEditModal}
        contentLabel="Add/Edit Travel Story"
        className="modal-box"
        >
          <AddEditTravelStory 
            type={this.state.openAddEditModal.type}
            entryType={activeSection === 'plans' ? 'plan' : 'story'}
            storyInfo={this.state.openAddEditModal.data}
            onClose={this.setOpenAddEditModal}
            getAllTravelStories={this.getAllTravelStories}
            getSharedStories={this.getSharedStories}/>
        </Modal>

        <Modal
          isOpen={openViewMModal.isShown}
          onRequestClose={() =>
            this.setState({ openViewMModal: { isShown: false } })
          }
          
          className="modal-box"
        >
          <ViewTravelStory
            type={openViewMModal.type}
            storyInfo={openViewMModal.data || null}
            onClose={() =>
              this.setState({ openViewMModal: { isShown: false, data: null } })
            }
            onEditClick={()=>
            {
              this.setState({ openViewMModal: { isShown: false, data: null } })
              this.handleEdit(openViewMModal.data||null);
            }}
            onDeleteClick={()=>{
              this.deleteTravelStory(openViewMModal.data||null);
            }}
          />
        </Modal>
      {(activeSection === 'stories' || activeSection === 'plans') && (
        <button className='modal-button' onClick={this.setOpenAddEditModal}>
          <MdAdd size={24} color="#fff"/>
        </button>
      )}
      </>
    )
  }
}


export default Home