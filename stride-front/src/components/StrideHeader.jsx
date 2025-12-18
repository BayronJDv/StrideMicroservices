import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { useAtom } from 'jotai';
import { isLoggedInAtom } from '../state/authAtoms';

const StrideHeader = () => {
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [options, setOptions] = useState(false);

  return (
    <>
      <div className="mobile-nav">
        <div className="amado-navbar-brand">
          <a href="/home">
            <img src="img/core-img/logo.png" alt="Logo" />
          </a>
        </div>
        {/* Navbar Toggler*/}
        <div className="amado-navbar-toggler" onClick={() => setOptions(!options)}>
          <span></span><span></span><span></span>
        </div>
      </div>
      <header className={`header-area clearfix ${options ? 'bp-xs-on' : ''}`}>
        <div className="nav-close" onClick={() => setOptions(false)}>
          <i className="fa fa-close" aria-hidden="true"></i>
        </div>
        {/* Logo */}
        <div className="logo">
          <a href="/home">
            <img src="img/core-img/logo.png" alt="Logo" />
          </a>
        </div>
        {/* Button Group */}
        {!isLoggedIn && (
          <div className="amado-btn-group mt-15 mb-30">
            <Link to="/login" state={{ activeLink: "signup" }} className="btn amado-btn mb-15">Sign up</Link>
            <Link to="/login" state={{ activeLink: "signin" }} className="btn amado-btn active">Sign in</Link>
          </div>
        )}
        {/* Amado Nav */}
        <nav className="amado-nav">
          <ul>
            <li className="active"><a href="/home">Home</a></li>
            <li><a href="/shop">Shop</a></li>
            {isLoggedIn && (
              <li><a href="/checkout">Checkout</a></li>
            )}
          </ul>
        </nav>
        {/* Cart Menu */}
        <div className="cart-fav-search mb-30">
          {isLoggedIn && (
            <>
              <a href="/cart" className="cart-nav">
                <img src="img/core-img/cart.png" alt="Cart" /> Cart
              </a>
              <a href="/MyOrders" className="Acc-nav">
                <img src="img/core-img/package-open.png" alt="My Orders" /> My Orders
              </a>
              <a href="/myAccount" className="Acc-nav">
                <img src="img/core-img/account.png" alt="My Account" /> My Account
              </a>
            </>
          )}
        </div>
        {/* Social Button */}
        <div className="social-info d-flex justify-content-between">
          <a href="#">
            <i className="fa fa-pinterest" aria-hidden="true"></i>
          </a>
          <a href="#">
            <i className="fa fa-instagram" aria-hidden="true"></i>
          </a>
          <a href="#">
            <i className="fa fa-facebook" aria-hidden="true"></i>
          </a>
          <a href="#">
            <i className="fa fa-twitter" aria-hidden="true"></i>
          </a>
        </div>
      </header></>
  );
};

export default StrideHeader;
