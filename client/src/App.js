import React, { Component } from 'react';
import styles from './App.module.css';
import { Header } from './Components/Header';
import { Progress } from './Components/Progress';
import { AllRoutes } from './Routes/AllRoutes';

class App extends Component {
  render() {
    return (
      <div className={styles.App}>
        {/* <Progress /> */}
        <Header />
        <AllRoutes />
      </div>
    );
  }
}

export default App;
