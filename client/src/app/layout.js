import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Chatify — Real-Time Messenger',
  description: 'A beautiful, real-time messaging web application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
