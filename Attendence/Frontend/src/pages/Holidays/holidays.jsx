import React, { useEffect, useState } from "react";
import requestApi from "../../components/utils/axios";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import Button from "../../components/Button/Button";
import Select from 'react-select';
import customStyles from "../../components/applayout/selectTheme";
import Loader from '../../components/Loader/loader'
import './holidays.css';
import date from '../../assets/date.png';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';

function Holidays(){
    return <Body/>
}

function Body(){
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedDates, setSelectedDates] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
    const [loading, setLoading] = useState(true);

    const yearOptions = [
        { value: "I", label: "I" },
        { value: "II", label: "II" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" },
        { value: "All", label: "All" }

    ];

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
            setLoading(false);
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
            console.log(selectedDates);
            const response = await requestApi("POST", '/dates', { 
                year: selectedYear.value, 
                dates: selectedDates });

            if (response.success) {
                console.log('Response from backend:', response);
                fetchHolidays();
            } else {
                console.log('Error response from backend:', response.error);
            }
        } catch (error) {
            console.error('Error sending data to backend:', error);
        }
    };

    const handleYearChange = (selectedOption) => {
        setSelectedYear(selectedOption);
    };

    const groupedHolidays = holidays.reduce((acc, holiday) => {
        const month = parseDateToMonth(holiday);
        if (!acc[month]) acc[month] = [];
        acc[month].push(holiday);
        return acc;
    }, {});

    const allMonths = [
        ...new Array(12).fill(0).map((_, index) => {
            const adjustedIndex = (currentMonthIndex + index) % 12;
            return new Date(2000, adjustedIndex).toLocaleString('default', { month: 'long' });
        })
    ];

    return (
        <div className="holidays-page">
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="year-select-div" style={{
                        zIndex:'2',
                        width:'200px'
                    }}>
                    <Select 
                            options={yearOptions}
                            value={selectedYear}
                            onChange={handleYearChange}
                            placeholder="Select Year"
                            styles={customStyles} 
                            className="year-dropdown"
                            isClearable
                            
                        />
                    </div>

                    {selectedYear && (
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
                    )}

                    <div className="calendar-container">
                        {allMonths.map(month => (
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
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Holidays;
