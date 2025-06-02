import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { validateInput } from "../utils/getMissingFields.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt", // latest, oldest, vide duration, views
    sortType = -1,
    userId,
  } = req.query;

  try {
    const aggregateQuery = Video.aggregate([
      {
        $match: {
          title: { $regex: query, $options: "i" },
        },
      },
      {
        $match: {
          isPublished: true,
        },
      },
      ,
      {
        $sort: {
          sortBy: sortType,
        },
      },
    ]);

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await Video.aggregatePaginate(aggregateQuery, options);

    if (!result) {
      return res.status(500).json(
        new ApiResponse(500, `Something went wrong while fetching videos`, {
          error: `unable to write to db`,
        })
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, `Videos fetched successfully`, result));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while fetching videos`, {
        error: error.message,
      })
    );
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  const requiredFields = {
    title,
    description,
    videoLocalPath,
    thumbnailLocalPath,
  };

  const missingFields = validateInput(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `Missing required fields: ${missing.join(", ")}`,
      })
    );
  }

  try {
    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log("video:", JSON.stringify(video));
    console.log("thumbnail:", JSON.stringify(thumbnail));

    if (!video || !thumbnail) {
      return res.status(400).json(
        new ApiResponse(400, `Upload failed`, {
          error: `Upload failed, try again uploading the video`,
        })
      );
    }

    const videoPublish = await Video.create({
      title,
      description,
      duration: video.duration,
      videoFile: video.url,
      thumbnail: thumbnail.url,
      owner: req.user._id,
    });

    if (!videoPublish) {
      return res.status(500).json(new ApiResponse(500, `Video publish failed`));
    }

    return res.status(200).json(
      new ApiResponse(200, `Video published successfully`, {
        video: video.url,
        thumbnail: thumbnail.url,
      })
    );
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, `Something went wrong while publishing video`, {
        error: error.message,
      })
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || !isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, `videoId is missing or invalid`));
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiResponse(404, `Video not found`));
    }
    res.status(200).json(new ApiResponse(200, `Video found`, video));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while fetching video`, {
        error: error.message,
      })
    );
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file.path;
  console.log(`🟡 file: ${req.files}`);
  console.log("🟡thumbnailLocalPath:", thumbnailLocalPath);
  const requiredFields = {
    videoId,
    title,
    description,
    thumbnailLocalPath,
  };

  const missingFields = validateInput(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `Missing required fields: ${missingFields.join(", ")}`,
      })
    );
  }

  try {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      return res.status(400).json(
        new ApiResponse(400, `Upload failed`, {
          error: `Upload failed, try again uploading the thumbnail`,
        })
      );
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        title,
        description,
        thumbnail: thumbnail.url,
      },
      { new: true }
    );

    if (!updatedVideo) {
      return res.status(500).json(
        new ApiResponse(500, `Something went wrong while updating video`, {
          error: `unable to write to db`,
        })
      );
    }
    res
      .status(200)
      .json(new ApiResponse(200, `Video updated successfully`, updatedVideo));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while updating video`, {
        error: error.message,
      })
    );
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId || !isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, `videoId is missing or invalid`));
  }

  try {
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
      return res.status(500).json(
        new ApiResponse(500, `Something went wrong while deleting video`, {
          error: `unable to write to db`,
        })
      );
    }
    res
      .status(200)
      .json(new ApiResponse(200, `Video deleted successfully`, deletedVideo));
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(500, "Something went wrong", { error: error.message })
      );
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, `videoId is missing or invalid`));
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json(new ApiResponse(404, `Video not found`));
    }
    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save();
    res
      .status(200)
      .json(
        new ApiResponse(200, `Video published status updated`, updatedVideo)
      );
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiResponse(500, "Something went wrong", { error: error.message })
      );
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
