import React, { useState, useEffect } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import styles from '../css/strideLogin.module.css';
import { useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import { isLoggedInAtom, userAtom } from '../state/authAtoms';
import { toast, ToastContainer } from 'react-toastify';
import { useLocation } from "react-router-dom";
import { supabase } from '../api/supabaseClient';


function Login() {
    const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
    const [, setUser] = useAtom(userAtom);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [captchaValue, setCaptchaValue] = useState(null);
    const navigate = useNavigate();

    const location = useLocation();
    useEffect(() => {
        if (location.state && location.state.activeLink) {
            setActiveLink(location.state.activeLink);
        }
    }, [location]);

    useEffect(() => {
        if (isLoggedIn) {
            toast.error('Already logged in', { autoClose: true });
            navigate("/home");
        }
    }, [isLoggedIn, navigate]);

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
    };

    const validatePassword = (password) => {
        return password && password.length >= 8;
    };


    const handleRegister = async (e) => {
        e.preventDefault();

        if (!captchaValue) {
            toast.error('Please do Captcha!', { autoClose: true });
            return;
        }

        if (!validatePassword(password)) {
            toast.error('Password must be at least 8 characters long', { autoClose: true });
            return;
        }

        if (!email) {
            toast.error('Email is required', { autoClose: true });
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                    }
                }
            });

            if (error) {
                toast.error(error.message || 'Error during registration', { autoClose: true });
                console.error("Error en el registro:", error);
                return;
            }

            setSuccess(true);
            console.log("Usuario registrado:", data.user);
            toast.success('Registered successfully! Please verify your email.', { autoClose: true });
            setUsername('');
            setEmail('');
            setPassword('');
            setCaptchaValue(null);
        } catch (error) {
            toast.error('Registration error!', { autoClose: true });
            console.error("Error en el registro:", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        // Verifica si el CAPTCHA ha sido completado
        if (!captchaValue) {
            toast.error('Please do CAPTCHA', { autoClose: true });
            return;
        }

        if (!username || !password) {
            toast.error('Username and password are required', { autoClose: true });
            return;
        }

        try {
            // Usar email o username para el login con Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: username, // Supabase requiere email, puede que necesites ajustar esto
                password: password,
            });

            if (error) {
                toast.error(error.message || 'Login error', { autoClose: true });
                console.error("Error en el login:", error);
                return;
            }

            toast.success('¡Login exitoso!', { autoClose: true });
            setIsLoggedIn(true);
            setUser(data?.user || null);
            console.log("Usuario logueado:", data.user);
            navigate("/home");

        } catch (error) {
            toast.error('Could not connect to the server. Please try again later.', { autoClose: true });
            console.error("Error en el login:", error);
        }
    };

    const [activeLink, setActiveLink] = useState(location.state?.activeLink || 'signin');
    const [activeButton, setActiveButton] = useState("vacio");
    const ButtonSignIn = () => { setActiveButton("log"); };
    const ButtonSignUp = () => { setActiveButton("reg"); };

    const frameClass = activeButton === "vacio" ? (activeLink === "signin" ? styles["frame"] : styles["frame-long"]) : styles["frame-short"];
    const formSignUp = activeButton === "vacio" ? (activeLink === "signup" ? styles["form-signup-left"] : styles["form-signup"]) : styles["form-signup-down"];

    // Funciones de manejo de clics 
    const handleClickSignIn = () => { setActiveLink("signin"); };
    const handleClickSignUp = () => { setActiveLink("signup"); };

    return (
        <div className={styles.divlogin}>
            <div>
                {/* Alertas de las mas alta calidddddaa */}
                <ToastContainer position="top-center" autoClose={3000} hideProgressBar={true} />
            </div>
            <div className={styles.container}>
                <div className={frameClass}>
                    <div className={activeButton === "reg" ? styles["nav-up"] : styles["nav"]}>
                        <ul className={styles.links}>
                            <li className={activeLink === "signin" ? styles["signin-active"] : styles["signin-inactive"]}>
                                <a className={styles.btn} onClick={handleClickSignIn}>Sign in</a>
                            </li>
                            <li className={activeLink === "signup" ? styles["signup-active"] : styles["signup-inactive"]}>
                                <a className={styles.btn} onClick={handleClickSignUp}>Sign up</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <form className={activeLink === "signin" ? styles["form-signin"] : styles["form-signin-left"]} action="" method="post" name="form">
                            <label htmlFor="username">Email</label>
                            <input className={styles["form-styling"]}
                                type="email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder=""
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <input className={styles["form-styling"]}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=""
                                required
                            />
                            <div className={styles["captcha-container"]}>
                                <ReCAPTCHA
                                    sitekey="6LduhHgqAAAAAG6SwTg1Beu_vrBcBnf1Opozllu8"
                                    onChange={handleCaptchaChange}
                                />
                            </div>
                            <div className={activeButton === "log" ? styles["btn-animate-grow"] : styles["btn-animate"]}>
                                <a className={styles["btn-signin"]} onClick={handleLogin}>Sign in</a>
                            </div>
                        </form>

                        <form className={formSignUp} action="" method="post" name="form">
                            <label htmlFor="username">Username</label>
                            <input className={styles["form-styling"]}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder=""
                                required
                            />
                            <label htmlFor="email">Email</label>
                            <input className={styles["form-styling"]} name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=""
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <input className={styles["form-styling"]}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=""
                                required
                            />
                            <div className={styles["captcha-container"]}>
                                <ReCAPTCHA
                                    sitekey="6LduhHgqAAAAAG6SwTg1Beu_vrBcBnf1Opozllu8"
                                    onChange={handleCaptchaChange}
                                />
                            </div>
                            <div className={styles["btn-animate"]}>
                                <a className={styles["btn-signup"]} onClick={handleRegister}>Sign Up</a>
                            </div>



                        </form>
                    </div>

                    <div className={activeButton === "log" ? styles["forgot-fade"] : (activeLink === "signin" ? styles["forgot"] : styles["forgot-left"])}>
                        <a href="#">Forgot your password?</a>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Login;