import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, House } from "lucide-react";
import styles from "../css/account.module.css";
import { supabase } from '../api/supabaseClient';
import { useAtom } from 'jotai';
import { userAtom, isLoggedInAtom } from '../state/authAtoms';


function AccountPage() {
  const [user, setUser] = useAtom(userAtom);
  const [, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);

  const logoutAndRedirect = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setUser(null);
      navigate("/home");
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  useEffect(() => {
    // Obtener datos del usuario de Supabase
    const fetchUserData = async () => {
      try {
        if (!user) {
          navigate("/login");
          return;
        }

        // Obtener metadatos del usuario
        const username = user.user_metadata?.username || user.email.split('@')[0];

        setUserData({
          username: username,
          email: user.email,
          id: user.id,
        });

        // Aquí puedes verificar si es admin usando una tabla en Supabase o roles
        // Por ahora, asumiremos que es false
        const { data: roleData, error } = await supabase
          .from('roles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error obteniendo rol:', error);
          setIsSuperuser(false);
        } else {
          const isAdmin = roleData?.role === 'admin';
          console.log('Es admin:', isAdmin);
          setIsSuperuser(isAdmin);
        }
        


      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div>Error loading user data</div>;
  }

  return (
    <div className={styles["account-container"]}>
      <div className={styles["account-card"]}>
        <h1 className={styles["title"]}>My Account</h1>

        <div className={styles["content"]}>
          <div className={styles["avatar-container"]}>
            <div className={styles["avatar"]}>
              <span>{userData.username.charAt(0).toUpperCase()}</span>
            </div>
          </div>

          <div className={styles["info-section"]}>
            <div className={styles["info-group"]}>
              <label>Username</label>
              <div className={styles["info-box"]}>{userData.username}</div>
            </div>

            <div className={styles["info-group"]}>
              <label>Email</label>
              <div className={styles["info-box"]}>{userData.email}</div>
            </div>
          </div>

          <div className={styles["button-group"]}>
            {isSuperuser ? (
              <button
                onClick={handleAdminClick}
                className={`${styles["btn"]} ${styles["btn-primary"]}`}
              >
                <Settings size={20} />
                <span>Admin</span>
              </button>
            ) : (
              <button
                className={`${styles["btn"]} ${styles["btn-primary"]}`}
                onClick={() => {
                  window.location.href = "/home";
                }}
              >
                <House size={20} />
                <span>Home</span>
              </button>
            )}
            <button
              onClick={logoutAndRedirect}
              className={`${styles["btn"]} ${styles["btn-outline"]}`}
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
