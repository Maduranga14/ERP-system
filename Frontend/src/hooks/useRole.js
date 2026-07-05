import { useLocation } from 'react-router-dom';

/**
 * Derives the current user role from the URL path.
 */
export const useRole = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin'))        return 'admin';
  if (pathname.startsWith('/manager'))      return 'manager';
  if (pathname.startsWith('/receptionist')) return 'receptionist';
  if (pathname.startsWith('/housekeeper'))  return 'housekeeper';
  return null;
};
