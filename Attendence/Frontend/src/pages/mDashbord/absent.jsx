import React, { useState, useEffect } from 'react';
import requestApi from '../../components/utils/axios';
import InputBox from '../../components/TextBox/textbox';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper } from '@mui/material';
import PropTypes from 'prop-types';
import moment from 'moment';

const AbsentTable = ({ mentorId }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const currentDate = moment().format('DD-MM-YYYY'); 

  useEffect(() => {
    const fetchAbsentData = async () => {
      try {
        const response = await requestApi('GET', `/mdash?mentor=${mentorId}`);
        setData(response.data.today_absent_records);
      } catch (error) {
        console.error('Error fetching absent data', error);
      }
    };

    fetchAbsentData();
  }, [mentorId]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = data.filter((record) =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase())||
  record.register_number.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="m-table">
        <h4>Absent Stundents -{currentDate} </h4>
      <InputBox
        placeholder="Search by Name, Register Number.."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <TableContainer component={Paper}>
        <Table className="custom-table">
          <TableHead sx={{ backgroundColor: '#2a3645' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>S.No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>Register Number</TableCell>
            </TableRow>
          </TableHead>
          {data.length>0 ?(<TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.register_number}</TableCell>
                </TableRow>
              ))}
          </TableBody>)
          :
          <p>No records found</p>
          }
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
};

AbsentTable.propTypes = {
  mentorId: PropTypes.string.isRequired,
};

export default AbsentTable;
