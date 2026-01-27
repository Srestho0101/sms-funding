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

// Skeleton Loader Component
function SkeletonLoader() {
  return React.createElement('div', {
    className: 'min-h-screen p-4',
    style: {
      background: 'var(--bg-primary)'
    }
  },
    React.createElement('div', {
      className: 'max-w-4xl mx-auto space-y-4'
    },
      React.createElement('div', {
        className: 'skeleton h-32 w-full'
      }),
      React.createElement('div', {
        className: 'skeleton h-64 w-full'
      }),
      React.createElement('div', {
        className: 'grid grid-cols-3 gap-4'
      },
        React.createElement('div', {
          className: 'skeleton h-24'
        }),
        React.createElement('div', {
          className: 'skeleton h-24'
        }),
        React.createElement('div', {
          className: 'skeleton h-24'
        })
      ),
      React.createElement('div', {
        className: 'skeleton h-48 w-full'
      })
    )
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

// Check authentication
useEffect(() => {
const unsubscribe = auth.onAuthStateChanged((user) => {
setUser(user);
setAuthLoading(false);
});
return () => unsubscribe();
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
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
const confettiCount = 50;

for (let i = 0; i < confettiCount; i++) {
const confetti = document.createElement('div');
confetti.className = 'confetti';
confetti.style.left = Math.random() * 100 + '%';
confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
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
return (getGrandTotal() * DONATION_PERCENTAGE) / 100;
};

const getAfterDonation = () => {
return getGrandTotal() - getDonationAmount();
};

const getProgressPercentage = () => {
return Math.min((getAfterDonation() / GOAL_AMOUNT) * 100, 100);
};

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

const handleLogout = () => {
auth.signOut();
};

if (authLoading) {
return <SkeletonLoader />;
}

if (!user) {
return <LoginScreen onLogin={() => setUser(auth.currentUser)} />;
}

if (loading) {
return <SkeletonLoader />;
}

const prediction = getPrediction();
const weeklyStats = getWeeklyStats();

// Render Home Tab
const renderHome = () => (
<div className="p-4 max-w-4xl mx-auto pb-20">
{/* Header */}
<div className="mb-6 rounded-2xl shadow-lg p-6" style={ { background: 'var(--bg-secondary)' }}>
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
<div className="rounded-2xl shadow-lg p-6 mb-6" style={ { background: 'var(--bg-secondary)' }}>
<h2 className="text-xl font-bold mb-4" style={ { color: 'var(--text-primary)' }}>
History
</h2>

{contributions.length === 0 ? (
<p className="text-center py-8" style={ { color: 'var(--text-secondary)' }}>
No contributions yet
</p>
): (
<div className="space-y-2">
{contributions.map(contribution => (
<div
key={contribution.id}
className="p-4 rounded-lg"
style={ { background: 'var(--bg-primary)' }}
>
<div className="flex justify-between items-start mb-2">
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="font-bold" style={ { color: 'var(--text-primary)' }}>
{contribution.person}
</span>
<span className="text-lg font-bold" style={ { color: 'var(--accent)' }}>
৳{contribution.amount}
</span>
</div>
<div className="text-xs" style={ { color: 'var(--text-secondary)' }}>
{contribution.date}
</div>
{contribution.note && (
<div className="text-sm mt-1 italic" style={ { color: 'var(--text-secondary)' }}>
"{contribution.note}"
</div>
)}
</div>

<div className="flex items-center gap-2">
<select
value={deletedBy}
onChange={(e) => setDeletedBy(e.target.value)}
className="px-2 py-1 border rounded text-xs"
style={ {
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
</div>

{/* Deletion History */}
{deletionHistory.length > 0 && (
<div className="rounded-2xl shadow-lg p-6 mb-6 bg-red-50 border-2 border-red-200">
<h2 className="text-xl font-bold text-red-800 mb-4">
🗑️ Deletion History
</h2>

<div className="space-y-2">
{deletionHistory.map(deletion => (
<div
key={deletion.id}
className="p-3 bg-white rounded-lg border border-red-200"
>
<p className="font-semibold text-gray-800 text-sm">
<span className="text-red-600">{deletion.deletedBy}</span> deleted{' '}
<span className="text-indigo-600">{deletion.originalContribution.person}'s</span>{' '}
৳{deletion.originalContribution.amount}
</p>
<p className="text-xs text-gray-500">
{new Date(deletion.deletedAt).toLocaleString()}
</p>
</div>
))}
</div>
</div>
)}
</div>
);

// Render Stats Tab
const renderStats = () => (
<div className="p-4 max-w-4xl mx-auto pb-20">
<div className="rounded-2xl shadow-lg p-6 mb-6" style={ { background: 'var(--bg-secondary)' }}>
<h2 className="text-2xl font-bold mb-4" style={ { color: 'var(--text-primary)' }}>
📊 Weekly Statistics
</h2>

<div className="text-sm mb-4" style={ { color: 'var(--text-secondary)' }}>
Last 7 days contribution breakdown
</div>
{/* Simple Bar Chart using CSS */}
<div className="space-y-4">
{weeklyStats.map((day, idx) => {
const total = day.Srestho + day.Shafin + day.Muwaz;
const maxTotal = Math.max(...weeklyStats.map(d => d.Srestho + d.Shafin + d.Muwaz), 1);

return (
<div key={idx}>
<div className="text-xs mb-1" style={ { color: 'var(--text-secondary)' }}>
{new Date(day.date).toLocaleDateString('en-US', {
month: 'short', day: 'numeric'
})}
</div>

<div className="flex gap-1 h-8">
<div
className="bg-blue-500 rounded transition-all"
style={ { width: `${(day.Srestho / maxTotal) * 100}%` }}
title={`Srestho: ৳${day.Srestho}`}
></div>
<div
className="bg-green-500 rounded transition-all"
style={ { width: `${(day.Shafin / maxTotal) * 100}%` }}
title={`Shafin: ৳${day.Shafin}`}
></div>
<div
className="bg-purple-500 rounded transition-all"
style={ { width: `${(day.Muwaz / maxTotal) * 100}%` }}
title={`Muwaz: ৳${day.Muwaz}`}
></div>
</div>

<div className="text-xs mt-1 font-semibold" style={ { color: 'var(--text-primary)' }}>
Total: ৳{total}
</div>
</div>
);
})}
</div>

{/* Legend */}
<div className="flex gap-4 mt-6 justify-center">
<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-blue-500 rounded"></div>
<span className="text-xs" style={ { color: 'var(--text-primary)' }}>Srestho</span>
</div>
<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-green-500 rounded"></div>
<span className="text-xs" style={ { color: 'var(--text-primary)' }}>Shafin</span>
</div>
<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-purple-500 rounded"></div>
<span className="text-xs" style={ { color: 'var(--text-primary)' }}>Muwaz</span>
</div>
</div>
</div>

{/* Summary Cards */}
<div className="grid grid-cols-2 gap-4 mb-6">
<div className="rounded-xl shadow p-4" style={ { background: 'var(--bg-secondary)' }}>
<div className="text-sm" style={ { color: 'var(--text-secondary)' }}>
This Week
</div>
<div className="text-2xl font-bold" style={ { color: 'var(--accent)' }}>
৳{weeklyStats.reduce((sum, d) => sum + d.Srestho + d.Shafin + d.Muwaz, 0)}
</div>
</div>

<div className="rounded-xl shadow p-4" style={ { background: 'var(--bg-secondary)' }}>
<div className="text-sm" style={ { color: 'var(--text-secondary)' }}>
Avg/Day
</div>
<div className="text-2xl font-bold" style={ { color: 'var(--accent)' }}>
৳{(weeklyStats.reduce((sum, d) => sum + d.Srestho + d.Shafin + d.Muwaz, 0) / 7).toFixed(0)}
</div>
</div>
</div>
</div>
);

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