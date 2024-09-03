import React, { useState, useEffect } from "react";
import requestApi from "../../../components/utils/axios";
import { 
  TextField,  Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogActions, DialogContent, DialogTitle, 
  Button, Paper, TablePagination 
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { Edit, Delete } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import Buttons from "../../../components/Button/Button";
import moment from 'moment';
import './sem_dates.css';
import Popup from "../../../components/popup/popup";
import Select from 'react-select';
import customStyles from "../../../components/applayout/selectTheme";


function SemDates() {
    return <Body />;
}

function Body() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openEdit, setOpenEdit] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [openPopup, setOpenPopup] = useState(false); // State for the popup
    const [deleteId, setDeleteId] = useState(null); // State to hold the ID of the item to delete

    const years = [
        { value: "I", label: "I" },
        { value: "II", label: "II" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await requestApi('GET', '/sem-dates');
                setData(response.data);
            } catch (error) {
                toast.error('Failed to fetch semester dates');
            }
        };

        fetchData();
    }, []);

    const handleEditClick = (row) => {
        setEditRow(row);
        setFromDate(moment(row.from_date).format('YYYY-MM-DD'));
        setToDate(moment(row.to_date).format('YYYY-MM-DD'));
        setOpenEdit(true);
    };

    const handleEditSubmit = async () => {
        try {
            await requestApi('PUT', `/sem-dates`, {
                id: editRow.id,
                from_date: fromDate,
                to_date: toDate,
            });
            toast.success('Semester dates updated successfully!');
            setOpenEdit(false);
            setEditRow(null);
            setData(prevData =>
                prevData.map(item => item.id === editRow.id ? { ...item, from_date: fromDate, to_date: toDate } : item)
            );
        } catch (error) {
            toast.error('Failed to update semester dates');
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id); 
        setOpenPopup(true);
    };

    const handleConfirmDelete = async () => {
        console.log(deleteId)
        try {
            await requestApi('PUT', '/sem-date', { id: deleteId });
            setData(data.filter(row => row.id !== deleteId));
            toast.success('Semester date deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete semester date');
        } finally {
            setOpenPopup(false); 
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedStartDate = startDate ? format(startDate, 'dd-MM-yyyy') : null;
        const formattedEndDate = endDate ? format(endDate, 'dd-MM-yyyy') : null;

        try {
            const response = await requestApi("POST", "/sem-dates", {
                from_date: formattedStartDate,
                to_date: formattedEndDate,
                year: selectedYear.value,
            });
            setData([...data, response.data]);
            
            toast.success('Semester dates saved successfully!');
            setStartDate(null)
            setEndDate(null)
            setSelectedYear(null)
            
        } catch (error) {
            toast.error("Error saving semester dates");
        }
    };

    return (
        <div>
            <h3>Semester Dates</h3>
            <br />
            <div className="sem-dates-container">
                <form onSubmit={handleSubmit} className="sem-dates-form">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Select
                            options={years}
                            value={selectedYear}
                            onChange={setSelectedYear}
                            styles={customStyles} 
                            placeholder="Select Year"
                            className="sem-select"
                        />
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                            sx={{backgroundColor:'var(--background)', color:'var(--text)'}}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <Buttons type="submit" label="Submit" />
                </form>
            </div>
            <br />
            <div>
                <h3>Available Semester Dates</h3>
            </div>
            <br />
            <div className="table-container">
                <TableContainer component={Paper}>
                    <Table className="custom-table">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Year</b></TableCell>
                                <TableCell><b>From Date</b></TableCell>
                                <TableCell><b>To Date</b></TableCell>
                                <TableCell><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.year}</TableCell>
                                    <TableCell>{moment(row.from_date).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>{moment(row.to_date).format('YYYY-MM-DD')}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditClick(row)} sx={{ color: 'blue' }}>
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(row.id)} sx={{ color: 'red' }}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={data.length}
                        page={page}
                        onPageChange={handlePageChange}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        sx={{
                            backgroundColor: 'var(--text)',
                            '.MuiTablePagination-toolbar': {
                              backgroundColor: 'var(--background-1)',
                            },
                          }}
                    />
                </TableContainer>
            </div>

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                <DialogTitle>Edit Semester Dates</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="From Date"
                        type="date"
                        fullWidth
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="To Date"
                        type="date"
                        fullWidth
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>

            <Popup
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                onConfirm={handleConfirmDelete}
                text="Are you sure you want to delete this semester date?"
            />
        </div>
    );
}

export default SemDates;