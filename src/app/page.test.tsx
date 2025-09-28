
import { render } from '@testing-library/react';
import Home from './page';
import { redirect } from 'next/navigation';

// Mock the redirect function
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home page', () => {
  it('should redirect to /login', () => {
    render(<Home />);
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
