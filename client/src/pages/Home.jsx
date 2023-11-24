import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Chip,
  Autocomplete,
  Button,
  List,
  ListItem,
  TextField
} from '@mui/material';
import { useSelector } from 'react-redux';

const ITEMS_PER_PAGE = 6;

const Home = () => {
  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLabels, setImageLabels] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.authReducer.authData?.email);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIdx = startIdx + ITEMS_PER_PAGE;

      const imagesResponse = await fetch('http://localhost:5000/images');
      const labelsResponse = await fetch('http://localhost:5000/api/labels');

      if (!imagesResponse.ok || !labelsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const imagesData = await imagesResponse.json();
      const labelsData = await labelsResponse.json();

      setImages(imagesData.images.slice(startIdx, endIdx));
      setLabels(labelsData.labels);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError('Error fetching data. Please try again.');
    }
  };

  const handleLabelAssociation = async () => {
    try {
      if (!selectedImage || !imageLabels[selectedImage] || imageLabels[selectedImage].length === 0) {
        throw new Error('Select an image and at least one label');
      }

      const uniqueLabels = Array.from(new Set(imageLabels[selectedImage]));

      await fetch('http://localhost:5000/api/associateLabel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user,
          image: selectedImage,
          labels: uniqueLabels,
        }),
      });

      fetchData();
    } catch (error) {
      console.error('Error associating labels with image:', error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

  return (
    <Box>
      <Typography variant="h3" sx={{ marginLeft: '600px' }}>User Dashboard</Typography>
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
      {error && (
        <Typography variant="body1" sx={{ color: 'red', marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ width: '20%', backgroundColor: '#EDEDED' }}>
          <Typography variant="h4" sx={{ marginLeft: '90px', marginTop: '10px' }}>Labels</Typography>
          <List sx={{ marginLeft: '100px' }}>
            {labels.map((label, index) => (
              <ListItem key={index}>
                <Typography variant="h6">{label.text}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ flex: 1, backgroundColor: '#F6F6F6' }}>
          <Typography variant="h4" sx={{ marginLeft: '500px', marginTop: '10px' }}>Images</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {images.map((image, index) => (
              <Box key={index} sx={{ margin: 4, padding: 1 }}>
                <img
                  src={`http://localhost:5000/images/${image}`}
                  alt={`Image ${index}`}
                  style={{
                    width: '320px',
                    height: '320px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedImage(image)}
                />
                {selectedImage === image && (
                  <Box sx={{ marginTop: 1 }}>
                    <Autocomplete
                      options={labels}
                      getOptionLabel={(option) => option.text}
                      renderInput={(params) => (
                        <Box sx={{ width: '100%' }}>
                          <TextField {...params} label="Select Label" fullWidth />
                        </Box>
                      )}
                      onChange={(_, newValue) => {
                        setImageLabels({
                          ...imageLabels,
                          [selectedImage]: [...(imageLabels[selectedImage] || []), newValue.text],
                        });
                      }}
                      sx={{ marginBottom: 1 }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleLabelAssociation}
                      sx={{ height: '30px' }}
                    >
                      Associate Labels
                    </Button>
                    {imageLabels[selectedImage] && imageLabels[selectedImage].length > 0 && (
                      <Box sx={{ marginTop: 1 }}>
                        {imageLabels[selectedImage].map((label, idx) => (
                          <Chip
                            key={idx}
                            label={label}
                            onDelete={() => {
                              const updatedLabels = [...imageLabels[selectedImage]];
                              updatedLabels.splice(idx, 1);
                              setImageLabels({
                                ...imageLabels,
                                [selectedImage]: updatedLabels,
                              });
                            }}
                            sx={{
                              marginRight: 1,
                              fontSize: '0.8rem',
                              height: '24px',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          <Box sx={{ margin: 2, display: 'flex', justifyContent: 'space-between' }}>
            {totalPages > 1 && (
              <Typography variant="body1">
                Page {currentPage} of {totalPages}
              </Typography>
            )}
            <div>
              <Button
                variant="contained"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous Page
              </Button>
            </div>
            <div>
              <Button
                variant="contained"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next Page
              </Button>
            </div>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
