import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--white);
  color: var(--black);
  padding: 1.2rem 4rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Brand = styled.div`
  a {
    color: var(--black);
    font-size: 1.8rem;
    font-weight: bold;
    text-decoration: none;
  }
`;

const NavList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: 2.5rem;
`;

const NavItem = styled.li`
  margin: 0;

  a {
    color: var(--black);
    text-decoration: none;
    font-weight: 500;
    font-size: 1.1rem;
    transition: color 0.3s ease;
    padding: 0.5rem 0;
    position: relative;

    &:hover {
      color: var(--primary-color);
    }

    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }

    &:hover::after {
      width: 100%;
    }
  }
`;

const CreditsDisplay = styled(NavItem)`
  background-color: var(--black);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-weight: 500;
`;

const AuthButtons = styled(NavItem)`
  display: flex;
  gap: 1rem;
`;

const Button = styled(Link)`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;

  &.btn-primary {
    background-color: var(--black);
    color: var(--white);

    &:hover {
      background-color: var(--dark-gray);
      transform: translateY(-2px);
    }
  }

  &.btn-secondary {
    background-color: transparent;
    color: var(--black);
    border: 2px solid var(--black);

    &:hover {
      background-color: var(--black);
      color: var(--white);
      transform: translateY(-2px);
    }
  }
`;

const LogoutButton = styled.button`
  padding: 0.6rem 1.2rem;
  border: 2px solid var(--black);
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  background-color: transparent;
  color: var(--black);
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--black);
    color: var(--white);
    transform: translateY(-2px);
  }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Nav>
      <Brand>
        <Link to="/">CredBuzz</Link>
      </Brand>
      <NavList>
        <NavItem>
          <Link to="/">Home</Link>
        </NavItem>
        <NavItem>
          <Link to="/tasks">Task Marketplace</Link>
        </NavItem>
        {user && (
          <>
            <NavItem>
              <Link to="/my-tasks">My Tasks</Link>
            </NavItem>
            <NavItem>
              <Link to="/create-task">Create Task</Link>
            </NavItem>
          </>
        )}
        {user && (
          <NavItem>
            <Link to="/profile">Profile</Link>
          </NavItem>
        )}
        {user && (
          <CreditsDisplay>
            Credits: {user.credits} ₵
          </CreditsDisplay>
        )}
        {!user ? (
          <AuthButtons>
            <Button to="/login" className="btn-secondary">Login</Button>
            <Button to="/register" className="btn-primary">Register</Button>
          </AuthButtons>
        ) : (
          <AuthButtons>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </AuthButtons>
        )}
      </NavList>
    </Nav>
  );
};

export default Navbar; 