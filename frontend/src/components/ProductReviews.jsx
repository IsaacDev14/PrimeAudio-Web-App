import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { AppIcon } from './ui/app-icon';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const ProductReviews = ({ productId }) => {
    const { isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        title: '',
        comment: ''
    });

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_URL}/reviews/product/${productId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setReviews(data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        const token = localStorage.getItem('token');
        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/reviews/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    ...newReview
                })
            });

            if (res.ok) {
                setShowForm(false);
                setNewReview({ rating: 5, title: '', comment: '' });
                // Show success message
                alert('Review submitted for approval!');
            } else {
                const error = await res.json();
                alert(error.detail || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleHelpful = async (reviewId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch(`${API_URL}/reviews/${reviewId}/helpful`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchReviews();
        } catch (error) {
            console.error('Error marking helpful:', error);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    return (
        <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Overall Rating */}
                <div className="text-center md:text-left">
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                        <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
                        <span className="text-gray-500">out of 5</span>
                    </div>
                    <div className="flex items-center gap-1 justify-center md:justify-start mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                    {ratingCounts.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 w-12">{star} star</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-500 w-8">{count}</span>
                        </div>
                    ))}
                </div>

                {/* Write Review Button */}
                <div className="flex items-center justify-center md:justify-end">
                    {isAuthenticated ? (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Write a Review
                        </button>
                    ) : (
                        <a
                            href={`/login?redirect=/shop/${productId}`}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Login to Review
                        </a>
                    )}
                </div>
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Write Your Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${star <= newReview.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                            <input
                                type="text"
                                value={newReview.title}
                                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Summarize your experience"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Share your experience with this product..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 border border-slate-200 rounded-full flex items-center justify-center bg-white">
                                        <AppIcon icon={User} size="md" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{review.user_name}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            {review.is_verified_purchase && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {review.title && (
                                <h4 className="font-medium text-gray-900 mt-3">{review.title}</h4>
                            )}
                            {review.comment && (
                                <p className="text-gray-600 mt-2">{review.comment}</p>
                            )}

                            <button
                                onClick={() => handleHelpful(review.id)}
                                className="flex items-center gap-1 mt-3 text-sm text-gray-500 hover:text-blue-600"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpful_votes})
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
