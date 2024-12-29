/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function DriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '', // Change `phone` to `phone_number`
    email: '',
    role: ''
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData'));

    console.log("Retrieved user from localStorage:", storedUser);

    if (storedUser && storedUser.id.toString() === id) { // Ensure type match
      setUserData(storedUser);
      setFormData({
        phone_number: storedUser.phone, // Change `phone` to `phone_number`
        email: storedUser.email,
        role: storedUser.role
      });
      console.log("Matching user data:", storedUser);
    }
  }, [id]);

  useEffect(() => {
    if (userData) {
      console.log("User data set in state:", userData);
    }
  }, [userData]);

  const handleEditClick = () => {
    setIsEditing(!isEditing); // Toggle editing mode
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the access token from localStorage
    const accessToken = JSON.parse(localStorage.getItem('userData'))?.access_token;

    if (!accessToken) {
      console.error('Access token is missing!');
      return; // Exit the function if no access token is found
    }

    // Sending PUT request to update the user data
    const updatedUser = {
      ...userData,
      phone_number: formData.phone_number, // Send `phone_number` instead of `phone`
      email: formData.email,
      role: formData.role,
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/update/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}` // Include the access token in the Authorization header
        },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const updatedData = await response.json();
        // Update the localStorage with the new data
        localStorage.setItem('userData', JSON.stringify(updatedData));
        setUserData(updatedData); // Update the state with new user data
        setIsEditing(false); // Stop editing mode
        console.log('User data updated:', updatedData);
        // Navigate back to profile page
        navigate(`/driver`);
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!userData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="p-6 bg-white shadow-md rounded-lg w-1/2">
        <h1 className="text-2xl font-bold mb-4 text-black text-center">Profile Info</h1>

        {/* Profile Data */}
        {!isEditing ? (
          <>
            <div className="mb-2">
              <strong className="text-black">Phone:</strong> <span className="text-gray-700">{userData.phone}</span>
            </div>

            <div className="mb-2">
              <strong className="text-black">Email:</strong> <span className="text-gray-700">{userData.email}</span>
            </div>

            <div className="mb-2">
              <strong className="text-black">Role:</strong> <span className="text-gray-700">{userData.role}</span>
            </div>

            <div className="mb-2">
              <strong className="text-black">Created At:</strong> <span className="text-gray-700">{new Date(userData.created_at).toLocaleString()}</span>
            </div>

            <button
              onClick={handleEditClick}
              className="mt-4 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
            >
              Edit Profile
            </button>
          </>
        ) : (
          // Edit Form
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-black" htmlFor="phone_number">Phone</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-gray-700"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-black" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-gray-700"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-black" htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                readOnly
                className="w-full p-2 border border-gray-300 rounded text-gray-700"
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleEditClick}
                className="px-4 py-2 text-white bg-gray-500 hover:bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DriverProfile;