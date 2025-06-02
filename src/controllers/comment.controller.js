import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !isValidObjectId(videoId)) {
    return res.status(400).json(
      new ApiResponse(400, `please provide valid videoId`, {
        error: "videoId missing or malformed",
      })
    );
  }

  try {
    const aggregateQuery = Comment.aggregate([
      {
        $match: {
          comment: videoId,
        },
      },
    ]);

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    const result = await Comment.aggregatePaginate(aggregateQuery, options);

    if (!result) {
      return res.status(500).json(
        new ApiResponse(
          500,
          `Something went wrong while fetching comments from db`,
          {
            error: "unable to communicate with db",
          }
        )
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, `Comments fethced successfully`, result));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while fetching comments`, {
        error: error.message,
      })
    );
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  const requiredFields = { videoId, content, userId };

  const missingFields = getMissingFields(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `missing fields: ${missingFields.join(", ")}`,
      })
    );
  }

  try {
    const comment = await Comment.create({
      owner: userId,
      video: videoId,
      content,
    });

    if (!comment) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while adding comments", {
          error: `unable to communicate with db`,
        })
      );
    }

    console.log(`comment: ${comment}`);

    res
      .status(200)
      .json(new ApiResponse(200, "Comment added successfully", comment));
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while adding comments`, {
        error: error.message,
      })
    );
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const requiredFields = {
    commentId,
    content,
  };

  const missingFields = getMissingFields(requiredFields);

  if (missingFields.length > 0) {
    return res.status(400).json(
      new ApiResponse(400, `Missing required fields`, {
        error: `missing fields: ${missingFields.join(", ")}`,
      })
    );
  }

  try {
    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
      content,
    });

    if (!updatedComment) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while updating comments", {
          error: `unable to communicate with db`,
        })
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "Comment updated successfully", updatedComment)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while updating comments`, {
        error: error.message,
      })
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId || !isValidObjectId(commentId)) {
    return res.status(400).json(
      new ApiResponse(400, `please provide valid commentId`, {
        error: "commentId missing or malformed",
      })
    );
  }

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while deleting comments", {
          error: `unable to communicate with db`,
        })
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "Comment deleted successfully", deletedComment)
      );
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, `Something went wrong while deleting comments`, {
        error: error.message,
      })
    );
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
