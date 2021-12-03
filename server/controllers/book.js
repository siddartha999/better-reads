const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const UserBook = require('../models/UserBook');
const Book = require('../models/Book');
const {BOOK_STATUS_CONSTANTS_NONE} = require('../util/BookStatusConstants');
const { UserRefreshClient } = require('googleapis-common');

/**
 * Controller to update the details(status, rating, review etc..) of the book for the current User.
 */
const updateUserBookDetails = (req, res) => {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const data = req.body;
    //Update the Book status for the user.
    if(data.status) {
        updateUserBookStatus(userId, bookId, data, req, res);
    }
    else if(data.rating) {//Update the Book's rating for the current user.
        updateUserBookRating(userId, bookId, data, req, res);
    }
    else if(data.extras) {//Update the Book's date-info & review by the current user.
        updateUserBookExtras(userId, bookId, data, req, res);
    }
};

/**
 * Controller to retrieve the UserBook info from the UserBook collection.
 */
const getUserBookInfo = (req, res) => {
    const userId = req.userId;
    const bookId = req.params.bookId;

    UserBook.findOne({userId: userId, bookId: bookId}).exec((err, userBook) => {
        if(err) {
            return res.status(500).json({
                message: `Unable to retrieve the User's status & rating for the current book. Please try again later`
            });
        }
        return res.status(200).json({
            status: userBook?.status,
            rating: userBook?.rating,
            startDate: userBook?.startDate,
            endDate: userBook?.endDate
        });
    });
};


//Update the UserActivity, UserBook, Book collections for a change in the Book's status for the current user.
const updateUserBookStatus = async (userId, bookId, data, req, res) => {
    const current = data.status.current;
    const prev = data.status.prev;
    let $push = {};
    $push[current] = {
        _id: bookId,
        cover: data.cover,
        name: data.name
    };
    let $pull = {};
    $pull[prev] = {
        _id: bookId
    };

    try {
        let resp;
        //Update the status in the UserActivity collection.
        if(current !== BOOK_STATUS_CONSTANTS_NONE) {
            let updateObj = {};
            updateObj = {
                $push: $push
            };
            resp = await UserActivity.findByIdAndUpdate(userId, updateObj);
        }
        if(prev !== BOOK_STATUS_CONSTANTS_NONE) {
            let updateObj = {};
            updateObj = {
                $pull: $pull
            };
            resp = await UserActivity.findByIdAndUpdate(userId, updateObj);
        }
    }
    catch(err) {
        return res.status(500).json({
            message: "Unable to modify the status. Please retry."
        });
    }

    //Update the status in the UserBook collection
    UserBook.findOne({userId: userId, bookId: bookId}).exec((err, userBook) => {
        if(err) {//Handle the error case.
            return res.status(500).json({
                message: "We're experiencing connectivity issues with the Database. Please revisit later."
            });
        }

        let newUserBook = userBook;
        if(userBook) { //User has already modified it's status before.
            newUserBook.status = current;
        }
        else { //User is updating the status for the current book for the first time.
            newUserBook = new UserBook({userId, bookId, status: current});
        }

        newUserBook.save((err, data) => {
            if(err) {
                return res.status(500).json({
                    message: "We're experiencing connectivity issues with the Database. Please revisit later."
                });
            }
            res.status(200).json({
                message: "Status has been updated successfully."
            });
        });

    });

    //Update the Book statistics for the status.
    Book.findById(bookId).exec((err, book) => {
        if(err) { //Handle the error case
            return;
        }

        let newBook = book;
        if(newBook) { //An entry already exists for the book.
            if(prev !== BOOK_STATUS_CONSTANTS_NONE) {
                newBook[prev] = newBook[prev] - 1;
            }
        }
        else {//No entry exists for the current book, create one.
            newBook = new Book({_id: bookId});
        }
        if(current !== BOOK_STATUS_CONSTANTS_NONE) {
            newBook[current] = newBook[current] + 1;
        }
        newBook.save((err, data) => {
            if(err) {
                console.log('Error updating Book status statistics');
                return;
            }
            console.log('Successfully updated Book status statistics', data);
        });
    });
};


/**
 * Function to update the book's rating for the current user in the UserActivity, UserBook, Book collections.
 */
const updateUserBookRating = async (userId, bookId, data, req, res) => {
    const rating        = data.rating;
    const bookCover     = data.cover;
    const bookName      = data.name;

    //Update the UserActivity collection.
    try {
        const userActivity = await UserActivity.findById(userId).exec();
        let newUserActivity = userActivity;
        if(!newUserActivity) {
            newUserActivity = new UserActivity({_id: userId});
        }

        //Update the previous rating info.
        if(rating.prev !== 0) {
            newUserActivity.ratingMap[Math.floor(rating.prev)] -= 1;
            newUserActivity.rated = newUserActivity.rated.filter(obj => obj._id !== bookId);
        }
        //Push the new rating info.
        newUserActivity.ratingMap[Math.floor(rating.current)] += 1;
        newUserActivity.rated.push({_id: bookId, cover: bookCover, name: bookName, rating: rating.current});

        //Save the updated info.
        try {
            const response = await newUserActivity.save();
        } catch(err) {
            console.log('ERR', err);
            return res.status(500).json({
                message: "We're experiencing connectivity issues with the Database. Please revisit later."
            });
        }
        console.log('DONE');
    }
    catch(err) {
        return res.status(500).json({
            message: "We're experiencing connectivity issues with the Database. Please revisit later."
        });
    }
    
    //Update the UserBook collection
    UserBook.findOne({userId: userId, bookId: bookId}).exec((err, userBook) => {
        if(err) {//Handle the error scenario.
            return res.status(500).json({
                message: "We're experiencing connectivity issues with the Database. Please revisit later."
            });
        }

        let newUserBook = userBook;
        if(userBook) { //User has already modified it's status before.
            newUserBook.rating = rating.current;
        }
        else { //User is updating the status for the current book for the first time.
            newUserBook = new UserBook({userId, bookId, rating: rating.current});
        }

        //Save the info.
        newUserBook.save((err, data) => {
            if(err) {
                return res.status(500).json({
                    message: "We're experiencing connectivity issues with the Database. Please revisit later."
                });
            }
            res.status(200).json({
                message: `Rating has been updated successfully for the book ${bookName}`
            });
        });
    });

    //Update the Book collection
    Book.findById(bookId).exec((err, book) => {
        if(err) { //Handle the error case
            return;
        }

        let newBook = book;
        if(!newBook) {
            newBook = new Book({_id: bookId});
        }

        let averageRating = newBook.averageRating || 0;
        let ratingCount = newBook.ratingCount;
        if(rating.prev === 0 ) {
            newBook.ratingCount = ratingCount + 1;
            newBook.averageRating = (averageRating + rating.current) / (newBook.ratingCount);
            newBook.ratings.push(userId);
        }
        else {
            newBook.averageRating = ((averageRating * ratingCount) - rating.prev + rating.current) / ratingCount;
        }

        //Save the Updated info.
        newBook.save((err, data) => {
            if(err) {
                console.log('Error updating Book status statistics');
                return;
            }
        });
    });

};

/**
 * Function to update the book extras such as Start date, End-date, review for the current user.
 */
const updateUserBookExtras = async (userId, bookId, data, req, res) => {
    if(!data.extras) return;
    if(data.extras.startDate || data.extras.endDate) {
        const startDate = data.extras.startDate;
        const endDate = data.extras.endDate;
        const status = data.extras.status;

        if(!status) {//Validate the status type.
            return res.status(400).json({
                message: 'Missing the status type.'
            });
        }

        let $pull = {};
        $pull[status] = {
            _id: bookId
        };
        let $push = {};
        $push[status] = {
            _id: bookId,
            cover: data.cover,
            name: data.name,
            startDate: startDate,
            endDate: endDate
        };

        try {//Update the UserActivity collection.
            let  resp   = await UserActivity.findByIdAndUpdate(userId, {$pull: $pull});
            resp        =  await UserActivity.findByIdAndUpdate(userId, {$push: $push});
        }
        catch(err) {
            return res.status(500).json({
                message: "Unable to modify the status. Please retry."
            });
        }

        //Update the UserBook collection.
        UserBook.findOne({userId: userId, bookId: bookId}).exec((err, userBook) => {
            if(err) {//Handle the error case.
                return res.status(500).json({
                    message: `Unable to retrieve the User's status & rating for the current book. Please try again later`
                });
            }

            let newUserBook = userBook;
            if(userBook) { //User has already modified it's status before.
                newUserBook.startDate = startDate;
                newUserBook.endDate = endDate;
            }
            else { //User is updating the status for the current book for the first time.
                newUserBook = new UserBook({userId, bookId, status: status, startDate: startDate, endDate: endDate});
            }
            console.log('newUserBook ', newUserBook);
            newUserBook.save((err, data) => {
                if(err) {
                    return res.status(500).json({
                        message: "We're experiencing connectivity issues with the Database. Please revisit later."
                    });
                }
                res.status(200).json({
                    message: "Status has been updated successfully."
                });
            });

        });
    }
};

module.exports.updateUserBookDetails = updateUserBookDetails;
module.exports.getUserBookInfo = getUserBookInfo;