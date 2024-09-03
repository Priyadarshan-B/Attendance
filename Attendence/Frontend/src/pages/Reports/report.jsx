import React, { useState, useEffect } from "react";
import AppLayout from "../../components/applayout/AppLayout";
import '../../components/applayout/styles.css';
import * as XLSX from 'xlsx';
import requestApi from "../../components/utils/axios";
import Select from 'react-select';
import Button from "../../components/Button/Button";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from "@mui/material/TextField";
import customStyles from "../../components/applayout/selectTheme";
import { ThemeProviderComponent } from "../../components/applayout/dateTheme";
import './report.css';

function AbReport() {
    return (
        <ThemeProviderComponent>
            <AppLayout body={<Body />} />
        </ThemeProviderComponent>
    );
}

function Body() {
    const [year, setYear] = useState();
    const [absentDate, setAbsentDate] = useState(null);
    const [presentDate, setPresentDate] = useState(null);

    const handleDownload = async (type) => {
        try {
            let apiEndpoint;
            let fileName;

            if (type === 'absent') {
                apiEndpoint = `/ab-report?year=${year.value}&date=${formatDate(presentDate)}`;
                fileName = `studentsAbsent-${year.value}-${formatDate(absentDate)}.xlsx`;
            } else if (type === 'present') {
                apiEndpoint = `/pre-report?year=${year.value}&date=${formatDate(presentDate)}`;
                fileName = `studentsPresent-${year.value}-${formatDate(presentDate)}.xlsx`;
            }

            if (!apiEndpoint || !fileName) return;

            const response = await requestApi("GET", apiEndpoint);
            const data = response.data;

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

            XLSX.writeFile(workbook, fileName);
        } catch (error) {
            console.error(`Error downloading the ${type} report`, error);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const yearOptions = [
        { value: 'All', label: 'All' },
        { value: 'I', label: 'I' },
        { value: 'II', label: 'II' },
        { value: 'III', label: 'III' },
        { value: 'IV', label: 'IV' }
    ];

    return (
        <div className="report-flex">
            <div className="absentReport" style={{ flex: '1' }}>
                <h3>Absentee Report</h3>
                <br />
                <div>
                    <div className="select-date">
                        <div style={{ flex: '1' }}>
                            <Select
                                value={year}
                                onChange={setYear}
                                options={yearOptions}
                                styles={customStyles} 
                                placeholder='Select Year..'
                                isClearable
                            />
                        </div>
               
                            <div style={{ flex: '1', textAlign: 'center' }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        value={absentDate}
                                        onChange={(newValue) => setAbsentDate(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                   
                    </div>
                    <Button
                        onClick={() => handleDownload('absent')}
                        label='Download Absent Report'
                    />
                </div>
            </div>
            <div className="presentReport" style={{ flex: '1' }}>
                <h3>Present Report</h3>
                <br />
                <div>
                    <div className="select-date">
                        <div style={{ flex: '1' }}>
                            <Select
                                value={year}
                                onChange={setYear}
                                options={yearOptions}
                                styles={customStyles}
                                placeholder='Select Year..'
                                isClearable
                            />
                        </div>
                    
                            <div style={{ flex: '1' , textAlign:'center'}}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        value={presentDate}
                                        onChange={(newValue) => setPresentDate(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>
                    
                    
                    </div>
                    <Button
                            onClick={() => handleDownload('present')}
                            label='Download Present Report'
                        />
                </div>
            </div>
        </div>
    );
}

export default AbReport;
