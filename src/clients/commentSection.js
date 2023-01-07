// const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentDeleteBtns = document.querySelector(".video__comments").querySelectorAll("#deleteCommentBtn");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.className = "video__comment";
    newComment.dataset.id = id;

    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span")
    span2.innerText = "❌";
    span2.addEventListener("click", handleDeleteComment);

    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
    event.preventDefault();             // Preventing the form to be submitted
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;    // Geting which video we are watching

    if (text === "") {
        return;
    }
    
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {                                          // Information about the request
            "Content-Type": "application/json",             // Telling express that we are sending a json that was converted into string
        },
        body: JSON.stringify({
            text: text,
        }),
    });
    
    if (response.status === 201) {
        textarea.value = "";
        const responseInJson= await response.json()
        addComment(text, responseInJson.newCommentId);
    }
}

const handleDeleteComment = async (event) => {
    const commentId = event.srcElement.parentNode.dataset.id;
    const response = await fetch(`/api/comments/${commentId}/delete`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            commentId: commentId,
        })
    });

    event.srcElement.parentNode.remove();
}

if (form) {
    form.addEventListener("submit", handleSubmit);
}

if (commentDeleteBtns) {
    commentDeleteBtns.forEach(commentDeleteBtn => {
        commentDeleteBtn.addEventListener("click", handleDeleteComment);
    });
}
