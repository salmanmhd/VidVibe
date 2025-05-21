import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User, User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { verifyJwt } from "../middlewares/auth.middleware.js";

async function generateRefreshAndAccessToken(user) {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((el) => el?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  console.log(`req.files: `, req.files);
  console.log(`req.body: `, req.body);
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log(`existed user: ${existedUser}`);

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage)) {
    coverImageLocalPath = req.files?.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username,
    password,
    email,
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, userCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  if (!password) throw new ApiError(400, "Password is required");

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user)
    throw new ApiError(404, "User doesn't exist, try registering first");

  const isValidPassword = user.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { loggedInUser, refreshToken, accessToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  await User.findByIdAndUpdate(user._id, {
    refreshToken: null,
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookie?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    throw new ApiError(400, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError("Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "Access token generated"
      )
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError("Incorrect password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changes successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, fullName, email } = req.body;

  if ([username, fullName, email].some((el) => el.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { username, fullName, email },
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "User data updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const localAvatarPath = req.file?.path;

  if (localAvatarPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(localAvatarPath);

  if (avatar?.url) {
    throw new ApiError(500, "Error while uploading on cloudinary");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { avatar: avatar.url },
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const localCoverImagePath = req.file?.path;

  if (localCoverImagePath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(localCoverImagePath);

  if (coverImage?.url) {
    throw new ApiError(500, "Error while uploading on cloudinary");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: { coverImage: coverImage.url },
  }).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
};

// TODO: router, try cathc
