import { Outlet } from 'react-router-dom';
import ManagementSidebar from './ManagementSidebar';
import './ManagementLayout.css';

const ManagementLayout = () => {
    return (
        <div className="management-layout">
            <ManagementSidebar />
            <div className="management-main">
                <Outlet />
            </div>
        </div>
    );
};

export default ManagementLayout;
