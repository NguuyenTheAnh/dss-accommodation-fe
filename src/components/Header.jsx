import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <HomeOutlined className="logo-icon" />
                        <span className="logo-text">DormFinder</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
