import React, { useEffect, useState } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import "../../components/applayout/styles.css";
import requestApi from "../../components/utils/axios";
import DatePicker from "react-multi-date-picker"
import DatePanel from "react-multi-date-picker/plugins/date_panel"
import Button from "../../components/Button/Button";
import './holidays.css'
import date from '../../assets/date.png'
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';


function Holidays(){
    return <Body/>
}
function Body(){
    const [selectedDates, setSelectedDates] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
    const [loading, setLoading] = useState(true); 



    useEffect(() => {
        fetchHolidays();
    }, [currentMonthIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMonthIndex(new Date().getMonth());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    const fetchHolidays = async () => {
        try {
            const response = await requestApi("GET", "/dates");
            console.log('Response from backend:', response);
            if (!response || !response.success) {
                throw new Error('Failed to fetch holidays');
            }
            setHolidays(response.data);
        } catch (error) {
            console.error('Error fetching holidays:', error);
        } finally {
            setLoading(false); // Set loading to false after data is fetched
        }
    };

    const parseDateToMonth = (dateString) => {
        const date = new Date(dateString);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthNames[date.getMonth()];
    };

    const parseDateToDDMMYYYY = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return `${year}-${month}-${day}`;
    };

    const handleDateChange = (newDates) => {
        const formattedDates = newDates.map(date => parseDateToDDMMYYYY(date.toString()));
        setSelectedDates(formattedDates);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            console.log(selectedDates)
            const response = await requestApi("POST", '/dates', { dates: selectedDates });

            if (response.success) {
                console.log('Response from backend:', response);
                fetchHolidays()
            } else {
                console.log('Error response from backend:', response.error);
            }
        } catch (error) {
            console.error('Error sending data to backend:', error);
        }
    };

    const groupedHolidays = holidays.reduce((acc, holiday) => {
        const month = parseDateToMonth(holiday);
        if (!acc[month]) acc[month] = [];
        acc[month].push(holiday);
        return acc;
    }, {});

    // Create an array of all months
    const allMonths = [
        ...new Array(12).fill(0).map((_, index) => {
            const adjustedIndex = (currentMonthIndex + index) % 12;
            return new Date(2000, adjustedIndex).toLocaleString('default', { month: 'long' });
        })
    ];

    return (
        <div className="holidays-page">
            <div className="add-holidays-div">
                <div className="date-picker">
                    <DatePicker
                        multiple
                        plugins={[<DatePanel />]}
                        value={selectedDates}
                        onChange={handleDateChange}
                        style={{ padding: '7px', width: "300px" }}
                        placeholder="Select Holidays"
                    />
                </div>
                <div className="button-submit">
                    <Button label="Submit" onClick={handleSubmit} />
                </div>
            </div>


            <div className="calender-container">

                {loading ? (
                    <div className="loader-page1">
                        <div className="loader"></div>
                    </div>
                ) : (
                    allMonths.map(month => (
                        <div className="display-holidays-grid" key={month}>
                            <h3 className="mon-name">{month}</h3>
                            <div className="div-grid">
                                {groupedHolidays[month] && groupedHolidays[month].length > 0 ? (
                                    groupedHolidays[month].map((date, index) => (
                                        <div key={index} className="holiday-item">
                                            {date}
                                            <div className="delete-icon-div">
                                                <DeleteForeverTwoToneIcon sx={{ fontSize: "16px", position: "relative", top: "2px", color: "red", left: "1px" }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-items">
                                        <img src={date} alt="img" className="date-img" />
                                        No holidays added
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

            </div>

        </div>
    );
}
export default Holidays
