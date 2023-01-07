import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

let isProduction = process.env.isProduction;

export const getRoot = async (req, res) => {
    const videos = await Video.find().sort({ createdAt: "desc" }).populate("owner");
    res.render("videos/root", {
        pageTitle: "Home",
        videos: videos,
    });
}

export const getWatch = async (req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id).populate("owner").populate("comments");
    
    if (video) {
        res.render("videos/watch", { pageTitle: video.title, video: video });
    } else {
        res.status(404).render("404", { pageTitle: "Video Not Found"});
    }
}

export const getSearch = async (req, res) => {
    const keyword = req.query.keyword;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),
                // $regex: new RegExp(`$${keyword}$`, "i"),
              },
        }).populate("owner")
        
    }
    res.render("videos/search", { pageTitle: "Search", videos: videos });
}

export const getUpload = (req, res) => {
    res.render("videos/upload", { pageTitle: "Upload Video"});
}

export const postUpload = async (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const hashtags = req.body.hashtags;
    const fileUrl = req.file.location;
    const user = req.session.user;

    try {
        const newVideo = await Video.create({
            title: title,
            description: description,
            hashtags: Video.formatHashtags(hashtags),
            fileUrl: isProduction ? fileUrl : req.file.path ,
            owner: user._id,
        });

        // Updating the DB
        const videoOwner = await User.findById(user._id);
        videoOwner.videos.push(newVideo._id);
        videoOwner.save();
        res.redirect("/");
    } catch(error) {
        res.status(400).render("videos/upload", { pageTitle: "Upload Video", errorMessage: error._message });
    }
}

export const getVideoEdit = async (req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id);
    const sessionUserId = req.session.user._id;

    if (video === null) {
        res.status(404).render("404", { pageTitle: "Video Not Found" });
    }

    if (String(sessionUserId) !== String(video.owner)) {
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    }
    
    res.render("videos/edit", { pageTitle: "Edit", video: video });
}

export const postVideoEdit = async (req, res) => {
    const id = req.params.id;
    const sessionsUserId = req.session.user._id;
    const newTitle = req.body.title;
    const newDescription = req.body.description;
    const newHashtags = req.body.hashtags;
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video Not Found" });
    }

    if (String(video.owner) !== String(sessionsUserId)) {
        req.flash("error", "You are not the the owner of the video.");
        return res.status(403).redirect("/");
    }
   
    await Video.findByIdAndUpdate(id, {
        title: newTitle,
        description: newDescription,
        hashtags: Video.formatHashtags(newHashtags),
    });
    res.redirect(`/videos/${id}`)
}

export const postVideoDelete = async (req, res) => {
    const id = req.params.id;
    const video = await Video.findById(id);
    const sessionsUserId = req.session.user._id;
    
    if (String(video.owner) !== String(sessionsUserId)) {
        return res.status(403).redirect("/");
    }

    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};

export const createComment = async (req, res) => {
    const videoId = req.params.id;
    const text = req.body.text;
    const userId = req.session.user._id;
    const video = await Video.findById(videoId);
    const user = await User.findById(userId);
                        
    if (!video) {
        return res.sendStatus(404);
    }
    const comment = await Comment.create({
        text: text,
        owner: userId,
        video: videoId,
    })
    video.comments.push(comment._id);
    await video.save();
    user.comments.push(comment._id);
    await user.save();
    return res.status(201).json({ newCommentId: comment._id });
}

export const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const sessionUser = req.session.user;
    const comment = await Comment.findById(commentId).populate("owner").populate("video");

    // Checking if the user who is trying to delete is the owner
    if (String(comment.owner._id) !== String(sessionUser._id)) {
        return res.sendStatus(404);
    }

    //// Delete the comment on the Video
    const videoId = comment.video._id;
    const video = await Video.findById(videoId);
    video.comments.splice(video.comments.indexOf(commentId), 1);
    await video.save();
    //// Delete the comment on the User
    const userId = sessionUser._id;
    const user = await User.findById(userId);
    
    user.comments.splice(user.comments.indexOf(commentId), 1);
    await user.save();
    //// Delete the actual comment
    await Comment.findByIdAndDelete(commentId);

    return res.sendStatus(201);
}
