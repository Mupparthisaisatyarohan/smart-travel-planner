import React from 'react'
import { Component } from 'react'
import { MdClose, MdOutlineDateRange } from 'react-icons/md';
import { format } from 'date-fns'
import "./DateSelector.css"
import { DayPicker } from "react-day-picker";

class DateSelector extends Component {
    state={
        openDatePicker:false,
    }
    setOpenDatePicker=()=>this.setState(prev=>({openDatePicker:!prev.openDatePicker}))
    render(){
        const {date,setDate}=this.props;
        const {openDatePicker}=this.state;
        return (
            <>
                <div>
                    <button className='date-selector-button' onClick={this.setOpenDatePicker}>
                        <MdOutlineDateRange size={20} color="#000"/>
                        {date?format(date, 'yyyy/MM/dd'):format(new Date(), 'yyyy/MM/dd')}
                    </button>
                </div>
                {openDatePicker&&<div className='date-selector-container'>
                    <button className='date-selector-close' onClick={this.setOpenDatePicker}>
                        <MdClose size={20} color="#000"/>
                    </button>
                    <DayPicker
                      captionLayout='dropdown-buttons'
                      mode="single"
                      animate
                      selected={date ?? undefined}
                      onSelect={(d) => {
                        if (typeof setDate === 'function') setDate(d);
                        this.setState({ openDatePicker: false });
                      }}
                      onChange={(d) => {
                        if (typeof setDate === 'function') setDate(d);
                      }}
                      pagedNavigation
                    />
                </div>}
            </>
        )
    }
}

export default DateSelector