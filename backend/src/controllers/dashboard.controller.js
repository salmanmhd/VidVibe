import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    return res.status(400).json(
      new ApiResponse(400, `channel id is missing or malformed`, {
        error: `invalid channelId`,
      })
    );
  }
  try {
    const totalViewsAggregateQuery = [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$views",
          },
        },
      },
    ];

    const totalViews = await Video.aggregate(totalViewsAggregateQuery);
    console.log(`totoal views: ${totalViews}`);
    if (!totalViews || totalViews.length === 0) {
      res.status(500).json(
        new ApiResponse(500, "Unable to fetch the channel stats", {
          error: `Unable to communicate with db`,
        })
      );
    }

    // total subscribers
    const totalSubscriberAggregateQuery = [
      {
        $match: {
          channel: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $count: "total_subscriber",
      },
    ];

    const totalSubscribers = await Subscription.aggregate(
      totalSubscriberAggregateQuery
    );

    if (!totalSubscribers) {
      return res.status(500).json(
        new ApiResponse(500, `Unable to get total subscribers`, {
          error: `Something went wrong`,
        })
      );
    }

    // total videos
    const totalVideosAggregateQuery = [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $count: "totalVideo",
      },
    ];

    const totalVideos = await Video.aggregate(totalVideosAggregateQuery);

    if (!totalVideos || totalVideos.length === 0) {
      return res.status(500).json(
        new ApiResponse(500, "Failed to retrieve total videos", {
          error:
            "Aggregation query returned no results. Check if the collection has data or if the query is correct.",
        })
      );
    }

    // total likes
    const totalLikesAggregateQuery = [
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoInfo",
        },
      },
      {
        $unwind: "$videoInfo",
      },
      {
        $match: {
          "videoInfo.owner": new mongoose.Types.ObjectId(channelId),
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: {
            $sum: 1,
          },
        },
      },
    ];

    const totalLikes = await Like.aggregate(totalLikesAggregateQuery);

    if (!totalLikes || totalLikes.length === 0) {
      return res.status(500).json(
        new ApiResponse(500, "Failed to retrieve total likes", {
          error:
            "Aggregation query returned no results. Check if the collection has data or if the query is correct.",
        })
      );
    }

    res.status(200).json(
      new ApiResponse(200, "Channel stats fetched successfully", {
        totalViews: totalViews[0].totalViews,
        totalSubscribers: totalSubscribers[0].total_subscriber,
        totalVideos: totalVideos[0].totalVideo,
        totalLikes: totalLikes[0].totalLikes,
      })
    );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(
        500,
        "Something went wrong while fetching channel stats",
        {
          error: error.message,
        }
      )
    );
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    return res.status(400).json(
      new ApiResponse(400, `channel id is missing or malformed`, {
        error: `invalid channelId`,
      })
    );
  }

  try {
    const aggregateQuery = [
      {
        $match: {
          owner: new mongoose.Types.ObjectId(channelId),
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
