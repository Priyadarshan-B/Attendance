import React, { Component } from "react";
import MentorMapping from "./mentor/mentor";
import Nip from "./nip/nip";
import MapStudent from "./mapStudent/mapStudent";
import SemDates from "./semDates/sem_dates";
import Holidays from "../Holidays/holidays";
import TimeSlotForm from "./timeSlots/timeSlots";
import RoleChange from "./Master/role";
import SlotAttendance from "./Master/slotAttendance";
import Student from "../Students/student";
import Biometrics from "./Master/biometrics";
import MAttendance from "./Master/Attendance";
import './style.css';

function Dashboard() {
    return (
  <Body />
    );
}

class Body extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: null
        };
    }

    setPage = (page) => {
        this.setState({ currentPage: page });
    }

    renderPage = () => {
        const { currentPage } = this.state;
        switch (currentPage) {
            case 'MentorMapping':
                return <MentorMapping />;
            case 'Holidays':
                return <Holidays />;
            case 'SemDates':
                return <SemDates />;
            case 'Nip':
                return <Nip />;
            case 'MapStudent':
                return <MapStudent />;
                case 'TimeSlot':
                    return <TimeSlotForm />;
            case 'RoleChange':
                return <RoleChange/>
            case 'slotAtt':
                return <SlotAttendance/>
            case 'student':
                return <Student/>
            case 'bio':
                return <Biometrics/>
            case 'att':
                return <MAttendance/>
            default:
                return <div className="placeholder">Select a page to display</div>;
        }
    }

    render() {
        return (
            <div className="dashboard-container">
                <div className="button-container">
                    <button className="nav-button" onClick={() => this.setPage('MentorMapping')}>Mentor Map</button>
                    <button className="nav-button" onClick={() => this.setPage('Holidays')}>Holidays</button>
                    <button className="nav-button" onClick={() => this.setPage('SemDates')}>Semester Dates</button>
                    <button className="nav-button" onClick={() => this.setPage('Nip')}>Student Type</button>
                    <button className="nav-button" onClick={() => this.setPage('MapStudent')}>Map Role Student</button>
                    <button className="nav-button" onClick={() => this.setPage('TimeSlot')}>Time Slots</button>
                    <button className="nav-button" onClick={() => this.setPage('RoleChange')}>Role Change</button>
                    <button className="nav-button" onClick={() => this.setPage('slotAtt')}>Slot Attendance</button>
                    <button className="nav-button" onClick={() => this.setPage('student')}>Student Records</button>
                    <button className="nav-button" onClick={() => this.setPage('bio')}>Biometrics</button>
                    <button className="nav-button" onClick={() => this.setPage('att')}>Attendance</button>

                </div>
                <div className="page-container">
                    {this.renderPage()}
                </div>
            </div>
        );
    }
}

export default Dashboard;
