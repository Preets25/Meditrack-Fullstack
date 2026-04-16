import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Star, Clock, MapPin, Phone, MessageSquare, PlusCircle, ArrowLeft, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { googleMapsEmbedUrl, googleMapsOpenUrl } from '../lib/maps';

const ShopDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/shops/${id}`);
      setData(res.data.data);
      
      // Fetch nearby stores (all others)
      const allShopsRes = await api.get('/shops');
      const allShops = allShopsRes.data.data || allShopsRes.data || [];
      setNearbyShops(allShops.filter(s => s._id !== id).slice(0, 3));
      
    } catch (err) {
      toast.error('Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/shops/${id}/reviews`, { rating, comment });
      toast.success('Review submitted successfully!');
      setComment('');
      fetchDetails(); // refetch to show new review
    } catch (err) {
      toast.error('Could not submit review.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data?.shop) {
    return (
      <div className="p-8 text-center bg-white m-6 rounded-xl border border-slate-100 shadow-sm">
        <Store size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">Shop not found</h3>
        <p className="text-slate-500 mt-2">This directory entry may have been removed.</p>
        <Link to="/shops" className="mt-4 inline-block text-blue-600 hover:underline">Return to Directory</Link>
      </div>
    );
  }

  const { shop, reviews, doctors } = data;

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <Link to="/shops" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium">
        <ArrowLeft size={20} /> Back to Directory
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
        <div className="md:flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{shop.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
              <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star size={18} fill="currentColor" /> {(Number(shop.rating) || 0).toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} /> {shop.address}
              </span>
              <span className="flex items-center gap-1">
                <Phone size={16} /> {shop.phone}
              </span>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-100 flex items-center gap-2">
            <Clock size={18} /> {shop.operatingHours || '09:00 - 20:00'}
          </div>
        </div>
        
        {/* Google Maps embed (no API key; uses coordinates when set) */}
        <div className="mt-8 space-y-2">
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <iframe
              title="Google Maps Location"
              width="100%"
              height="250"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapsEmbedUrl(shop)}
            />
          </div>
          <a
            href={googleMapsOpenUrl(shop)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-medium text-indigo-600 hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <MessageSquare className="text-blue-500" /> Customer Reviews
            </h2>
            
            {reviews?.length === 0 ? (
              <p className="text-slate-500 text-center py-6 bg-slate-50 rounded-xl border border-dashed">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                 {reviews?.map((rev, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                         <span className="font-semibold text-slate-800">{rev.userName || 'Anonymous'}</span>
                         <span className="flex items-center text-amber-500 text-sm font-bold">
                           <Star size={14} fill="currentColor" className="mr-1"/> {rev.rating}/5
                         </span>
                      </div>
                      <p className="text-slate-600 text-sm">{rev.comment}</p>
                    </div>
                 ))}
              </div>
            )}

            {/* Write Review */}
            <form onSubmit={handleReviewSubmit} className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <PlusCircle size={18} className="text-slate-400"/> Write a Review
              </h3>
              <div className="mb-4">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                 <select 
                   value={rating} 
                   onChange={(e) => setRating(Number(e.target.value))}
                   className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                 </select>
              </div>
              <div className="mb-4">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                 <textarea 
                   required
                   value={comment}
                   onChange={e => setComment(e.target.value)}
                   className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24"
                   placeholder="Share your experience..."
                 />
              </div>
              <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">
                Submit Review
              </button>
            </form>
          </div>
        </div>

        <div>
          {/* Doctor Schedule Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Visiting Doctors</h2>
            
            {!doctors || doctors.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-xl">No scheduling data available.</p>
            ) : (
              <div className="space-y-4">
                 {doctors.map((doc, idx) => (
                    <div key={idx} className="p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl">
                      <h4 className="font-bold text-indigo-900">{doc.doctorName}</h4>
                      <p className="text-indigo-600 text-sm mb-3">{doc.specialization}</p>
                      <div className="bg-white p-3 rounded-lg border border-indigo-50 text-sm">
                         <div className="font-medium text-slate-700">{doc.days.join(', ')}</div>
                         <div className="text-slate-500">{doc.timings}</div>
                      </div>
                    </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nearby Stores Module */}
      {nearbyShops.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">More Stores Nearby</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyShops.map((ns) => (
              <div key={ns._id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition">
                <h3 className="font-bold text-slate-800 text-lg mb-1">{ns.name}</h3>
                <p className="text-slate-500 text-sm mb-4 truncate"><MapPin size={14} className="inline mr-1" />{ns.address}</p>
                <Link to={`/shops/${ns._id}`} className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition">
                  Visit Store
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopDetail;
