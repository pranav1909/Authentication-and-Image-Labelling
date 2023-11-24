import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Snackbar, SnackbarContent, FormControlLabel, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { logIn, signUp, googleSignIn } from '../../actions/AuthActions.js';
import useStyles from './styles.js';
import Input from './Input.js';
import logo from '../../OHlogo.png';

// google
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';

const initialState = { email: '', password: '', adminId: '' };

const SignUp = () => {
    const [form, setForm] = useState(initialState);
    const [isSignup, setIsSignup] = useState(false);
    const loading = useSelector((state) => state.loading);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const classes = useStyles();

    const [showPassword, setShowPassword] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false); // State for Snackbar
    const [errorMessage, setErrorMessage] = useState(''); // Error message for Snackbar
    const [adminCheck, setAdminCheck] = useState(false);

    // Extract error message from Redux store
    const reduxErrorMessage = useSelector((state) => state.authReducer.error);

    useEffect(() => {
        if (reduxErrorMessage) {
            setErrorMessage(reduxErrorMessage);
            setErrorOpen(true);
        }
    }, [reduxErrorMessage]);

    const handleShowPassword = () => setShowPassword(!showPassword);

    const switchMode = () => {
        setForm(initialState);
        setIsSignup((prevIsSignup) => !prevIsSignup);
        setShowPassword(false);
    };

    // Sign-in
    const handleSignIn = async () => {
        const email = form.email;
        const password = form.password;

        if (!email || !password) {
            setErrorMessage("Please Fill all the Fields");
            setErrorOpen(true);
            return;
        }

        try {
            const formData = { email, password };
            dispatch(logIn(formData, navigate));
        } catch (error) {
            setErrorMessage("Couldn't find user by this email, Signup instead");
            setErrorOpen(true);
        }
    };

    // Sign-up
    const handleSignUp = async () => {
        const email = form.email;
        const password = form.password;
        const adminId = form.adminId;

        if (!email || !password) {
            setErrorMessage("Please Fill all the Fields");
            setErrorOpen(true);
            return;
        }
        try {
            const formData = { email, password, adminId };
            dispatch(signUp(formData, navigate));
        } catch (error) {
            setErrorMessage("Error Occurred!");
            setErrorOpen(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isSignup) {
            handleSignUp();
        } else {
            handleSignIn();
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // Google login
    const handleGoogleResponse = async (user) => {
        try {
            dispatch(googleSignIn(user, navigate));
        } catch (error) {
            setErrorMessage("Error Occurred!");
            setErrorOpen(true);
        }
    }

    const handleSnackbarClose = () => {
        setErrorOpen(false);
        setErrorMessage('');
    };

    const handleCheckboxChange = (event) => {
        setAdminCheck(event.target.checked);
    };

    return (
        <Box style={{ display: 'flex', width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
            {/* box 1 */}
            <Box sx={{ width: '50%', height: '100vh', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={logo} alt={'logo'} style={{ width: '300px', height: '254px' }} />
            </Box>

            {/* box 2 */}
            <Box sx={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box className={classes.paper}>
                    <Typography component="h1" variant="h5">{isSignup ? 'Sign up' : 'Sign in'}</Typography>
                    <form className={classes.form} onSubmit={handleSubmit}>
                        <Box spacing={2} sx={{ width: '500px' }}>
                            <Input name="email" label="Email Address" handleChange={handleChange} type="email" />
                            <Input name="password" label="Password" handleChange={handleChange} type={showPassword ? 'text' : 'password'} handleShowPassword={handleShowPassword} />

                            {isSignup && <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={adminCheck}
                                        onChange={handleCheckboxChange}
                                        color="primary"
                                        sx={{
                                            '& .MuiSvgIcon-root': {
                                                width: '1em',
                                                height: '1em',
                                            },
                                        }}
                                    />
                                }
                                label="Admin"
                                sx={{ width: '100%' }}
                            />}
                            {adminCheck && <Input name="adminId" label="Admin ID" handleChange={handleChange} type="text" />}

                        </Box>

                        <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit} disabled={loading} sx={{ marginTop: '10px' }}>
                            {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
                        </Button>

                        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "5px", marginTop: "15px" }}>
                            {/* Google signin */}
                            <GoogleOAuthProvider clientId="1054696730832-msjl6kr85cnui837hc5mircqeqdrglmu.apps.googleusercontent.com">
                                <GoogleLogin
                                    onSuccess={credentialResponse => {
                                        const google_login_data = jwt_decode(credentialResponse.credential);
                                        const user = { "email": google_login_data.email };
                                        handleGoogleResponse(user);
                                    }}
                                    onError={() => {
                                        setErrorMessage('Login Failed');
                                        setErrorOpen(true);
                                    }}
                                    useOneTap
                                    type='standard'
                                    shape='circle'
                                />
                            </GoogleOAuthProvider>
                        </Box>

                        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography style={{ textTransform: 'none', fontSize: '16px' }}>
                                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                            </Typography>
                            <Button style={{ textTransform: 'none', fontSize: '16px' }} onClick={switchMode}>
                                {isSignup ? 'Sign in' : 'Sign Up'}
                            </Button>
                        </Box>

                    </form>
                </Box>

                {/* Snackbar for displaying errors */}
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={errorOpen}
                    autoHideDuration={5000}
                    onClose={handleSnackbarClose}
                >
                    <SnackbarContent
                        message={errorMessage}
                        action={
                            <Button color="primary" size="small" onClick={handleSnackbarClose}>
                                Close
                            </Button>
                        }
                    />
                </Snackbar>
            </Box>
        </Box>
    );
};

export default SignUp;
