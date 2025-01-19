const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');
const expressAsyncHandler = require('express-async-handler');

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id || req.user.id;
        // Check if the user is an admin or the user themselves
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                message: 'Forbidden',
                type: 'error',
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                type: 'error',
            });
        }

        // Generate profile image URL
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (user.profileImage) {
            user.profileImage = `${baseUrl}/${user.profileImage}`;
        }

        return res.status(200).json({
            user,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user profile',
            error: error.message,
            type: 'error',
        });
    }
});

// Update User Profile
const updateUserProfile = [
    upload.single('profileImage'),
    asyncHandler(async (req, res) => {
        try {
            const userId = req.params.id || req.user.id;

            // Check if the user is an admin or the user themselves
            if (req.user.role !== 'admin' && req.user.id !== userId) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(403).json({
                    message: 'Forbidden',
                    type: 'error',
                });
            }
            const user = await User.findById(userId);
            if (!user) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(404).json({
                    message: 'User not found',
                    type: 'error',
                });
            }

            // Update fields
            const { name, mobileNo, email, gender, dateOfBirth } = req.body;

            if (name) user.name = name;
            if (mobileNo) user.mobileNo = mobileNo;
            if (email) user.email = email;
            if (gender) user.gender = gender;
            if (dateOfBirth) user.dateOfBirth = dateOfBirth;

            // Update profile image if provided
            if (req.file) {
                const oldProfileImage = user.profileImage;
                user.profileImage = req.file.path;
                if (oldProfileImage) {
                    removeUnwantedImages([oldProfileImage]);
                }
            }

            await user.save();

            return res.status(200).json({
                message: 'User profile updated successfully',
                type: 'success',
                user,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to update user profile',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Get user list with search by mobileNo (at least one number required)
const getUserListWithMobileNo = async (req, res) => {
    try {
        const { mobileNo } = req.query; // Get mobileNo from query parameters

        // Ensure that mobileNo is provided and not empty
        if (!mobileNo || mobileNo.trim() === '') {
            return res.status(400).json({
                type: "error",
                message: 'Please provide at least one digit of the mobile number for search.',
            });
        }

        // Build query to search by mobileNo with a regex (partial match, case-insensitive)
        let query = { mobileNo: { $regex: mobileNo, $options: 'i' } };

        // Fetch users from the database
        const users = await User.find(query);

        // Check if users are found
        if (users.length === 0) {
            return res.status(404).json({
                type: "error",
                message: 'No users found with the provided mobile number.',
            });
        }

        // Send response
        res.status(200).json({
            type: 'success',
            message: 'User list retrieved successfully',
            users
        });
    } catch (error) {
        res.status(500).json({
            type: "error",
            message: 'Error fetching user list',
            error: error.message
        });
    }
};

const addUserByVendor = expressAsyncHandler(async (req, res) => {
    try {
        const { mobileNo } = req.body;

        // Check if a user with the same email or mobile number already exists
        const existingUser = await User.findOne({
            $or: [{ mobileNo }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or mobile number already exists.",
                type: "error",
            });
        }

        // Create a new user
        const newUser = new User({
            ...req.body,
            isVerified: true, // Assuming the vendor verifies the user on creation
            isActive: true, // Assuming the user is active when added by vendor
        });

        // Save the user to the database
        await newUser.save();

        res.status(201).json({
            message: "User added successfully by vendor.",
            type: "success",
            userId: newUser._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error while adding user.",
            type: "error",
        });
    }
});


module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserListWithMobileNo,
    addUserByVendor
};
