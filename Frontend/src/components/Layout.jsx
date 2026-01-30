import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className={`flex-1 w-full ${fullWidth ? 'px-0' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}