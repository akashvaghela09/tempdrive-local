import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { FolderPage } from '../Components/FolderPage';
import { Home } from './Home';

const AllRoutes = () => {
    return (
        <div style={{width: "100%", height: "100%"}}>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/folder/:folderId" element={<FolderPage />} />
                <Route path="*" element={<h1>Page Not found</h1>}>
                </Route>
            </Routes>
        </div>
    )
}

export { AllRoutes }