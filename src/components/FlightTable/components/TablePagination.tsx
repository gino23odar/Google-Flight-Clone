import { Box, FormControl, InputLabel, Select, MenuItem, Pagination, SelectChangeEvent } from '@mui/material';

interface TablePaginationProps {
    itemsPerPage: number;
    totalPages: number;
    page: number;
    onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
    onRowsPerPageChange: (event: SelectChangeEvent<number>) => void;
}

export const TablePagination = ({
    itemsPerPage,
    totalPages,
    page,
    onPageChange,
    onRowsPerPageChange,
}: TablePaginationProps) => (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        p: 2.5
    }}>
        <FormControl size="small">
            <InputLabel id="rows-per-page-label">Rows</InputLabel>
            <Select
                labelId="rows-per-page-label"
                value={itemsPerPage}
                label="Rows"
                onChange={onRowsPerPageChange}
                sx={{ minWidth: 80 }}
            >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={25}>25</MenuItem>
            </Select>
        </FormControl>
        <Pagination
            count={totalPages}
            page={page}
            onChange={onPageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
        />
    </Box>
); 