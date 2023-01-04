import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {type: String, required: true },
    description: {type: String, required: true },
    createdAt: {type: Date, required: true, default: Date.now },
    hashtags: [{ type: String}],											// can make an array as well
    meta: {
        views: {type: Number, required: true, default: 0 },
        rating: {type: Number, required: true, default: 0 },
    },
    fileUrl: { type: String, required: true },   
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    // comments: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" }],
});

videoSchema.static("formatHashtags", function(hashtags) {
    return hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
});


const Video = mongoose.model("Video", videoSchema);
export default Video;