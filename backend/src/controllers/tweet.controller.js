import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return new ApiResponse(400, "Content is required🔴", {
      error: "Content is missing, please proivde content to create tweet",
    });
  }

  const userId = req.user._id;

  try {
    const tweet = await Tweet.create({
      content,
      owner: userId,
    });

    if (!tweet) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while creating tweet", {
          error: "unable to write tweet to db",
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Tweet created successfully🟢", tweet));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while creating tweet", {
        error: error.message,
      })
    );
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json(
      new ApiResponse(400, "Something went wrong while fetching tweet", {
        error: "user not found",
      })
    );
  }

  try {
    const tweet = await Tweet.find({ owner: userId });

    if (!tweet) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while fetching tweet", {
          error: "unable to write to db",
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Tweet fetched successfully", tweet));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while fetching tweet", {
        error: error.message,
      })
    );
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //   TODO: get the tweet id, along with the updated content
  const { updatedContent } = req.body;
  const { tweetId } = req.params;
  if (!tweetId || !updatedContent) {
    return res.status(400).json(
      new ApiResponse(400, "Something went wrong while upatig tweet", {
        error: "tweetId or updatedContent missing",
      })
    );
  }

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        content: updatedContent,
      },
      { new: true }
    );

    if (!updatedTweet) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while updating tweet", {
          error: "unable to write to db",
        })
      );
    }

    res.status(200).json(
      new ApiResponse(200, "Updated tweet successfully", {
        tweet: updatedTweet,
      })
    );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while updating tweet", {
        error: error.message,
      })
    );
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  if (!tweetId) {
    return res.status(400).json(new ApiResponse(400, "tweetId is missing🔴"));
  }

  const isValid = mongoose.Types.ObjectId.isValid(tweetId);
  if (!isValid) {
    return res.status(400).json(new ApiResponse(400, "Invalid tweetId🔴"));
  }

  try {
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while deleting tweet🔴", {
          error: "unable to write to db",
        })
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet deleted successfully🟢", deletedTweet));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, "Something went wrong while deleting tweet🔴", {
        error: error.message,
      })
    );
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
