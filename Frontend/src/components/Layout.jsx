import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className={`flex-1 w-full mx-auto ${fullWidth ? 'w-full px-0' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        <div className="py-8 md:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}