/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import loginImage from "../../assets/pictures/logo.png";
import navImage from "../../assets/pictures/branches.jpg";
import { X } from 'lucide-react';

function DriverLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({
    expenses: [],
    reimbursements: [],
    policies: []
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    setIsMenuOpen(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/");
  };

  const userData = JSON.parse(localStorage.getItem('userData')) || {};
  const userId = userData.id || '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [expensesRes, reimbursementsRes, policiesRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/expense/user/', { headers }).then(res => res.json()),
          fetch('http://127.0.0.1:8000/reimbursement/user/', { headers }).then(res => res.json()),
          fetch('http://127.0.0.1:8000/policy/policies/', { headers }).then(res => res.json()),
        ]);

        const today = new Date();
        
        const todayExpenses = expensesRes?.expenses?.filter(expense => 
          isSameDay(new Date(expense.created_at), today)
        ) || [];

        const todayReimbursements = reimbursementsRes?.filter(reimbursement => 
          isSameDay(new Date(reimbursement.created_at), today)
        ) || [];

        const todayPolicies = policiesRes?.filter(policy => 
          isSameDay(new Date(policy.created_at), today)
        ) || [];

        setNotifications({
          expenses: todayExpenses,
          reimbursements: todayReimbursements,
          policies: todayPolicies
        });

        setNotificationCount(todayExpenses.length + todayReimbursements.length + todayPolicies.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.status === 401) {
          handleLogout();
        }
      }
    };

    fetchAllData();

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.phone) {
      setPhone(userData.phone);
    }
  }, []);

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleLinkClick = (path) => {
    setIsMenuOpen(false);
    window.location.href = path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-[2000px] mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src={loginImage} alt="Driver Logo" className="h-10 w-10 rounded-full" />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden inline-flex items-center justify-center p-2 text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <button
                onClick={() => handleLinkClick('/driver')}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
              >
                Home
              </button>
              <button
                onClick={() => handleLinkClick('/driver/expenses')}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
              >
                Expenses
              </button>
              <button
                onClick={() => handleLinkClick('/driver/reimbursements')}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
              >
                Reimbursement
              </button>
              <button
                onClick={() => handleLinkClick('/driver/policies')}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
              >
                Policy
              </button>
              <button
                onClick={() => handleLinkClick(`/driver/profile/${userId}`)}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
              >
                Profile
              </button>
              <button
                onClick={() => setShowNotifications(true)}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md relative"
              >
                Notifications
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Left Side */}
        <div
          className={`${
            isMenuOpen ? 'block' : 'hidden'
          } md:hidden fixed inset-y-0 left-0 w-64 bg-green-700 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-green-200"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col pt-16 space-y-1">
            <button
              onClick={() => handleLinkClick('/driver')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left"
            >
              Home
            </button>
            <button
              onClick={() => handleLinkClick('/driver/expenses')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left"
            >
              Expenses
            </button>
            <button
              onClick={() => handleLinkClick('/driver/reimbursements')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left"
            >
              Reimbursement
            </button>
            <button
              onClick={() => handleLinkClick('/driver/policies')}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left"
            >
              Policy
            </button>
            <button
              onClick={() => handleLinkClick(`/driver/profile/${userId}`)}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left"
            >
              Profile
            </button>
            <button
              onClick={() => {
                setShowNotifications(true);
                setIsMenuOpen(false);
              }}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left relative"
            >
              Notifications
              {notificationCount > 0 && (
                <span className="absolute top-3 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 text-sm font-medium text-white hover:bg-green-600 text-left"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-[2000px] mx-auto px-4 py-6">
        <main className="w-full bg-white rounded-lg shadow-md">
          <Outlet />
        </main>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-700">Today Notifications</h2>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Expenses Notifications */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">New Expenses ({notifications.expenses.length})</h3>
                {notifications.expenses.map((expense, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {expense.category} - FRW{expense.amount}
                  </div>
                ))}
                {notifications.expenses.length === 0 && (
                  <p className="text-sm text-gray-500">No new expenses today</p>
                )}
              </div>

              {/* Reimbursements Notifications */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">New Reimbursements ({notifications.reimbursements.length})</h3>
                {notifications.reimbursements.map((reimbursement, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    Reimbursement Request - FRW{reimbursement.amount}
                  </div>
                ))}
                {notifications.reimbursements.length === 0 && (
                  <p className="text-sm text-gray-500">No new reimbursements today</p>
                )}
              </div>

              {/* Policies Notifications */}
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">New Policies ({notifications.policies.length})</h3>
                {notifications.policies.map((policy, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {policy.title}
                  </div>
                ))}
                {notifications.policies.length === 0 && (
                  <p className="text-sm text-gray-500">No new policies today</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverLayout;