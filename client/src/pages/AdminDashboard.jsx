import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    Box,
    Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import 'animate.css/animate.min.css';
import Images from './Images';

const useStyles = makeStyles((theme) => ({
    list: {
        '& .animate__animated': {
            animationDuration: '0.5s',
        },
        '& .animate__bounceIn': {
            animationDuration: '1s',
        },
        '& .selected': {
            backgroundColor: '#d7d7d7',
        },
    },
}));

function App() {
    const [labels, setLabels] = useState([]);
    const [newLabel, setNewLabel] = useState('');
    const [view, setView] = useState('labels');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const classes = useStyles();
    const user = useSelector((state) => state.authReducer.authData?.email);

    useEffect(() => {
        fetchLabels();
    }, []);

    const fetchLabels = async () => {
        const response = await axios.get('http://localhost:5000/api/labels');
        setLabels(response.data.labels);
    };

    const handleAddLabel = async () => {
        await axios.post('http://localhost:5000/api/labels', { text: newLabel });
        setNewLabel('');
        fetchLabels();
    };

    const handleDeleteLabels = async () => {
        const labelIds = selectedLabels.map((label) => label._id);

        await axios.delete('http://localhost:5000/api/labels', { data: { ids: labelIds } });
        fetchLabels();
        setSelectedLabels([]);
    };

    const handleLabelToggle = (labelId) => {
        const updatedLabels = labels.map((label) =>
            label._id === labelId ? { ...label, selected: !label.selected } : label
        );
        setLabels(updatedLabels);

        const selected = updatedLabels.filter((label) => label.selected);
        setSelectedLabels(selected);
    };

    const renderLabels = () => (
        <Box>

            <Button sx={{ backgroundColor: 'black', color: 'white', margin: 5 }} variant="contained" onClick={fetchLabels}>
                Refresh Labels
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', margin: 2 }}>
                <TextField
                    type="text"
                    value={newLabel}
                    variant="standard"
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Add new label"
                />
                <Button sx={{ backgroundColor: '#545454', color: 'white', margin: '5px' }} variant="contained" onClick={handleAddLabel}>
                    Add Label
                </Button>
                {selectedLabels.length > 0 && (
                    <Button sx={{ backgroundColor: '#545454', color: 'white', margin: '5px' }} variant="contained" onClick={handleDeleteLabels}>
                        Delete Selected Labels
                    </Button>
                )}
            </Box>
            <List className={classes.list}>
                {labels.map((label) => (
                    <ListItem
                        key={label._id}
                        button
                        onClick={() => handleLabelToggle(label._id)}
                        className={label.selected ? 'selected' : ''}
                    >
                        <ListItemText>
                            {label.text}
                        </ListItemText>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const renderImages = () => (
        <Box align="center">
            <Images />
        </Box>
    );

    const handleLogout = () => {
        localStorage.clear();
        window.location.replace('/');
    };

    return (
        <Box>
            <Typography variant="h3" sx={{ marginLeft: '600px' }}>Admin Dashboard</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-50px' }}>
                <Button variant="contained" onClick={handleLogout} sx={{ height: '30px' }}>
                    Logout
                </Button>
            </Box>
            {user && (
                <Typography variant="body1" sx={{ marginBottom: 2, marginLeft: '700px', marginTop: 2 }}>
                    user: {user}
                </Typography>
            )}

            <Box sx={{ display: 'flex' }}>
                <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
                    <Button
                        sx={{ backgroundColor: 'black', width: '70%', color: 'white', margin: '5px', '&.active': { backgroundColor: 'grey' } }}
                        variant="contained"
                        className={view === 'labels' ? 'active' : ''}
                        onClick={() => setView('labels')}
                    >
                        Manage Labels
                    </Button>
                    <Button
                        sx={{ backgroundColor: 'black', width: '70%', margin: '5px', color: 'white', '&.active': { backgroundColor: 'grey' } }}
                        variant="contained"
                        className={view === 'images' ? 'active' : ''}
                        onClick={() => setView('images')}
                    >
                        Manage Images
                    </Button>
                </Box>
                <Box sx={{ width: '70%' }}>
                    {view === 'labels' ? renderLabels() : renderImages()}
                </Box>
            </Box>
        </Box>
    );
}

export default App;
