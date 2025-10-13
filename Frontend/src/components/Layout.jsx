import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="app-bg min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 w-full ${fullWidth ? 'px-0' : ''}`}>
        <div className="py-8 md:py-12 container-glass">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}