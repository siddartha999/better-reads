const BookReviews = require('../models/BookReviews');

const retrieveBookReviews = (req, res) => {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const data = req.body;
    
    BookReviews.findById(bookId).exec((err, bookReviews) => {
        if(err) {
            return res.status(500).json({
                message: `Unable to retrieve the community reviews for the book. Please try again later`
            });
        }
        return res.status(200).json({
            reviews: bookReviews?.reviews,
            userId: userId
        });
    });
};

module.exports.retrieveBookReviews = retrieveBookReviews;