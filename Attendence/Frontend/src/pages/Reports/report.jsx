import React, { useState } from "react";
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
import './report.css';

function ReportPage() {
    return (
  <Body />
    );
}

function Body() {
    const [absentYear, setAbsentYear] = useState();
    const [presentYear, setPresentYear] = useState();
    const [absentDate, setAbsentDate] = useState(null);
    const [presentDate, setPresentDate] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    const handleDownload = async (type) => {
        try {
            let apiEndpoint;
            let fileName;

            if (type === 'absent') {
                apiEndpoint = `/ab-report?year=${absentYear.value}&date=${formatDate(absentDate)}`;
                fileName = `studentsAbsent-${absentYear.value}-${formatDate(absentDate)}.xlsx`;
            } else if (type === 'present') {
                apiEndpoint = `/pre-report?year=${presentYear.value}&date=${formatDate(presentDate)}`;
                fileName = `studentsPresent-${presentYear.value}-${formatDate(presentDate)}.xlsx`;
            } else if (type === 'student') {
                const year = selectedYear?.value || 'All';
                apiEndpoint = `/student-report?year=${year}`;
                fileName = `StudentReport-${year}.xlsx`;
            }

            if (!apiEndpoint || !fileName) return;

            const response = await requestApi("GET", apiEndpoint);
            let data = response.data;

            if (type === 'student') {
                // Remove id, student, and status fields from each object
                data = data.map(({ id, student, status, ...rest }) => rest);
            }

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
        <div className="report-container">
                            <h2>Summary</h2>
            <div className="report-flex">
                <div className="absentReport" style={{ flex: '1' }}>
                    <h3>Absentee Report</h3>
                    <br />
                    <div>
                        <div className="select-date">
                            <div style={{ flex: '1', width: '300px' }}>
                                <Select
                                    value={absentYear}
                                    onChange={setAbsentYear}
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
                            <div style={{ flex: '1', width: '300px' }}>
                                <Select
                                    value={presentYear}
                                    onChange={setPresentYear}
                                    options={yearOptions}
                                    styles={customStyles}
                                    placeholder='Select Year..'
                                    isClearable
                                />
                            </div>
                            <div style={{ flex: '1', textAlign: 'center' }}>
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
            <div className="presentReport" >
                <h3>Student Report</h3>
                <br />
                <div className="select-year">
                    <div style={{ flex: '1', width: '300px' }}>
                        <Select
                            value={selectedYear}
                            onChange={setSelectedYear}
                            options={yearOptions}
                            styles={customStyles}
                            placeholder='Select Year..'
                            isClearable
                        />
                    </div>
                    <Button
                        onClick={() => handleDownload('student')}
                        label='Download Student Report'
                    />
                </div>
            </div>
            </div>

        </div>
    );
}

export default ReportPage;
