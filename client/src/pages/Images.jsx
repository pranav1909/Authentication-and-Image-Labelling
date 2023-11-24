import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Checkbox, Input, Grid } from '@mui/material';

const API_BASE_URL = 'http://localhost:5000';

function Images() {
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = () => {
        axios.get(`${API_BASE_URL}/images`)
            .then(response => setImages(response.data.images))
            .catch(error => console.error('Error fetching images:', error));
    };

    const handleImageDelete = () => {
        if (selectedImages.length === 0) {
            alert('Select images to delete');
            return;
        }

        axios.post(`${API_BASE_URL}/images/delete`, { filenames: selectedImages })
            .then(response => {
                alert(response.data.message);
                fetchImages(); // Refresh the image list after deletion
                setSelectedImages([]); // Clear selected images
            })
            .catch(error => console.error('Error deleting images:', error));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleImageUpload = () => {
        if (!selectedFile) {
            alert('Select an image to upload');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        axios.post(`${API_BASE_URL}/upload`, formData)
            .then(response => {
                alert(response.data.message);
                fetchImages(); // Refresh the image list after upload
            })
            .catch(error => console.error('Error uploading image:', error));
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{ marginBottom: 2 }}>Image Gallery</Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ marginBottom: 2 }}>Upload Image</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Input type="file" onChange={handleFileChange} sx={{ marginBottom: 2 }} />
                        <Button variant="contained" onClick={handleImageUpload}>Upload Image</Button>
                    </Box>
                </Grid>
            </Grid>

            <Button variant="contained" sx={{ marginTop: 2 }} onClick={handleImageDelete}>Delete Selected Images</Button>

            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                {images.map(image => (
                    <Grid item key={image} xs={12} sm={6} md={4} lg={3}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Checkbox
                                value={image}
                                checked={selectedImages.includes(image)}
                                onChange={(e) => {
                                    const selected = e.target.checked;
                                    setSelectedImages(prev => (
                                        selected ? [...prev, image] : prev.filter(item => item !== image)
                                    ));
                                }}
                            />
                            <img
                                src={`${API_BASE_URL}/images/${image}`}
                                alt={image}
                                style={{ width: '100%', height: '250px', objectFit: 'cover', marginBottom: '10px' }}
                            />
                            <Typography variant="body2">{image}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Images;