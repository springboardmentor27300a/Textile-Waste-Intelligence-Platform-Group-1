import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-600">
      <Compass size={26} />
    </div>
    <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
    <p className="max-w-sm text-sm text-ink/60">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
  </div>
);

export default NotFound;
