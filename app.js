const {
  useState,
  useEffect,
  useRef
} = React;

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALEreDH3w7-KAAH3DNlclbRAMA6upWMjA",
  authDomain: "sms-funding.firebaseapp.com",
  databaseURL: "https://sms-funding-default-rtdb.firebaseio.com",
  projectId: "sms-funding",
  storageBucket: "sms-funding.firebasestorage.app",
  messagingSenderId: "1022552202404",
  appId: "1:1022552202404:web:4f1d158c1bae0d64c01a31",
  measurementId: "G-RDDGCJ302W"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Constants
const PEOPLE = ['Srestho', 'Shafin', 'Muwaz'];
const GOAL_AMOUNT = 500;
const DONATION_PERCENTAGE = 10;
const ARDUINO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/500px-Arduino_Uno_-_R3.jpg";

// Rocket Loader Component
function RocketLoader() {
  return (
    <div className="rocket-loader-container">
      <div className="rocket">
        {/* Rocket Nose */}
        <div className="rocket-nose"></div>
        
        {/* Rocket Body */}
        <div className="rocket-body">
          <div className="rocket-window"></div>
        </div>
        
        {/* Rocket Fins */}
        <div className="rocket-fin rocket-fin-left"></div>
        <div className="rocket-fin rocket-fin-right"></div>
        
        {/* Exhaust Flames */}
        <div className="rocket-exhaust">
          <div className="flame flame-1"></div>
          <div className="flame flame-2"></div>
          <div className="flame flame-3"></div>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="loading-text">
        <span className="loading-dot">.</span>
        <span className="loading-dot">.</span>
        <span className="loading-dot">.</span>
      </div>
    </div>
  );
}

// Login Component
function LoginScreen( {
  onLogin
}) {
  const [email,
    setEmail] = useState('');
  const [password,
    setPassword] = useState('');
  const [loading,
    setLoading] = useState(false);
  const [error,
    setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await auth.signInWithEmailAndPassword(email, password);
      onLogin();
    } catch (err) {
      setError('Invalid credentials. Contact Srestho for access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={ { background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl" style={ { background: 'var(--bg-secondary)' }}>
        <h1 className="text-3xl font-bold text-center mb-2" style={ { color: 'var(--text-primary)' }}>
          SMS Funding
        </h1>
        <p className="text-center mb-8" style={ { color: 'var(--text-secondary)' }}>
          🔒 Secure Login
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={ { color: 'var(--text-primary)' }}>
              Email
            </label>
            <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg border-2"
            style={ {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
            required
            />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={ { color: 'var(--text-primary)' }}>
            Password
          </label>
          <div className="relative">
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg border-2 pr-12"
            style={ {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
            required
            />
          <button
            type="button"
            onClick={() => {
              const input = document.querySelector('input[type="password"], input[type="text"]');
              input.type = input.type === 'password' ? 'text': 'password';
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl"
            >
            👁️
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg font-semibold text-white transition-all"
        style={ { background: 'var(--accent)' }}
        >
        {loading ? 'Logging in...': '🔓 Login'}
      </button>
    </form>

    <p className="text-xs text-center mt-6" style={ { color: 'var(--text-secondary)' }}>
      SMS members only • Contact Srestho for access
    </p>
  </div>
</div>
);
}

// Main App Component
function FundingTracker() {
const [user,
setUser] = useState(null);
const [authLoading,
setAuthLoading] = useState(true);
const [contributions,
setContributions] = useState([]);
const [deletionHistory,
setDeletionHistory] = useState([]);
const [selectedPerson,
setSelectedPerson] = useState('');
const [amount,
setAmount] = useState('');
const [date,
setDate] = useState(new Date().toISOString().split('T')[0]);
const [note,
setNote] = useState('');
const [loading,
setLoading] = useState(true);
const [deletedBy,
setDeletedBy] = useState('');
const [showCelebration,
setShowCelebration] = useState(false);
const [previousTotal,
setPreviousTotal] = useState(0);
const [darkMode,
setDarkMode] = useState(false);
const [activeTab,
setActiveTab] = useState('home');
const [streaks,
setStreaks] = useState( {});
const [showInstallPrompt,
setShowInstallPrompt] = useState(false);
const deferredPrompt = useRef(null);
const [historyCollapsed, setHistoryCollapsed] = useState(false);
const [deletionCollapsed, setDeletionCollapsed] = useState(false);

// Check authentication
useEffect(() => {
const unsubscribe = auth.onAuthStateChanged((user) => {
setUser(user);
setAuthLoading(false);
});
return () => unsubscribe();
}, []);

// For the native app feel
useEffect(() => {
  let startY = 0;
  
  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    if (window.scrollY === 0 && e.touches[0].clientY > startY + 100) {
      window.location.reload();
    }
  };
  
  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
  
  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
  };
}, []);

// PWA Install Prompt
useEffect(() => {
const handler = (e) => {
e.preventDefault();
deferredPrompt.current = e;
setShowInstallPrompt(true);
};

window.addEventListener('beforeinstallprompt', handler);
return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);

const handleInstall = async () => {
if (!deferredPrompt.current) return;

deferredPrompt.current.prompt();
const {
outcome
} = await deferredPrompt.current.userChoice;

if (outcome === 'accepted') {
setShowInstallPrompt(false);
}
deferredPrompt.current = null;
};

// Dark mode
useEffect(() => {
const saved = localStorage.getItem('darkMode');
if (saved) {
setDarkMode(JSON.parse(saved));
}
},
[]);

useEffect(() => {
document.documentElement.setAttribute('data-theme', darkMode ? 'dark': 'light');
localStorage.setItem('darkMode', JSON.stringify(darkMode));
},
[darkMode]);

// Create confetti
const createConfetti = () => {
const colors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
];
const confettiCount = 50;

for (let i = 0; i < confettiCount; i++) {
const confetti = document.createElement('div');
confetti.className = 'confetti';
confetti.style.left = Math.random() * 100 + '%';
confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
confetti.style.animationDelay = Math.random() * 2 + 's';
confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
document.body.appendChild(confetti);

setTimeout(() => confetti.remove(), 5000);
}
};

// Calculate streaks
const calculateStreaks = (contribs) => {
const streakData = {};

PEOPLE.forEach(person => {
const personContribs = contribs
.filter(c => c.person === person)
.sort((a, b) => new Date(b.date) - new Date(a.date));

if (personContribs.length === 0) {
streakData[person] = 0;
return;
}

let streak = 0;
const today = new Date();
today.setHours(0, 0, 0, 0);

for (let i = 0; i < personContribs.length; i++) {
const contribDate = new Date(personContribs[i].date);
contribDate.setHours(0, 0, 0, 0);

const expectedDate = new Date(today);
expectedDate.setDate(today.getDate() - i);

if (contribDate.getTime() === expectedDate.getTime()) {
streak++;
} else {
break;
}
}

streakData[person] = streak;
});

return streakData;
};

// Load contributions
useEffect(() => {
if (!user) return;

const contributionsRef = database.ref('contributions');

contributionsRef.on('value', (snapshot) => {
const data = snapshot.val();
if (data) {
const contribArray = Object.keys(data).map(key => ({
id: key,
...data[key]
}));
contribArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

const newTotal = contribArray.reduce((sum, c) => sum + c.amount, 0);
if (previousTotal > 0 && newTotal > previousTotal) {
setShowCelebration(true);
createConfetti();
setTimeout(() => setShowCelebration(false), 3000);
}
setPreviousTotal(newTotal);

setContributions(contribArray);
setStreaks(calculateStreaks(contribArray));
} else {
setContributions([]);
setStreaks({});
}
setLoading(false);
});

return () => contributionsRef.off();
}, [user, previousTotal]);

// Load deletion history
useEffect(() => {
if (!user) return;

const deletionsRef = database.ref('deletions');

deletionsRef.on('value', (snapshot) => {
const data = snapshot.val();
if (data) {
const deletionArray = Object.keys(data).map(key => ({
id: key,
...data[key]
}));
deletionArray.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
setDeletionHistory(deletionArray);
} else {
setDeletionHistory([]);
}
});

return () => deletionsRef.off();
}, [user]);

const addContribution = () => {
if (!selectedPerson || !amount || !date) {
alert('Please fill all required fields');
return;
}

const newContribution = {
person: selectedPerson,
amount: parseFloat(amount),
date: date,
note: note || '',
timestamp: new Date().toISOString()
};

database.ref('contributions').push(newContribution);

setAmount('');
setNote('');
setSelectedPerson('');
setDate(new Date().toISOString().split('T')[0]);
};

const deleteContribution = (contribution) => {
if (!deletedBy) {
alert('Please select who is deleting this contribution');
return;
}

if (!confirm(`Delete ${contribution.person}'s ৳${contribution.amount} contribution?`)) return;

const deletionRecord = {
deletedBy: deletedBy,
originalContribution: {
person: contribution.person,
amount: contribution.amount,
date: contribution.date,
note: contribution.note || ''
},
deletedAt: new Date().toISOString()
};

database.ref('deletions').push(deletionRecord);
database.ref('contributions/' + contribution.id).remove();

setDeletedBy('');
};

const getTotalByPerson = (person) => {
return contributions
.filter(c => c.person === person)
.reduce((sum, c) => sum + c.amount, 0);
};

const getGrandTotal = () => {
return contributions.reduce((sum, c) => sum + c.amount, 0);
};

const getDonationAmount = () => {
  return 0; // Zakah removed
};

const getAfterDonation = () => {
  return getGrandTotal(); // No zakah deduction
};

const getProgressPercentage = () => {
return Math.min((getAfterDonation() / GOAL_AMOUNT) * 100, 100);
};

const getMilestoneMessage = () => {
  const progress = getProgressPercentage();
  
  if (progress >= 100) return "🎉 Goal Crushed!";
  if (progress >= 90) return "🔥 Almost There!";
  if (progress >= 75) return "💪 Keep Pushing!";
  if (progress >= 50) return "⚡ Halfway Hero!";
  if (progress >= 25) return "🚀 Great Start!";
  return "🌱 Let's Grow!";
};

<div className="text-center mt-2">
  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
    {getMilestoneMessage()}
  </span>
</div>

const getRemainingAmount = () => {
return Math.max(GOAL_AMOUNT - getAfterDonation(), 0);
};

const getPrediction = () => {
if (contributions.length < 2) return null;

const last7Days = contributions.filter(c => {
const contribDate = new Date(c.date);
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);
return contribDate >= weekAgo;
});

if (last7Days.length === 0) return null;

const avgPerDay = last7Days.reduce((sum, c) => sum + c.amount, 0) / 7;
const remaining = getRemainingAmount();
const daysNeeded = Math.ceil(remaining / avgPerDay);

return daysNeeded;
};

const getWeeklyStats = () => {
const weekData = {};
const today = new Date();

for (let i = 6; i >= 0; i--) {
const date = new Date(today);
date.setDate(today.getDate() - i);
const dateStr = date.toISOString().split('T')[0];

weekData[dateStr] = {
date: dateStr,
Srestho: 0,
Shafin: 0,
Muwaz: 0
};
}

contributions.forEach(c => {
if (weekData[c.date]) {
weekData[c.date][c.person] += c.amount;
}
});

return Object.values(weekData);
};

// New Stats Helper Functions
const getMostActiveContributor = () => {
  if (contributions.length === 0) return { person: 'N/A', count: 0 };
  
  const counts = {};
  PEOPLE.forEach(person => {
    counts[person] = contributions.filter(c => c.person === person).length;
  });
  
  const maxPerson = Object.keys(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b
  );
  
  return { person: maxPerson, count: counts[maxPerson] };
};

const getHighestContribution = () => {
  if (contributions.length === 0) return null;
  
  return contributions.reduce((max, c) => 
    c.amount > max.amount ? c : max
  );
};

const getContributionCount = (person) => {
  return contributions.filter(c => c.person === person).length;
};

const getFirstContributionDate = () => {
  if (contributions.length === 0) return null;
  
  const sorted = [...contributions].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  return sorted[0].date;
};

const getMaxContributionForChart = () => {
  const max = Math.max(...PEOPLE.map(p => getTotalByPerson(p)));
  return max > 0 ? max : 100;
};

const getDailyTotals = () => {
  return weeklyStats.map(day => ({
    date: day.date,
    total: day.Srestho + day.Shafin + day.Muwaz
  }));
};

const handleLogout = () => {
auth.signOut();
};

if (authLoading) {
return <RocketLoader />;
}

if (!user) {
return <LoginScreen onLogin={() => setUser(auth.currentUser)} />;
}

if (loading) {
return <RocketLoader />;
}

const prediction = getPrediction();
const weeklyStats = getWeeklyStats();

// Render Home Tab
const renderHome = () => (
<div className="p-4 max-w-4xl mx-auto pb-20 fade-in">
{/* Header */}
<div className="mb-6 rounded-2xl shadow-lg p-6 glass-card">
<div className="flex justify-between items-center mb-4">
<div>
<h1 className="text-2xl font-bold" style={ { color: 'var(--text-primary)' }}>
SMS Funding Tracker
</h1>
<p className="text-sm" style={ { color: 'var(--text-secondary)' }}>
🟢 Live • Synced
</p>
</div>
<button
onClick={handleLogout}
className="px-4 py-2 rounded-lg text-sm font-semibold"
style={ { background: 'var(--accent)', color: 'white' }}
>
Logout
</button>
</div>

{/* Contribution Form */}
<div className="space-y-3">
<select
value={selectedPerson}
onChange={(e) => setSelectedPerson(e.target.value)}
className="w-full px-4 py-3 rounded-lg border-2"
style={ {
background: 'var(--bg-primary)',
color: 'var(--text-primary)',
borderColor: 'var(--border-color)'
}}
>
<option value="">Select person</option>
{PEOPLE.map(person => (
<option key={person} value={person}>{person}</option>
))}
</select>

<input
type="number"
value={amount}
onChange={(e) => setAmount(e.target.value)}
placeholder="Amount (৳)"
className="w-full px-4 py-3 rounded-lg border-2"
style={ {
background: 'var(--bg-primary)',
color: 'var(--text-primary)',
borderColor: 'var(--border-color)'
}}
/>

<input
type="date"
value={date}
onChange={(e) => setDate(e.target.value)}
className="w-full px-4 py-3 rounded-lg border-2"
style={ {
background: 'var(--bg-primary)',
color: 'var(--text-primary)',
borderColor: 'var(--border-color)'
}}
/>

<input
type="text"
value={note}
onChange={(e) => setNote(e.target.value)}
placeholder="Note (optional)"
className="w-full px-4 py-3 rounded-lg border-2"
style={ {
background: 'var(--bg-primary)',
color: 'var(--text-primary)',
borderColor: 'var(--border-color)'
}}
/>

<button
onClick={addContribution}
className="w-full py-3 rounded-lg font-semibold text-white"
style={ { background: 'var(--accent)' }}
>
➕ Log Contribution
</button>
</div>
</div>

{/* Streaks */}
<div className="grid grid-cols-3 gap-3 mb-6">
{PEOPLE.map(person => (
<div key={person} className="rounded-xl shadow p-4 text-center" style={ { background: 'var(--bg-secondary)' }}>
<div className="text-2xl mb-1">
{streaks[person] > 0 ? <span className="fire-animation">🔥</span>: '😴'}
</div>
<div className="font-bold text-lg" style={ { color: 'var(--text-primary)' }}>
{streaks[person]}
</div>
<div className="text-xs" style={ { color: 'var(--text-secondary)' }}>
{person}
</div>
</div>
))}
</div>

{/* Goal Section */}
<div className="mb-6 rounded-2xl shadow-lg p-6" style={ { background: 'var(--bg-secondary)' }}>
<h2 className="text-xl font-bold mb-4" style={ { color: 'var(--text-primary)' }}>
🎯 Goal: Arduino Uno
</h2>

<div className="mb-4">
<img
src={ARDUINO_IMAGE}
alt="Arduino Uno"
className="w-full rounded-lg shadow-md mb-4"
/>

<div className="flex justify-between mb-2 text-sm">
<span style={ { color: 'var(--text-secondary)' }}>Progress</span>
<span className="font-bold" style={ { color: 'var(--text-primary)' }}>
৳{getAfterDonation().toFixed(0)} / ৳{GOAL_AMOUNT}
</span>
</div>

<div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
<div
className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-8 rounded-full transition-all duration-500 flex items-center justify-center progress-bar-glow relative"
style={ { width: `${getProgressPercentage()}%` }}
>
{getProgressPercentage() > 5 && (
<>
<div className="sparkle"></div>
<div className="sparkle"></div>
<div className="sparkle"></div>
<div className="sparkle"></div>
<div className="sparkle"></div>
</>
)}
<span className="text-white text-sm font-bold relative z-10">
{getProgressPercentage().toFixed(1)}%
</span>
</div>
</div>
</div>

{getAfterDonation() >= GOAL_AMOUNT ? (
<div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 text-center celebrate">
<p className="text-xl font-bold text-green-700">
🎉 Goal Achieved!
</p>
<p className="text-green-600">
Buy the Arduino now!
</p>
</div>
): (
<div className="space-y-2">
<div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
<p className="font-semibold text-blue-800">
৳{getRemainingAmount().toFixed(0)} remaining
</p>
</div>

{prediction && (
<div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
<p className="text-sm font-semibold text-purple-800">
📊 Prediction: ~{prediction} days to goal
</p>
<p className="text-xs text-purple-600">
Based on last 7 days
</p>
</div>
)}
</div>
)}
</div>


{/* Individual Totals */}
<div className="grid grid-cols-3 gap-3 mb-6">
{PEOPLE.map(person => (
<div key={person} className="rounded-xl shadow p-4" style={ { background: 'var(--bg-secondary)' }}>
<div className="text-sm mb-1" style={ { color: 'var(--text-secondary)' }}>
👤 {person}
</div>
<div className="text-xl font-bold" style={ { color: 'var(--accent)' }}>
৳{getTotalByPerson(person)}
</div>
</div>
))}
</div>

{/* Contribution History */}
<div className="rounded-2xl shadow-lg p-6 mb-6" style={{ background: 'var(--bg-secondary)' }}>
  <div 
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setHistoryCollapsed(!historyCollapsed)}
  >
    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
      History ({contributions.length})
    </h2>
    <button className="text-2xl" style={{ color: 'var(--text-primary)' }}>
      {historyCollapsed ? '▼' : '▲'}
    </button>
  </div>

  {!historyCollapsed && (
    <>
      {contributions.length === 0 ? (
        <p className="text-center py-8 mt-4" style={{ color: 'var(--text-secondary)' }}>
          No contributions yet
        </p>
      ) : (
        <div className="space-y-2 mt-4">
          {contributions.map(contribution => (
            <div
              key={contribution.id}
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-primary)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {contribution.person}
                    </span>
                    <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                      ৳{contribution.amount}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {contribution.date}
                  </div>
                  {contribution.note && (
                    <div className="text-sm mt-1 italic" style={{ color: 'var(--text-secondary)' }}>
                      "{contribution.note}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={deletedBy}
                    onChange={(e) => setDeletedBy(e.target.value)}
                    className="px-2 py-1 border rounded text-xs"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <option value="">Delete?</option>
                    {PEOPLE.map(person => (
                      <option key={person} value={person}>{person}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteContribution(contribution)}
                    className="text-red-500 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}
</div>

{/* Deletion History */}
{deletionHistory.length > 0 && (
<div className="rounded-2xl shadow-lg p-6 mb-6" style={{
  background: darkMode ? '#7f1d1d' : '#fee2e2',
  border: `2px solid ${darkMode ? '#991b1b' : '#fca5a5'}`
}}>
  <div 
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setDeletionCollapsed(!deletionCollapsed)}
  >
    <h2 className="text-xl font-bold" style={{
      color: darkMode ? '#fecaca' : '#991b1b'
    }}>
      🗑️ Deletion History ({deletionHistory.length})
    </h2>
    <button className="text-2xl">
      {deletionCollapsed ? '▼' : '▲'}
    </button>
  </div>

  {!deletionCollapsed && (
    <div className="space-y-2 mt-4">
      {deletionHistory.map(deletion => (
        <div
          key={deletion.id}
          className="p-3 rounded-lg"
          style={{
            background: darkMode ? '#1e293b' : '#ffffff',
            border: `1px solid ${darkMode ? '#991b1b' : '#fca5a5'}`
          }}
        >
          <p className="font-semibold text-sm" style={{
            color: darkMode ? '#f1f5f9' : '#1f2937'
          }}>
            <span style={{ color: darkMode ? '#fca5a5' : '#dc2626' }}>{deletion.deletedBy}</span> deleted{' '}
            <span style={{ color: 'var(--accent)' }}>{deletion.originalContribution.person}'s</span>{' '}
            ৳{deletion.originalContribution.amount}
          </p>
          <p className="text-xs" style={{
color: darkMode ? '#cbd5e1' : '#6b7280'
        }}>
          {new Date(deletion.deletedAt).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
)}
</div>
)}
</div>
);

//// Render Stats Tab
const renderStats = () => {
  const weeklyTotal = weeklyStats.reduce((sum, d) => sum + d.Srestho + d.Shafin + d.Muwaz, 0);
  const avgPerDay = (weeklyTotal / 7).toFixed(0);
  const mostActive = getMostActiveContributor();
  const highest = getHighestContribution();
  const firstDate = getFirstContributionDate();
  const maxForChart = getMaxContributionForChart();
  const dailyTotals = getDailyTotals();
  const maxDaily = Math.max(...dailyTotals.map(d => d.total), 1);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20 fade-in">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl shadow p-4 text-center" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            Grand Total
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            ৳{getGrandTotal()}
          </div>
        </div>
        
        <div className="rounded-xl shadow p-4 text-center" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            This Week
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            ৳{weeklyTotal}
          </div>
        </div>
        
        <div className="rounded-xl shadow p-4 text-center" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
            Avg/Day
          </div>
          <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            ৳{avgPerDay}
          </div>
        </div>
      </div>

      {/* Individual Performance - Vertical Columns */}
      <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ background: 'var(--bg-secondary)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📊 Individual Contributions
        </h2>
        
        <div className="flex justify-around items-end h-48 mb-4">
          {PEOPLE.map((person, idx) => {
            const total = getTotalByPerson(person);
            const heightPercent = (total / maxForChart) * 100;
            const colors = {
              'Srestho': '#3b82f6',
              'Shafin': '#10b981',
              'Muwaz': '#a855f7'
            };
            
            return (
              <div key={person} className="flex flex-col items-center" style={{ width: '28%' }}>
                <div className="w-full flex justify-center items-end" style={{ height: '160px' }}>
                  <div 
                    className="stat-column"
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: colors[person],
                      borderRadius: '8px 8px 0 0',
                      animationDelay: `${idx * 0.2}s`,
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ৳{total}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
                  {person}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {getContributionCount(person)}x
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Trend - Daily Totals */}
      <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ background: 'var(--bg-secondary)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          📈 Last 7 Days Activity
        </h2>
        
        <div className="flex justify-between items-end h-32 mb-2">
          {dailyTotals.map((day, idx) => {
            const heightPercent = (day.total / maxDaily) * 100;
            
            return (
              <div key={idx} className="flex flex-col items-center" style={{ width: '13%' }}>
                <div className="w-full flex justify-center items-end" style={{ height: '100px' }}>
                  <div 
                    className="stat-column-small"
                    style={{
                      width: '100%',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                      borderRadius: '4px 4px 0 0',
                      animationDelay: `${idx * 0.1}s`
                    }}
                  />
                </div>
                <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  ৳{day.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl shadow p-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Most Active
          </div>
          <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
            {mostActive.person}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {mostActive.count} times
          </div>
        </div>
        
        <div className="rounded-xl shadow p-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Highest Single
          </div>
          {highest ? (
            <>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                ৳{highest.amount}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {highest.person}
              </div>
            </>
          ) : (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>N/A</div>
          )}
        </div>
        
        <div className="rounded-xl shadow p-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Current Streak 🔥
          </div>
          {Object.keys(streaks).length > 0 ? (
            <>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {Math.max(...Object.values(streaks))} days
              </div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {Object.keys(streaks).find(k => streaks[k] === Math.max(...Object.values(streaks)))}
              </div>
            </>
          ) : (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>N/A</div>
          )}
        </div>
        
        <div className="rounded-xl shadow p-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            First Contribution
          </div>
          {firstDate ? (
            <>
              <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                {new Date(firstDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {new Date(firstDate).getFullYear()}
              </div>
            </>
          ) : (
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>N/A</div>
          )}
        </div>
      </div>

      {/* Contribution Frequency */}
      <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ background: 'var(--bg-secondary)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          🎯 Contribution Frequency
        </h2>
        
        <div className="space-y-4">
          {PEOPLE.map(person => {
            const count = getContributionCount(person);
            const maxCount = Math.max(...PEOPLE.map(p => getContributionCount(p)), 1);
            const widthPercent = (count / maxCount) * 100;
            
            return (
              <div key={person}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {person}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    {count}x
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div 
                    className="stat-bar"
                    style={{
                      width: `${widthPercent}%`,
                      height: '100%',
                      background: person === 'Srestho' ? '#3b82f6' : person === 'Shafin' ? '#10b981' : '#a855f7',
                      borderRadius: '9999px',
                      transition: 'width 1s ease-out'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// Main Render with Bottom Navigation
return (
<div className="min-h-screen" style={ { background: 'var(--bg-primary)' }}>
{showCelebration && (
<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-6xl celebrate">
🎉
</div>
)}

<button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
{darkMode ? '☀️': '🌙'}
</button>

{showInstallPrompt && (
<div className="install-prompt">
<div className="flex items-center justify-between">
<div>
<p className="font-bold">
Install SMS Funding
</p>
<p className="text-sm opacity-90">
Get the app experience!
</p>
</div>
<div className="flex gap-2">
<button onClick={handleInstall} className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold">
Install
</button>
<button onClick={() => setShowInstallPrompt(false)} className="px-4 py-2 bg-transparent border border-white rounded-lg">
Later
</button>
</div>
</div>
</div>
)}

{activeTab === 'home' && renderHome()}
{activeTab === 'stats' && renderStats()}

{/* Bottom Navigation */}
<div className="bottom-nav">
<button
onClick={() => setActiveTab('home')}
className={activeTab === 'home' ? 'active': ''}
>
<span className="text-2xl">🏠</span>
<span className="text-xs">Home</span>
</button>

<button
onClick={() => setActiveTab('stats')}
className={activeTab === 'stats' ? 'active': ''}
>
<span className="text-2xl">📊</span>
<span className="text-xs">Stats</span>
</button>
</div>

{/* Footer */}
<div className="footer mx-4">
<div className="footer-company">
⚡ Designed in Stark 98 HQ
</div>
<div className="footer-credit">
Made by Srestho
</div>
</div>
</div>
);
}

ReactDOM.createRoot(document.getElementById('root')).render(<FundingTracker />);