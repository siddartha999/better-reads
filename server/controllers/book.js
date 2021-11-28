const User = require('../models/User');
const UserBook = require('../models/UserBook');
const Book = require('../models/Book');
const {BOOK_STATUS_CONSTANTS_NONE, BOOK_STATUS_CONSTANTS_WANT_TO_READ, 
    BOOK_STATUS_CONSTANTS_CURRENTLY_READING, BOOK_STATUS_CONSTANTS_READ} = require('../util/BookStatusConstants');

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
};

/**
 * Controller to retrieve the UserBook info from the UserBook collection.
 */
const getUserBookInfo = (req, res) => {
    const userId = req.userId;
    const bookId = req.params.bookId;

    UserBook.findOne({userId: userId, bookId: bookId}).exec((err, userbook) => {
        if(err) {
            return res.status(500).json({
                message: `Unable to retrieve the User's status & rating for the current book. Please try again later`
            });
        }
        return res.status(200).json({
            status: userbook?.status,
            rating: userbook?.rating
        });
    });
};


//Update the User, UserBook, Book collections for a change in the Book's status for the current user.
const updateUserBookStatus = (userId, bookId, data, req, res) => {
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

    //Update the status in the User collection.
    if(current !== BOOK_STATUS_CONSTANTS_NONE) {
        let updateObj = {};
        updateObj = {
            $push: $push
        };
        User.findByIdAndUpdate(userId, updateObj, (err, doc) => {
            if(err) {
                return res.status(500).json({
                    message: "Unable to modify the status. Please retry."
                });
            }
        });
    }
    if(prev !== BOOK_STATUS_CONSTANTS_NONE) {
        let updateObj = {};
        updateObj = {
            $pull: $pull
        };
        User.findByIdAndUpdate(userId, updateObj, (err, doc) => {
            if(err) {
                return res.status(500).json({
                    message: "Unabel to modify the status. Please retry."
                });
            }
        });
    }

    //Update the status in the UserBook collection
    UserBook.findOne({userId: userId, bookId: bookId}).exec((err, userbook) => {
        if(err) {//Handle the error case.
            return res.status(500).json({
                message: "We're experiencing conenctivity issues with the Database. Please revisit later."
            });
        }

        let newUserBook = userbook;
        if(userbook) { //User has already modified it's status before.
            newUserBook.status = current;
        }
        else { //User is updating the status for the current book for the first time.
            newUserBook = new UserBook({userId, bookId, status: current});
        }

        newUserBook.save((err, data) => {
            if(err) {
                return res.status(500).json({
                    message: "We're experiencing conenctivity issues with the Database. Please revisit later."
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


module.exports.updateUserBookDetails = updateUserBookDetails;
module.exports.getUserBookInfo = getUserBookInfo