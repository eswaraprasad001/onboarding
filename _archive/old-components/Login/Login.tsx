import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import Image from 'next/image';
import styles from './Login.module.css'; // Import the CSS module

interface LoginPageProps {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
  setUsername: React.Dispatch<React.SetStateAction<string>>
}

const LoginPage: React.FC<LoginPageProps> = (props) => {
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (accounts.length > 0) {
      props.setIsLoggedIn(true);
    }
  }, [accounts, props.setIsLoggedIn]);

  const handleLogin = (accessToken: any, idToken: any, username: string) => {
    props.setUsername(username);
    props.setIsLoggedIn(true);

    localStorage.setItem('onboarding_id_token', accessToken);
    localStorage.setItem('onboarding_access_token', idToken);
    localStorage.setItem('onboarding_username', username);
  };

  const handleSSOLogin = () => {
    handleLogin('test', 'test','test');
    // instance.loginPopup({
    //   scopes: ['user.read'],
    // }).then((response) => {
    //   console.log('SSO login successful');
    //   const username = response.account.name || "";
    //   handleLogin(response.accessToken, response.idToken, username);
    // }).catch((error) => {
    //   console.error('SSO login failed', error);
    // });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Image src="/images/logo.svg" alt="Company Logo" width={0} height={0} className={styles.logo} />
        <h2 className={styles.h2}>Business Analyst & Solution Owner Onboarding</h2>
        <button className={styles.ssoLoginButton} onClick={handleSSOLogin}>Sign in with SSO</button>
      </div>
    </div>
  );
};

export default LoginPage;
