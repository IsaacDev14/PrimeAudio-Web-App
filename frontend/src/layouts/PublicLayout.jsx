import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import PromoBanner from '../components/PromoBanner';

const PublicLayout = () => {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-prime-red selection:text-white">
            <Navbar />
            <PromoBanner />
            <main className="pt-20">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
};

export default PublicLayout;
