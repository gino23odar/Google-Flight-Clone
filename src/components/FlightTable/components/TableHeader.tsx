import { Box, Theme, IconButton, Menu, MenuItem } from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useState } from 'react';

export type SortField = 'price' | 'stops' | 'duration';

interface TableHeaderProps {
    isRoundTrip: boolean;
    theme: Theme;
    sortField: SortField | null;
    sortDirection: 'asc' | 'desc';
    onSort: (field: SortField, direction: 'asc' | 'desc') => void;
}

export const TableHeader = ({ 
    isRoundTrip, 
    theme, 
    sortField, 
    sortDirection, 
    onSort 
}: TableHeaderProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSortOption = (field: SortField) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(field, newDirection);
        handleClose();
    };

    const headers = [
        { id: 'details', label: 'Flight Details' },
        { id: 'stops', label: 'Stops', sortable: true },
        { id: 'price', label: 'Price', sortable: true },
        ...(isRoundTrip ? [{ id: 'action', label: 'Action' }] : [])
    ];

    return (
        <thead>
            <tr>
                {headers.map((header) => (
                    <Box
                        key={header.id}
                        component="th"
                        sx={{
                            bgcolor: theme.palette.action.hover,
                            border: `1px solid ${theme.palette.divider}`,
                            px: 2,
                            py: 1,
                            cursor: header.sortable ? 'pointer' : 'default',
                            position: 'relative',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span>{header.label}</span>
                        {header.sortable && (
                            <>
                                <IconButton 
                                    size="small" 
                                    onClick={handleSortClick}
                                    sx={{ ml: 1 }}
                                >
                                    <SortIcon fontSize="small" />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={() => handleSortOption('price')}>
                                        Sort by Price {sortField === 'price' && (sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSortOption('stops')}>
                                        Sort by Stops {sortField === 'stops' && (sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSortOption('duration')}>
                                        Sort by Duration {sortField === 'duration' && (sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                ))}
            </tr>
        </thead>
    );
}; 