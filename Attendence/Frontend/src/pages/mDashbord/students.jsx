import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper } from '@mui/material';
import requestApi from '../../components/utils/axios';
import InputBox from '../../components/TextBox/textbox';
import approve from '../../assets/approve.png'
import reject from '../../assets/decline.png'
import moment from 'moment'; 

const MentorStudentsTable = ({ mentor }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await requestApi("GET",`/mentor-students?mentor=${mentor}`);
                setStudents(response.data);
                setFilteredStudents(response.data);
                
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [mentor]);

    useEffect(() => {
        const filteredData = students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.register_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.year.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredStudents(filteredData);
        setPage(0); // Reset to first page after filtering
    }, [searchQuery, students]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    

    return (
        <div className='m-table'>
            <h4>Student List</h4>
             <InputBox
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, register number..."
                />
            <Paper>
               
                <TableContainer>
                    <Table className="custom-table">
                        <TableHead sx={{ backgroundColor: '#2a3645' }}>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell >Name</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Register Number</TableCell>
                                <TableCell> Status</TableCell>
                                <TableCell>Approval Date</TableCell>
                                <TableCell>Due Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index+1}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.year}</TableCell>
                                    <TableCell>{student.register_number}</TableCell>
                                    <TableCell>
                                        <img
                                            src={student.att_status === "1" ? approve : reject}
                                            alt={student.att_status === "1" ? "Approved" : "Over Due"}
                                            style={{ width: 20, height: 20 }}
                                        />
                                    </TableCell>                                    <TableCell>{moment(student.app_date).format('YYYY-MM-DD ')}</TableCell>
                                    <TableCell>{moment(student.due_date).format('YYYY-MM-DD ')}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredStudents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
};

export default MentorStudentsTable;
