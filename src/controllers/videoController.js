export const getRoot = (req, res) => {
    res.render("roots/root");
}

export const getSearch = () => {
    res.send("Get Search");
}

export const getWatch = () => {
    res.send("Get watch");
}

export const getVideoEdit = () => {
    res.send("Get Edit");
}

export const postVideoEdit = () => {
    res.send("Post Edit");
}

export const postVideoDelete = () => {
    res.send("Get Delete");
}

export const getUpload = () => {
    res.send("Get Upload");
}

export const postUpload = () => {
    res.send("Post Upload");
}

