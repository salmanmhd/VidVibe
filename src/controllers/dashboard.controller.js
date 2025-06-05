import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  try {
    const aggregateQuery = [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
    ];

    const videos = await Video.aggregate(aggregateQuery);

    if (!videos) {
      return res.status(500).json(
        new ApiResponse(400, "Unable to fetch videos", {
          error: `Unable to communicate with db`,
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, `Videos fethced successfully`, videos));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while fetching videos", {
        error: error.message,
      })
    );
  }
});

export { getChannelStats, getChannelVideos };
