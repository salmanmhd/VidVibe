import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, " videoId not provided or malformed"));
  }

  try {
    const like = await Like.findOne({ video: videoId, likedBy: req.user?._id });

    if (!like) {
      const createdLike = await Like.create({
        likedBy: req.user?._id,
        video: videoId,
      });

      if (!createdLike) {
        return res.status(500).json(
          new ApiResponse(500, "Something went wrong while liking a video", {
            error: `unable to communicate with db`,
          })
        );
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "like video successfully", createdLike));
    }

    await like.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, "remove like video successfully"));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(
        500,
        " Something went wrong while toggling the like for video",
        {
          error: error.message,
        }
      )
    );
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, " commentId not provided or malformed"));
  }

  try {
    const like = await Like.findOne({
      comment: commentId,
      likedBy: req.user?._id,
    });

    if (!like) {
      const createdLike = await Like.create({
        likedBy: req.user?._id,
        comment: commentId,
      });

      if (!createdLike) {
        return res.status(500).json(
          new ApiResponse(500, "Something went wrong while liking a comment", {
            error: `unable to communicate with db`,
          })
        );
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "like comment successfully successfully",
            createdLike
          )
        );
    }

    await like.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, "remove like comment successfully"));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(
        500,
        " Something went wrong while toggling the like for comment",
        {
          error: error.message,
        }
      )
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !isValidObjectId(tweetId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, " tweetId not provided or malformed"));
  }

  try {
    const like = await Like.findOne({ tweet: tweetId, likedBy: req.user?._id });

    if (!like) {
      const createdLike = await Like.create({
        likedBy: req.user?._id,
        tweet: tweetId,
      });

      if (!createdLike) {
        return res.status(500).json(
          new ApiResponse(500, "Something went wrong while liking a tweet", {
            error: `unable to communicate with db`,
          })
        );
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "like tweet successfully", createdLike));
    }

    await like.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, "remove like tweet successfully"));
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(
        500,
        " Something went wrong while toggling the like for tweet",
        {
          error: error.message,
        }
      )
    );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  try {
    const aggregateQuery = [
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user._id),
          video: {
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: "$likedBy",
          likedVideos: {
            $addToSet: "$video",
          },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "likedVideos",
          foreignField: "_id",
          as: "liked",
        },
      },
      {
        $unwind: "$liked",
      },
      {
        $match: {
          "liked.isPublished": true,
        },
      },
      {
        $project: {
          _id: 0,
          video: {
            _id: "$liked._id",
            title: "$liked.title",
            description: "$liked.description",
            duration: "$liked.duration",
            views: "$liked.views",
            videoFile: "$liked.videoFile",
            thumbnail: "$liked.thumbnail",
          },
        },
      },
      {
        $group: {
          _id: null,
          likedVideos: { $push: "$video" },
        },
      },
    ];

    const likedVideos = await Like.aggregate(aggregateQuery);
    console.log(`🟡 likedVideos: ${likedVideos} `);
    if (likedVideos.length === 0 || !likedVideos)
      return res
        .status(404)
        .json(new ApiResponse(404, "No liked videos found"));

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Liked videos fetched successfully", likedVideos)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, "Something went wrong while fetching liked videos", {
        error: error.message,
      })
    );
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
