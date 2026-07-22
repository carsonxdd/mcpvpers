import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MusicPlayer from '@/components/MusicPlayer';

// Chrome for the original mc.pvpers.us site. Route groups are invisible in
// URLs, so everything under (pvpers)/ keeps its original path.
export default function PvpersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="relative z-20 flex-1 pt-14">{children}</main>
      <Footer />
      <MusicPlayer />
    </>
  );
}
