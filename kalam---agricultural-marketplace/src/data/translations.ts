import { SupportedLanguage } from '../types';

export const DICTIONARY: Record<string, Record<SupportedLanguage, string>> = {
  // Brand
  kalam: { en: 'KALAM', ta: 'களம்', si: 'කලම්' },

  // Auth & Roles
  login: { en: 'Login', ta: 'உள்நுழைக', si: 'පිවිසෙන්න' },
  register: { en: 'Register', ta: 'பதிவு செய்', si: 'ලියාපදිංචි වන්න' },
  logout: { en: 'Logout', ta: 'வெளியேறு', si: 'පිටවීම' },
  farmer: { en: 'Farmer', ta: 'விவசாயி', si: 'ගොවියා' },
  consumer: { en: 'Consumer', ta: 'நுகர்வோர்', si: 'පාරිභෝගිකයා' },
  admin: { en: 'Admin', ta: 'நிர்வாகி', si: 'පරිපාලක' },
  select_role: { en: 'Select Your Role', ta: 'உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்', si: 'ඔබේ භූමිකාව තෝරන්න' },
  full_name: { en: 'Full Name / Business Name', ta: 'முழுப் பெயர் / நிறுவனத்தின் பெயர்', si: 'සම්පූර්ණ නම / ව්‍යාපාර නාමය' },
  username: { en: 'Username', ta: 'பயனர்பெயர்', si: 'පරිශීලක නාමය' },
  email: { en: 'Email Address', ta: 'மின்னஞ்சல் முகவரி', si: 'විද්‍යුත් තැපෑල' },
  phone: { en: 'Phone / Mobile', ta: 'தொலைபேசி எண்', si: 'දුරකථන අංකය' },
  password: { en: 'Password', ta: 'கடவுச்சொல்', si: 'මුරපදය' },
  location: { en: 'Location / District', ta: 'இடம் / மாவட்டம்', si: 'ස්ථානය / දිස්ත්‍රික්කය' },
  demo_accounts: { en: 'Quick Demo Logins', ta: 'விரைவு மாதிரி கணக்குகள்', si: 'ක්ෂණික ආදර්ශ පිවිසුම්' },
  login_prompt: { en: 'Access your dedicated agricultural marketplace account', ta: 'உங்கள் பிரத்யேக விவசாய சந்தைக் கணக்கை அணுகவும்', si: 'ඔබගේ කෘෂිකාර්මික ගිණුමට ප්‍රවේශ වන්න' },
  register_prompt: { en: 'Create a new account on Kalam platform', ta: 'களம் தளத்தில் புதிய கணக்கை உருவாக்கவும்', si: 'කලම් වේදිකාවේ නව ගිණුමක් සාදන්න' },
  switch_to_register: { en: "Don't have an account? Register now", ta: 'கணக்கு இல்லையா? இப்போது பதிவு செய்யவும்', si: 'ගිණුමක් නැද්ද? දැන් ලියාපදිංචි වන්න' },
  switch_to_login: { en: 'Already registered? Login here', ta: 'ஏற்கனவே கணக்கு உள்ளதா? இங்கே உள்நுழைக', si: 'දැනටමත් ලියාපදිංචි වී ඇත්ද? මෙතනින් පිවිසෙන්න' },

  // Admin Dashboard & Monthly Income (Varavu)
  admin_dashboard: { en: 'Admin Dashboard', ta: 'நிர்வாகி கட்டுப்பாட்டு பலகை', si: 'පරිපාලක පාලක පුවරුව' },
  varavu_selavu: { en: 'Monthly Income (Varavu)', ta: 'மாதாந்திர வரவு', si: 'මාසික ආදායම' },
  monthly_income: { en: 'Monthly Income (Varavu)', ta: 'மாதாந்திர வரவு', si: 'මාසික ආදායම' },
  income: { en: 'Income (Varavu)', ta: 'வரவு', si: 'ආදායම' },
  total_income: { en: 'Total Registration Income', ta: 'மொத்த பதிவு வரவு', si: 'මුළු ලියාපදිංචි ආදායම' },
  gross_turnover: { en: 'Gross Market Turnover', ta: 'மொத்த சந்தை வர்த்தகம்', si: 'දළ වෙළඳපොළ පිරිවැටුම' },
  stock_inventory: { en: 'Sold & Unsold Stock Inventory', ta: 'விற்கப்பட்ட & விற்கப்படாத இருப்பு விவரம்', si: 'විකිණූ සහ විකිණීමට ඇති තොග' },
  user_directory: { en: 'Customer & User Directory', ta: 'வாடிக்கையாளர் & பயனர் பட்டியல்', si: 'පාරිභෝගික සහ පරිශීලක නාමාවලිය' },
  moderation_queue: { en: 'Listing Moderation Queue', ta: 'விளம்பர ஒப்புதல் வரிசை', si: 'ලැයිස්තුගත කිරීම් අනුමත කිරීමේ පෝලිම' },
  add_entry: { en: 'Add Ledger Entry', ta: 'கணக்கு பதிவு சேர்க்க', si: 'ගිණුම් සටහනක් එක් කරන්න' },
  category: { en: 'Category', ta: 'வகை', si: 'ප්‍රවර්ගය' },
  amount: { en: 'Amount (LKR)', ta: 'தொகை (LKR)', si: 'මුදල (LKR)' },
  description: { en: 'Description', ta: 'விளக்கம்', si: 'විස්තරය' },
  date: { en: 'Date', ta: 'தேதி', si: 'දිනය' },
  status: { en: 'Status', ta: 'நிலை', si: 'තත්ත්වය' },
  actions: { en: 'Actions', ta: 'நடவடிக்கைகள்', si: 'ක්‍රියාමාර්ග' },
  sold_qty: { en: 'Sold (Kg)', ta: 'விற்கப்பட்டது (கிலோ)', si: 'විකිණූ (කි.ග්‍රෑ)' },
  unsold_qty: { en: 'Unsold Stock (Kg)', ta: 'மீதமுள்ள இருப்பு (கிலோ)', si: 'ඉතිරි තොගය (කි.ග්‍රෑ)' },
  initial_stock: { en: 'Total Listed (Kg)', ta: 'மொத்த இருப்பு (கிலோ)', si: 'ලැයිස්තුගත මුළු ප්‍රමාණය' },
  in_stock: { en: 'In Stock', ta: 'இருப்பில் உள்ளது', si: 'තොගයේ ඇත' },
  low_stock: { en: 'Low Stock', ta: 'குறைந்த இருப்பு', si: 'අඩු තොග' },
  sold_out: { en: 'Sold Out', ta: 'விற்றுத் தீர்ந்தது', si: 'තොග අවසන්' },
  active: { en: 'Active', ta: 'செயலில்', si: 'සක්‍රීය' },
  suspended: { en: 'Suspended', ta: 'இடைநிறுத்தப்பட்டது', si: 'අත්හිටුවන ලදී' },
  approve: { en: 'Approve', ta: 'ஒப்புதல்', si: 'අනුමත කරන්න' },
  reject: { en: 'Reject', ta: 'நிராகரி', si: 'ප්‍රතික්ෂේප කරන්න' },

  // Farmer Hub
  farmer_dashboard: { en: 'Farmer Hub', ta: 'விவசாயி கட்டுப்பாட்டு அறை', si: 'ගොවි පාලක පුවරුව' },
  my_crops: { en: 'My Crop Listings', ta: 'எனது பயிர்கள்', si: 'මගේ බෝග' },
  add_crop: { en: 'Add New Crop', ta: 'புதிய பயிர் சேர்க்க', si: 'නව බෝගයක් එක් කරන්න' },
  orders_received: { en: 'Orders Received', ta: 'பெறப்பட்ட ஆர்டர்கள்', si: 'ලැබුණු ඇණවුම්' },
  earnings_ledger: { en: 'Earnings & Net Payouts', ta: 'வருவாய் & நிகர தொகைகள்', si: 'ආදායම සහ ශුද්ධ ගෙවීම්' },
  crop_name: { en: 'Crop Name', ta: 'பயிர் பெயர்', si: 'බෝගයේ නම' },
  price_per_kg: { en: 'Price / Kg (LKR)', ta: 'விலை / கிலோ (LKR)', si: 'මිල / කි.ග්‍රෑ (LKR)' },
  quantity: { en: 'Quantity (Kg)', ta: 'அளவு (கிலோ)', si: 'ප්‍රමාණය (කි.ග්‍රෑ)' },
  farmer_payout_notice: {
    en: 'You retain 100% of all sales proceeds under your annual LKR 1,000 membership with zero sales commission.',
    ta: 'உங்கள் வருடாந்திர ரூ. 1,000 சந்தாவின் கீழ் விற்பனைத் தொகையில் 100% உங்களுக்கே கிடைக்கும் (பூஜ்ஜிய தரகு).',
    si: 'ඔබගේ වාර්ෂික රු. 1,000 සාමාජිකත්වය යටතේ 0% කොමිස් සහිතව සියලුම විකුණුම් මුදලින් 100%ක්ම ඔබට හිමිවේ.'
  },
  mark_shipped: { en: 'Mark as Shipped', ta: 'அனுப்பப்பட்டதாக குறிக்கவும்', si: 'යවන ලද බව සලකුණු කරන්න' },
  completed: { en: 'Completed', ta: 'முடிவடைந்தது', si: 'සම්පූර්ණයි' },
  shipped: { en: 'Shipped', ta: 'அனுப்பப்பட்டது', si: 'යවා ඇත' },
  processing: { en: 'Processing', ta: 'செயலாக்கத்தில்', si: 'සැකසෙමින් පවතී' },

  // Consumer Marketplace
  direct_from_farm: { en: 'Direct from Farm Marketplace', ta: 'பண்ணையிலிருந்து நேரடி சந்தை', si: 'ගොවිපලෙන් සෘජු වෙළඳපොළ' },
  all_categories: { en: 'All Categories', ta: 'அனைத்து வகைகள்', si: 'සියලුම වර්ග' },
  vegetables: { en: 'Vegetables', ta: 'காய்கறிகள்', si: 'එළවළු' },
  fruits: { en: 'Fruits', ta: 'பழங்கள்', si: 'පලතුරු' },
  grains: { en: 'Grains', ta: 'தானியங்கள்', si: 'ධාන්‍ය' },
  spices: { en: 'Spices', ta: 'மசாலா பொருட்கள்', si: 'කුළුබඩු' },
  search_placeholder: { en: 'Search crop, farmer name, or location...', ta: 'பயிர், விவசாயி அல்லது இடத்தை தேடுக...', si: 'බෝගය, ගොවියා හෝ ස්ථානය සොයන්න...' },
  buy_now: { en: 'Buy Now', ta: 'இப்போதே வாங்கு', si: 'දැන්ම මිලදී ගන්න' },
  details: { en: 'View Details', ta: 'விவரம் பார்க்க', si: 'විස්තර බලන්න' },
  my_orders: { en: 'My Purchase History', ta: 'எனது கொள்முதல் வரலாறு', si: 'මගේ ඇණවුම් ඉතිහාසය' },
  confirm_order: { en: 'Confirm Order', ta: 'ஆர்டரை உறுதிப்படுத்து', si: 'ඇණවුම තහවුරු කරන්න' },
  subtotal: { en: 'Subtotal', ta: 'உப மொத்தம்', si: 'උප එකතුව' },
  platform_fee: { en: 'Platform Commission (0%)', ta: 'தள தரகு (0%)', si: 'වේදිකා ගාස්තුව (0%)' },
  farmer_net: { en: 'Farmer Direct Payout (100%)', ta: 'விவசாயி நேரடி தொகை (100%)', si: 'ගොවියාගේ සෘජු ගෙවීම (100%)' },
  total_payable: { en: 'Total Amount Payable', ta: 'செலுத்த வேண்டிய மொத்தத் தொகை', si: 'ගෙවිය යුතු මුළු මුදල' },
  producer: { en: 'Producer', ta: 'உற்பத்தியாளர்', si: 'නිෂ්පාදකයා' },
  rating: { en: 'Rating', ta: 'மதிப்பீடு', si: 'ශ්‍රේණිගත කිරීම' },

  // Produce Items
  potatoes: { en: 'Potatoes', ta: 'உருளைக்கிழங்கு', si: 'අල' },
  carrots: { en: 'Carrots', ta: 'கேரட்', si: 'කැරට්' },
  bulk_grains: { en: 'Bulk Grains (Paddy)', ta: 'மொத்த தானியங்கள் (நெல்)', si: 'තොග ධාන්‍ය (වී)' },
  red_chillies: { en: 'Red Chillies', ta: 'சிவப்பு மிளகாய்', si: 'රතු මිරිස්' },
  papayas: { en: 'Papayas', ta: 'பப்பாளி', si: 'පැපොල්' },
  yellow_bananas: { en: 'Yellow Bananas (Ambul)', ta: 'வாழைப்பழம் (ஆம்புல்)', si: 'ඇඹුල් කෙසෙල්' },

  // General & Microservices
  fastapi_microservices: { en: 'FastAPI Microservices Console', ta: 'FastAPI மைக்ரோசர்வீசஸ் பணியகம்', si: 'FastAPI මයික්‍රෝසර්විස් පාලකය' },
  order_success: { en: 'Order placed successfully!', ta: 'ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது!', si: 'ඇණවුම සාර්ථකව සිදු කරන ලදී!' },
  crop_added: { en: 'Crop listing published successfully!', ta: 'பயிர் விளம்பரம் வெற்றிகரமாக வெளியிடப்பட்டது!', si: 'බෝග ලැයිස්තුගත කිරීම සාර්ථකව එක් කරන ලදී!' },
};

export function t(key: string, lang: SupportedLanguage): string {
  const normalized = key.toLowerCase().trim();
  if (DICTIONARY[normalized] && DICTIONARY[normalized][lang]) {
    return DICTIONARY[normalized][lang];
  }
  for (const k of Object.keys(DICTIONARY)) {
    if (k === normalized || DICTIONARY[k].en.toLowerCase() === normalized) {
      return DICTIONARY[k][lang] || DICTIONARY[k].en;
    }
  }
  return key;
}
