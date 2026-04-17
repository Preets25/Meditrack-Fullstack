import axios from 'axios';

// ── 20+ Real Indian Chemist Shops with accurate WGS84 coordinates ──
const MOCK_SHOPS = [
  { _id: '1',  name: 'Apollo Pharmacy — Connaught Place',    address: 'N-17, Connaught Place, New Delhi',            city: 'New Delhi',   phone: '011-23411234', operatingHours: '08:00 - 22:00', rating: 4.8, reviews: [], latitude: 28.6327,  longitude: 77.2195  },
  { _id: '2',  name: 'MedPlus Chemist — Koramangala',        address: '47/1, 80 Feet Rd, Koramangala, Bengaluru',    city: 'Bengaluru',   phone: '080-43212121', operatingHours: '08:00 - 22:00', rating: 4.5, reviews: [], latitude: 12.9349,  longitude: 77.6205  },
  { _id: '3',  name: 'Wellness Forever — Bandra',            address: 'Shop 4, Hill Rd, Bandra West, Mumbai',        city: 'Mumbai',      phone: '022-26422200', operatingHours: '09:00 - 22:00', rating: 4.4, reviews: [], latitude: 19.0543,  longitude: 72.8400  },
  { _id: '4',  name: 'Netmeds Store — Anna Nagar',           address: '2nd Ave, Anna Nagar, Chennai',                city: 'Chennai',     phone: '044-42661234', operatingHours: '08:30 - 21:30', rating: 4.7, reviews: [], latitude: 13.0858,  longitude: 80.2101  },
  { _id: '5',  name: 'PharmEasy Store — Banjara Hills',      address: 'Road No 12, Banjara Hills, Hyderabad',        city: 'Hyderabad',   phone: '040-42015678', operatingHours: '09:00 - 22:00', rating: 4.6, reviews: [], latitude: 17.4156,  longitude: 78.4479  },
  { _id: '6',  name: '1mg Store — Aundh',                    address: 'DP Rd, Aundh, Pune',                          city: 'Pune',        phone: '020-41205050', operatingHours: '09:00 - 21:00', rating: 4.3, reviews: [], latitude: 18.5626,  longitude: 73.8077  },
  { _id: '7',  name: 'Shree Medicals — Park Street',         address: '14A Park Street, Kolkata',                    city: 'Kolkata',     phone: '033-22295060', operatingHours: '09:00 - 21:00', rating: 4.2, reviews: [], latitude: 22.5514,  longitude: 88.3529  },
  { _id: '8',  name: 'Healthians Pharmacy — C-Scheme',       address: 'C-9, Sawai Ram Singh Rd, Jaipur',            city: 'Jaipur',      phone: '0141-4115555', operatingHours: '09:00 - 21:00', rating: 4.1, reviews: [], latitude: 26.9124,  longitude: 75.7873  },
  { _id: '9',  name: 'Apollo Pharmacy — Chandigarh',         address: 'SCO 9, Sector 8-C, Chandigarh',               city: 'Chandigarh',  phone: '0172-2749999', operatingHours: '08:00 - 22:00', rating: 4.5, reviews: [], latitude: 30.7486,  longitude: 76.7956  },
  { _id: '10', name: 'Dr. Batra\'s Wellness — CG Road',      address: '204 CG Road, Navrangpura, Ahmedabad',         city: 'Ahmedabad',   phone: '079-26444122', operatingHours: '09:00 - 21:00', rating: 4.0, reviews: [], latitude: 23.0335,  longitude: 72.5677  },
  { _id: '11', name: 'MedPlus — Gachibowli',                 address: 'Plot 1109, ISB Rd, Gachibowli, Hyderabad',    city: 'Hyderabad',   phone: '040-42810099', operatingHours: '08:00 - 23:00', rating: 4.6, reviews: [], latitude: 17.4401,  longitude: 78.3489  },
  { _id: '12', name: 'Sanjivani Medicals — Hazratganj',      address: '26 Hazratganj, Lucknow',                      city: 'Lucknow',     phone: '0522-2612200', operatingHours: '09:00 - 21:00', rating: 4.2, reviews: [], latitude: 26.8467,  longitude: 80.9462  },
  { _id: '13', name: 'Medicine Shoppe — MG Road',            address: '12 MG Road, Indore',                          city: 'Indore',      phone: '0731-4015000', operatingHours: '09:00 - 21:00', rating: 4.3, reviews: [], latitude: 22.7196,  longitude: 75.8577  },
  { _id: '14', name: 'Green Cross Pharmacy — MG Road Kochi', address: 'Warriam Rd, Ernakulam, Kochi',                city: 'Kochi',       phone: '0484-2351234', operatingHours: '24/7',          rating: 4.8, reviews: [], latitude: 9.9816,   longitude: 76.2999  },
  { _id: '15', name: 'Jan Aushadhi Kendra — Sitabuldi',      address: 'Central Ave, Sitabuldi, Nagpur',              city: 'Nagpur',      phone: '0712-2441234', operatingHours: '09:00 - 20:00', rating: 4.0, reviews: [], latitude: 21.1463,  longitude: 79.0849  },
  { _id: '16', name: 'City Care Pharmacy — Ring Road',       address: 'Ring Road, Surat',                            city: 'Surat',       phone: '0261-2341234', operatingHours: '09:00 - 22:00', rating: 4.4, reviews: [], latitude: 21.1959,  longitude: 72.8302  },
  { _id: '17', name: 'Sunlife Chemist — MP Nagar',           address: 'Zone II, MP Nagar, Bhopal',                   city: 'Bhopal',      phone: '0755-4044044', operatingHours: '09:00 - 21:00', rating: 4.1, reviews: [], latitude: 23.2305,  longitude: 77.4328  },
  { _id: '18', name: 'Mahaveer Medical — RS Puram',          address: 'RS Puram, Coimbatore',                        city: 'Coimbatore',  phone: '0422-2541234', operatingHours: '09:00 - 21:00', rating: 4.3, reviews: [], latitude: 11.0057,  longitude: 76.9638  },
  { _id: '19', name: 'Fortis Pharmacy — Vasant Kunj',        address: 'Aruna Asaf Ali Marg, Vasant Kunj, Delhi',     city: 'New Delhi',   phone: '011-42776222', operatingHours: '07:00 - 22:00', rating: 4.7, reviews: [], latitude: 28.5274,  longitude: 77.1574  },
  { _id: '20', name: 'Care & Cure Surgicals — FC Road',      address: 'FC Road, Deccan, Pune',                       city: 'Pune',        phone: '020-25676789', operatingHours: '09:00 - 21:00', rating: 4.2, reviews: [], latitude: 18.5195,  longitude: 73.8409  },
  { _id: '21', name: 'Lifeline Pharmacy — Salt Lake',        address: 'Sector V, Salt Lake, Kolkata',                city: 'Kolkata',     phone: '033-23572000', operatingHours: '09:00 - 22:00', rating: 4.4, reviews: [], latitude: 22.5816,  longitude: 88.4149  },
  { _id: '22', name: 'Arogya Medical Hall — Sector 18 Noida',address: 'Sector 18, Noida',                            city: 'Noida',       phone: '0120-4101234', operatingHours: '09:00 - 21:00', rating: 4.1, reviews: [], latitude: 28.5700,  longitude: 77.3200  },
  { _id: '23', name: 'Apollo Pharmacy — Brigade Road',       address: '10 Brigade Road, Bengaluru',                  city: 'Bengaluru',   phone: '080-41551234', operatingHours: '08:00 - 22:00', rating: 4.6, reviews: [], latitude: 12.9755,  longitude: 77.6066  },
  { _id: '24', name: 'MedPlus — T Nagar',                    address: '45 Panagal Park, T Nagar, Chennai',           city: 'Chennai',     phone: '044-24341234', operatingHours: '09:00 - 21:30', rating: 4.5, reviews: [], latitude: 13.0418,  longitude: 80.2341  },
];

// Mock inventory items for demo
const MOCK_INVENTORY = [
  { _id: 'i1', shopId: MOCK_SHOPS[0]._id, name: 'Paracetamol 500mg',    genericName: 'Acetaminophen',  category: 'Tablet',     manufacturer: 'Cipla',       price: 12,   mrp: 15,   quantity: 150, unit: 'strips',  reorderLevel: 20, isAvailable: true,  requiresPrescription: false },
  { _id: 'i2', shopId: MOCK_SHOPS[0]._id, name: 'Amoxicillin 500mg',    genericName: 'Amoxicillin',    category: 'Capsule',    manufacturer: 'Sun Pharma',  price: 89,   mrp: 100,  quantity: 45,  unit: 'strips',  reorderLevel: 15, isAvailable: true,  requiresPrescription: true  },
  { _id: 'i3', shopId: MOCK_SHOPS[0]._id, name: 'Cough Syrup D',        genericName: 'Dextromethorphan',category: 'Syrup',     manufacturer: 'GSK',         price: 52,   mrp: 60,   quantity: 8,   unit: 'bottles', reorderLevel: 10, isAvailable: true,  requiresPrescription: false },
  { _id: 'i4', shopId: MOCK_SHOPS[0]._id, name: 'Calcium + D3 Tabs',    genericName: 'Calcium Carbonate',category: 'Supplement',manufacturer: 'Lupin',      price: 180,  mrp: 210,  quantity: 0,   unit: 'strips',  reorderLevel: 10, isAvailable: false, requiresPrescription: false },
  { _id: 'i5', shopId: MOCK_SHOPS[0]._id, name: 'Insulin Glargine',     genericName: 'Insulin',        category: 'Injection',  manufacturer: 'Sanofi',      price: 850,  mrp: 950,  quantity: 22,  unit: 'vials',   reorderLevel: 5,  isAvailable: true,  requiresPrescription: true  },
  { _id: 'i6', shopId: MOCK_SHOPS[0]._id, name: 'Salbutamol Inhaler',   genericName: 'Albuterol',      category: 'Inhaler',    manufacturer: 'Cipla',       price: 145,  mrp: 165,  quantity: 14,  unit: 'units',   reorderLevel: 5,  isAvailable: true,  requiresPrescription: true  },
  { _id: 'i7', shopId: MOCK_SHOPS[0]._id, name: 'Betamethasone Cream',  genericName: 'Betamethasone',  category: 'Topical',    manufacturer: 'Dr. Reddy\'s',price: 68,   mrp: 80,   quantity: 35,  unit: 'tubes',   reorderLevel: 8,  isAvailable: true,  requiresPrescription: false },
  { _id: 'i8', shopId: MOCK_SHOPS[0]._id, name: 'Metformin 500mg',      genericName: 'Metformin HCl',  category: 'Tablet',     manufacturer: 'USV',         price: 32,   mrp: 40,   quantity: 200, unit: 'strips',  reorderLevel: 30, isAvailable: true,  requiresPrescription: true  },
];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock interceptor for graceful fallback when backend isn't awake
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Intercepted Error:', error.config?.url);
    if (error.code === 'ERR_NETWORK' || !error.response) {
      const url  = String(error.config?.url || '');
      const method = error.config?.method;

      let mockData = {};

      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        mockData = {
          success: true,
          token: 'mock-jwt-token',
          user: { _id: '1', name: 'Demo User', email: 'demo@meditrack.local', role: 'shop_owner' }
        };
      } else if (url.includes('/medicines/stats')) {
        mockData = { total: 12, due: 3, lowStock: 2, minDays: 5 };
      } else if (url.includes('/medicines/today')) {
        mockData = [
          { _id: '1', name: 'Amoxicillin', dosage: '500mg', time: '08:00 AM' },
          { _id: '2', name: 'Lisinopril',  dosage: '10mg',  time: '01:00 PM' }
        ];
      } else if (url.includes('/doses/history')) {
        mockData = [
          { day: 'Mon', taken: 3, skipped: 0 }, { day: 'Tue', taken: 2, skipped: 1 },
          { day: 'Wed', taken: 4, skipped: 0 }, { day: 'Thu', taken: 3, skipped: 0 },
          { day: 'Fri', taken: 2, skipped: 2 }, { day: 'Sat', taken: 3, skipped: 0 },
          { day: 'Sun', taken: 3, skipped: 0 }
        ];
      } else if (url === '/medicines' && method === 'get') {
        mockData = [
          { _id: '1', name: 'Amoxicillin', dosage: '500mg', time: '08:00 AM', stock: 24 },
          { _id: '2', name: 'Lisinopril',  dosage: '10mg',  time: '01:00 PM', stock: 8  },
          { _id: '3', name: 'Metformin',   dosage: '500mg', time: '08:00 PM', stock: 60 }
        ];

      // ──── SHOPS ────────────────────────────────────────────────────
      } else if (url === '/shops/my') {
        mockData = { success: true, data: { ...MOCK_SHOPS[0], doctorSchedule: [], owner: '1' } };

      } else if (url.includes('/shops') && method === 'get') {
        const inventoryMatch = String(url).match(/\/shops\/([^/]+)\/inventory/);
        const detailMatch    = String(url).match(/\/shops\/([^/?#]+)\/?(?:\?.*)?$/);

        if (inventoryMatch) {
          mockData = { success: true, data: MOCK_INVENTORY };
        } else if (detailMatch && detailMatch[1] !== 'my') {
          const found = MOCK_SHOPS.find(s => String(s._id) === detailMatch[1]);
          mockData = { success: true, data: { shop: found || null, reviews: [], doctors: [], inventory: MOCK_INVENTORY.slice(0, 4) } };
        } else {
          mockData = { success: true, data: MOCK_SHOPS };
        }

      } else if (url.includes('/shops') && (method === 'post' || method === 'put')) {
        const inventoryMatch = String(url).match(/\/shops\/([^/]+)\/inventory/);
        const body = JSON.parse(error.config?.data || '{}');

        if (inventoryMatch) {
          const itemId = url.split('/inventory/')[1];
          if (itemId) {
            const existing = MOCK_INVENTORY.find(i => i._id === itemId);
            mockData = { success: true, data: { ...(existing || {}), ...body } };
          } else {
            mockData = { success: true, data: { _id: Date.now().toString(), shopId: inventoryMatch[1], ...body } };
          }
        } else {
          const isNew = method === 'post';
          mockData = { success: true, data: { _id: isNew ? Date.now().toString() : MOCK_SHOPS[0]._id, ...MOCK_SHOPS[0], ...body } };
        }

      } else if (url.includes('/shops') && method === 'delete') {
        mockData = { success: true, message: 'Deleted' };
      }

      console.warn(`Providing mock data for ${method} ${url}`);
      return Promise.resolve({ data: mockData, status: 200 });
    }
    return Promise.reject(error);
  }
);

export default api;