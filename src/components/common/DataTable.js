import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { colors } from '../../config/theme';

const DataTable = ({
  columns,
  data,
  loading = false,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  emptyMessage = 'No data available',
}) => {
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '12px',
          border: `1.5px solid ${colors.border}26`,
          boxShadow: `0 4px 12px ${colors.shadow}14`,
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 6,
            }}
          >
            <CircularProgress sx={{ color: colors.brandRed }} />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: `${colors.backgroundLight}80`,
                    borderBottom: `2px solid ${colors.divider}66`,
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: colors.textPrimary,
                        padding: '16px 16px',
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      sx={{
                        textAlign: 'center',
                        padding: 6,
                        color: colors.textSecondary,
                      }}
                    >
                      <Typography variant="body2">{emptyMessage}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow
                      key={row.id || index}
                      onClick={() => onRowClick && onRowClick(row)}
                      sx={{
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': onRowClick
                          ? {
                              backgroundColor: `${colors.brandRed}08`,
                            }
                          : {},
                        borderBottom: `1px solid ${colors.divider}33`,
                      }}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          sx={{
                            padding: '14px 16px',
                            fontSize: 14,
                            color: colors.textPrimary,
                          }}
                        >
                          {column.render
                            ? column.render(row[column.id], row)
                            : row[column.id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {totalCount > 0 && (
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[10, 25, 50, 100]}
                sx={{
                  borderTop: `1px solid ${colors.divider}33`,
                  '& .MuiTablePagination-toolbar': {
                    padding: '12px 16px',
                  },
                }}
              />
            )}
          </>
        )}
      </TableContainer>
    </Box>
  );
};

export default DataTable;
