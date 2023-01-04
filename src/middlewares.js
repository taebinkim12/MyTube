export const localMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.loggedIn = true;
    } else {
        res.locals.loggedIn = false;
    }
    res.locals.loggedInUser = req.session.user || {};
    
    // res.locals.isHeroku = isHeroku;
    next();
}