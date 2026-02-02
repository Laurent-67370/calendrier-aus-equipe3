const admin = require('firebase-admin');

// --- DONNÉES DE DÉPART ---

// 1. Liste des joueurs de l'équipe 3
const playersData = [ 
    { id: 1, name: 'Philippe' }, 
    { id: 2, name: 'Jean-Pierre THEODIN' }, 
    { id: 3, name: 'Bernard Wolf' }, 
    { id: 4, name: 'Julien' }, 
    { id: 5, name: 'Laurent Husser' }, 
    { id: 6, name: 'Christine Pontida' }
];

// Fonctions utilitaires
const getDefaultComposition = () => ({ available: [], unavailable: [], noresponse: playersData.map(p => p.id), selected: [] });
const getDefaultScore = () => ({ alsatia: 0, opponent: 0 });

// 2. Liste des matchs de l'équipe 3
const initialMatchesData = [
    // --- MODIFICATION APPLIQUÉE ICI ---
    { 
        id: 'J1', 
        journee: 1, 
        homeTeam: 'OSTWALD ST OSWALD 5', 
        awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', 
        date: '2025-09-18', 
        time: '20h00', 
        venue: 'away', 
        month: 'september',
        composition: { // Composition par défaut pour la J1
            available: [1, 2, 4], // Philippe, JP, Julien
            unavailable: [],
            noresponse: [3, 5, 6],
            selected: [4, 2, 1] // Julien, JP, Philippe comme sur l'image
        }, 
        score: getDefaultScore() // Score initialisé à 0-0
    },
    // Les autres journées sont initialisées normalement
    { id: 'J2', journee: 2, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG ST JEAN 6', date: '2025-10-02', time: '20h15', venue: 'home', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J3', journee: 3, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG CTS 4', date: '2025-10-16', time: '20h15', venue: 'home', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J4', journee: 4, homeTeam: 'STBG RACING CLUB 3', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2025-10-31', time: '20h15', venue: 'away', month: 'october', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J5', journee: 5, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'BISCHHEIM CHEMINOTS T.T. 2', date: '2025-11-20', time: '20h15', venue: 'home', month: 'november', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J6', journee: 6, homeTeam: 'OSTWALD ST OSWALD 7', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2025-12-05', time: '20h00', venue: 'away', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J7', journee: 7, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'VENDENHEIM ENVOLEE 6', date: '2025-12-18', time: '20h15', venue: 'home', month: 'december', composition: getDefaultComposition(), score: getDefaultScore() },
    // --- 2ème Phase 2026 ---
    { id: 'J8', journee: 8, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'OSTWALD ST OSWALD 5', date: '2026-01-22', time: '20h15', venue: 'home', month: 'january', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J9', journee: 9, homeTeam: 'STBG ST JEAN 6', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-01-30', time: '20h15', venue: 'away', month: 'january', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J10', journee: 10, homeTeam: 'STBG CTS 4', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-02-11', time: '20h15', venue: 'away', month: 'february', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J11', journee: 11, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'STBG RACING CLUB 3', date: '2026-03-12', time: '20h15', venue: 'home', month: 'march', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J12', journee: 12, homeTeam: 'BISCHHEIM CHEMINOTS T.T. 2', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-04-03', time: '20h15', venue: 'away', month: 'april', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J13', journee: 13, homeTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', awayTeam: 'OSTWALD ST OSWALD 7', date: '2026-04-23', time: '20h15', venue: 'home', month: 'april', composition: getDefaultComposition(), score: getDefaultScore() },
    { id: 'J14', journee: 14, homeTeam: 'VENDENHEIM ENVOLEE 6', awayTeam: 'ALSATIA UNITAS SCHILTIGHEIM 3', date: '2026-05-15', time: '20h00', venue: 'away', month: 'may', composition: getDefaultComposition(), score: getDefaultScore() }
];

// 3. Données du classement actualisées après 9 journées (janvier 2026)
const initialRankingData = [
    { rang: 1, equipe: "VENDENHEIM ENVOLEE 6", pointsResultat: 39, joues: 9, gagnes: 7, nuls: 1, perdus: 1, pointsJeuGagnes: 67, pointsJeuPerdus: 23, isOurTeam: false },
    { rang: 2, equipe: "STBG RACING CLUB 3", pointsResultat: 36, joues: 9, gagnes: 6, nuls: 2, perdus: 1, pointsJeuGagnes: 61, pointsJeuPerdus: 29, isOurTeam: false },
    { rang: 3, equipe: "ALSATIA UNITAS SCHILTIGHEIM 3", pointsResultat: 34, joues: 9, gagnes: 5, nuls: 2, perdus: 2, pointsJeuGagnes: 62, pointsJeuPerdus: 28, isOurTeam: true },
    { rang: 4, equipe: "OSTWALD ST OSWALD 7", pointsResultat: 30, joues: 8, gagnes: 5, nuls: 1, perdus: 2, pointsJeuGagnes: 52, pointsJeuPerdus: 28, isOurTeam: false },
    { rang: 5, equipe: "STBG CTS 4", pointsResultat: 23, joues: 8, gagnes: 2, nuls: 3, perdus: 3, pointsJeuGagnes: 36, pointsJeuPerdus: 44, isOurTeam: false },
    { rang: 6, equipe: "BISCHHEIM CHEMINOTS T.T. 2", pointsResultat: 20, joues: 9, gagnes: 1, nuls: 4, perdus: 4, pointsJeuGagnes: 32, pointsJeuPerdus: 58, isOurTeam: false },
    { rang: 7, equipe: "STBG ST JEAN 6", pointsResultat: 16, joues: 9, gagnes: 1, nuls: 2, perdus: 6, pointsJeuGagnes: 25, pointsJeuPerdus: 65, isOurTeam: false },
    { rang: 8, equipe: "OSTWALD ST OSWALD 5", pointsResultat: 12, joues: 9, gagnes: 0, nuls: 1, perdus: 8, pointsJeuGagnes: 15, pointsJeuPerdus: 75, isOurTeam: false }
];


// --- Logique d'initialisation (ne pas modifier) ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

exports.handler = async function(event, context) {
  try {
    // Initialisation des matchs
    const matchesCollection = db.collection('matches-equipe3');
    const matchesSnapshot = await matchesCollection.get();
    if (matchesSnapshot.empty) {
        const matchesBatch = db.batch();
        initialMatchesData.forEach(match => {
            const { id, ...matchData } = match;
            matchesBatch.set(matchesCollection.doc(id), matchData);
        });
        await matchesBatch.commit();
    }

    // Initialisation des joueurs
    const playersCollection = db.collection('players-equipe3');
    const playersSnapshot = await playersCollection.get();
    if (playersSnapshot.empty) {
        const playersBatch = db.batch();
        playersData.forEach(player => {
            playersBatch.set(playersCollection.doc(String(player.id)), player);
        });
        await playersBatch.commit();
    }

    // Initialisation du classement
    const rankingCollection = db.collection('ranking-equipe3');
    const rankingSnapshot = await rankingCollection.get();
    if (rankingSnapshot.empty) {
        const rankingBatch = db.batch();
        initialRankingData.forEach(team => {
            rankingBatch.set(rankingCollection.doc(), team);
        });
        await rankingBatch.commit();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Base de données pour l'équipe 3 initialisée ou déjà existante." }),
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base : ", error);
    return { statusCode: 500, body: error.toString() };
  }
};