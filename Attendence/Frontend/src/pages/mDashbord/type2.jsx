import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper } from '@mui/material';
import requestApi from '../../components/utils/axios';
import InputBox from '../../components/TextBox/textbox';


const Type2Table = ({ mentor }) => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await requestApi("GET",`/type2?mentor=${mentor}`);
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
            student.register_number.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h4>NIP / Arrear Students List</h4>
            <InputBox
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or register number..."
                />
            <Paper>
                
                <TableContainer>
                    <Table className='custom-table'>
                        <TableHead sx={{ backgroundColor: '#2a3645' }}>
                            <TableRow>
                                <TableCell>S.No</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Register Number</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((student, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index+1}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.register_number}</TableCell>
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
                    sx={{
                        backgroundColor: 'var(--text)', 
                        '.MuiTablePagination-toolbar': {
                          backgroundColor: 'var(--background-1)', 
                        },
                      }}
                />
            </Paper>
        </div>
    );
};

export default Type2Table;
