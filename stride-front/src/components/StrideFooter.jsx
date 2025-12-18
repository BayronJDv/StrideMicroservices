import React from 'react'
import { useAtom } from 'jotai';
import { isLoggedInAtom } from '../state/authAtoms';

const StrideFooter = () => {
    const [isLoggedIn] = useAtom(isLoggedInAtom);
    return (
        <footer className="footer_area clearfix mt-15">
            <div className="container">
                <div className="row align-items-center">

                    <div className="col-12 col-lg-4">
                        <div className="single_widget_area">
                            <div className="footer-logo mr-50">
                                <a href="/home"><img src="img/core-img/logo2.png" alt="" /></a>
                            </div>
                            <p className="copywrite"> Copyright &copy;<script>document.write(new Date().getFullYear());</script> All rights reserved | This template is made with <i className="fa fa-heart-o" aria-hidden="true"></i> by <a href="https://colorlib.com" target="_blank">Colorlib</a> & Re-distributed by <a href="https://themewagon.com/" target="_blank">Themewagon</a></p>
                        </div>
                    </div>

                    <div className="col-12 col-lg-8">
                        <div className="single_widget_area">

                            <div className="footer_menu">
                                <nav className="navbar navbar-expand-lg justify-content-end">
                                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#footerNavContent" aria-controls="footerNavContent" aria-expanded="false" aria-label="Toggle navigation"><i className="fa fa-bars"></i></button>
                                    <div className="collapse navbar-collapse" id="footerNavContent">
                                        <ul className="navbar-nav ml-auto">
                                            <li className="nav-item active">
                                                <a className="nav-link" href="/home">Home</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" href="/shop">Shop</a>
                                            </li>
                                            {isLoggedIn && (
                                                <>
                                                    <li className="nav-item">
                                                        <a className="nav-link" href="/cart">Cart</a>
                                                    </li>
                                                    <li className="nav-item">
                                                        <a className="nav-link" href="/checkout">Checkout</a>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default StrideFooter;